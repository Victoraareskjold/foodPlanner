import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { useMemo } from "react";
import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import colors from "../../styles/colors";
import Check from "../../assets/SVGs/Check";
import images from "../../styles/images";
import Timer from "../../assets/SVGs/Timer";
import Trash from "../../assets/SVGs/Trash";
import HeaderComponent from "../components/HeaderComponent";
import Plus from "../../assets/SVGs/Plus";

const generateWeekDates = () => {
  let dates = [];
  const today = new Date();
  const startOfWeek = new Date(today);
  const dayOfWeek = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);

  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    let newDate = new Date(startOfWeek);
    newDate.setDate(startOfWeek.getDate() + i);
    dates.push(
      newDate.toLocaleDateString("no-NO", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    );
  }
  return dates;
};

const getCurrentDate = () => {
  const today = new Date();
  return today.toLocaleDateString("no-NO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
};

export default function WeeklyMenu() {
  const navigation = useNavigation();
  const weekDates = useMemo(() => generateWeekDates(), []);
  const [familyId, setFamilyId] = useState(null);
  const [recipesForWeek, setRecipesForWeek] = useState({});
  const [ingredients, setIngredients] = useState([]);

  const [modalVisible, setModalVisible] = useState(false);
  const [completedIngredients, setCompletedIngredients] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [shoppingList, setShoppingList] = useState([]);
  const [image, setImage] = useState(null);

  const currentDate = getCurrentDate();

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setFamilyId(userDocSnap.data().familyId);
        }
      }
    };

    fetchData();
  }, []);

  const getWeekId = () => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today - new Date(today.getFullYear(), 0, 1)) / 86400000 + 1
    );
    const weekNumber = Math.ceil((dayOfYear - today.getDay() + 10) / 7);

    return `Year${today.getFullYear()}- Week${weekNumber}`;
  };

  useEffect(() => {
    console.log("Family ID:", familyId);
    console.log("Week Dates:", weekDates);
    if (familyId) {
      console.log("Subscribing to week dates changes.");
      const unsubscribes = weekDates.map((date) => {
        const docRef = doc(db, "families", familyId, "weekMenu", date);
        return onSnapshot(docRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const recipeId = docSnapshot.data().recipeId;
            console.log(`Recipe ID for ${date}:`, recipeId);
            fetchRecipeDetails(recipeId, date, docSnapshot.data().portions);
          } else {
            console.log(`No document found for ${date}`);
          }
        });
      });

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
        console.log("Unsubscribed from week dates changes.");
      };
    }
  }, [familyId, weekDates]);

  const fetchRecipeDetails = async (recipeId, date, weeklyMenuPortions) => {
    if (!recipeId) return;
    const recipeDocRef = doc(db, "families", familyId, "recipes", recipeId);
    const recipeDocSnap = await getDoc(recipeDocRef);
    if (recipeDocSnap.exists()) {
      const recipeData = recipeDocSnap.data();
      const recipePortions = recipeData.portions;
      const portionDifference = weeklyMenuPortions / recipePortions;

      setRecipesForWeek((prevRecipes) => ({
        ...prevRecipes,
        [date]: {
          ...recipeData,
          portions: weeklyMenuPortions, // Set weeklyMenu portions
          portionDifference: portionDifference, // Store the portion difference
        },
      }));
      setImage(recipeData.image);
    } else {
      console.error(`No recipe found with id ${recipeId}`);
    }
  };

  const fetchRecipesForWeek = async () => {
    console.log("Fetching recipes for the week...");
    if (auth.currentUser && familyId) {
      const weekMenuRef = collection(db, "families", familyId, "weekMenu");
      const weekMenuSnap = await getDocs(weekMenuRef);

      let recipeCounts = {};
      weekMenuSnap.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        if (weekDates.includes(data.date)) {
          recipeCounts[data.recipeId] = (recipeCounts[data.recipeId] || 0) + 1;
        }
      });

      const recipesQuery = query(
        collection(db, "families", familyId, "recipes"),
        where("familyId", "==", familyId)
      );
      const recipesSnapshot = await getDocs(recipesQuery);

      let ingredientMap = {};
      recipesSnapshot.forEach((docSnapshot) => {
        const count = recipeCounts[docSnapshot.id] || 0;
        if (count > 0) {
          docSnapshot.data().ingredients?.forEach((ingredient) => {
            if (ingredient.name && ingredient.name.length > 1) {
              const key = `${ingredient.name.toLowerCase()}|${ingredient.unit}`;
              const quantityToAdd = parseFloat(ingredient.quantity) * count;
              if (!ingredientMap[key]?.completed) {
                ingredientMap[key] = ingredientMap[key]
                  ? {
                      ...ingredientMap[key],
                      quantity: ingredientMap[key].quantity + quantityToAdd,
                    }
                  : { ...ingredient, quantity: quantityToAdd };
              }
            }
          });
        }
      });

      const aggregatedIngredients = Object.values(ingredientMap);
      setIngredients(aggregatedIngredients.filter((ing) => !ing.completed));
    }
  };

  useEffect(() => {
    if (familyId && weekDates.length > 0) {
      fetchRecipesForWeek();
    }
  }, [familyId, weekDates]);

  const addToShoppingList = () => {
    const adjustedIngredients = [];

    Object.keys(recipesForWeek).forEach((date) => {
      const recipe = recipesForWeek[date];
      const portionDifference = recipe.portionDifference || 1;

      recipe.ingredients.forEach((ingredient) => {
        const adjustedQuantity = ingredient.quantity * portionDifference;
        const existingIngredientIndex = adjustedIngredients.findIndex(
          (ing) => ing.name === ingredient.name && ing.unit === ingredient.unit
        );

        if (existingIngredientIndex >= 0) {
          adjustedIngredients[existingIngredientIndex].quantity +=
            adjustedQuantity;
        } else {
          adjustedIngredients.push({
            ...ingredient,
            quantity: adjustedQuantity,
          });
        }
      });
    });

    setShoppingList(adjustedIngredients);
    setIngredients(adjustedIngredients); // Also update the ingredients shown in the modal
    setModalVisible(true);
  };

  const confirmShoppingList = async () => {
    if (familyId) {
      const shoppingListRef = doc(
        db,
        "families",
        familyId,
        "shoppingList",
        "ingredients"
      );

      await setDoc(
        shoppingListRef,
        { ingredients: shoppingList },
        { merge: true }
      );

      setModalVisible(false);
      alert("Ingredienser lagt til i handleliste!");
      navigation.navigate("ShoppingListStackGroup");
    }
  };

  const handleCompleteIngredient = async (ingredient) => {
    if (familyId) {
      const ingredientRef = doc(
        db,
        "families",
        familyId,
        "completedIngredients",
        ingredient.name
      );

      await setDoc(ingredientRef, {
        name: ingredient.name,
        unit: ingredient.unit,
        quantity: ingredient.quantity,
        completed: true,
      });

      setIngredients((prevIngredients) =>
        prevIngredients.filter(
          (ing) => ing.name !== ingredient.name || ing.unit !== ingredient.unit
        )
      );
      setCompletedIngredients((prevCompleted) => [
        ...prevCompleted,
        { ...ingredient, completed: true },
      ]);
    }
  };

  const handleUncompleteIngredient = async (ingredient) => {
    if (familyId) {
      const ingredientRef = doc(
        db,
        "families",
        familyId,
        "completedIngredients",
        ingredient.name
      );
      await deleteDoc(ingredientRef);

      setCompletedIngredients((prevCompleted) =>
        prevCompleted.filter(
          (ing) => ing.name !== ingredient.name || ing.unit !== ingredient.unit
        )
      );
      setIngredients((prevIngredients) => [
        ...prevIngredients,
        { ...ingredient, completed: false },
      ]);
    }
  };

  const handleDeleteRecipe = async (date) => {
    Alert.alert(
      "Bekreft sletting",
      "Er du sikker på at du vil slette denne oppskriften?",
      [
        {
          text: "Avbryt",
          style: "cancel",
        },
        {
          text: "Slett",
          onPress: async () => {
            if (familyId) {
              const recipeRef = doc(db, "families", familyId, "weekMenu", date);
              await deleteDoc(recipeRef);

              setRecipesForWeek((prevRecipes) => {
                const updatedRecipes = { ...prevRecipes };
                delete updatedRecipes[date];
                return updatedRecipes;
              });
              fetchRecipesForWeek();
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handlePortionsChange = async (date, newPortions) => {
    setRecipesForWeek((prevRecipes) => ({
      ...prevRecipes,
      [date]: {
        ...prevRecipes[date],
        portions: newPortions,
      },
    }));

    if (familyId) {
      const weekMenuDocRef = doc(db, "families", familyId, "weekMenu", date);
      try {
        await setDoc(
          weekMenuDocRef,
          { portions: newPortions },
          { merge: true }
        );
        console.log(`Updated portions for ${date} to ${newPortions}`);
      } catch (error) {
        console.error("Error updating portions: ", error);
      }
    }
  };

  const rightButton = () => (
    <TouchableOpacity
      style={[
        styles.modalButtonClose,
        {
          alignSelf: "flex-end",
          backgroundColor: colors.lightGrey,
        },
      ]}
      onPress={() => setModalVisible(!modalVisible)}
    >
      <Text
        style={[
          fonts.btnBody,
          { alignSelf: "center", color: colors.defaultLight },
        ]}
      >
        x
      </Text>
    </TouchableOpacity>
  );

  return (
    <View
      style={[
        containerStyles.defaultContainer,
        { paddingHorizontal: 0, gap: 0 },
      ]}
    >
      <SafeAreaView />
      {/* Week menu list */}
      <ScrollView>
        <View style={{ paddingBottom: 32 }}>
          {weekDates.map((date, index) => (
            <View key={index} style={styles.dayContainer}>
              <Text
                style={[
                  styles.dayText,
                  date === currentDate && {
                    color: colors.dark,
                    fontSize: 18,
                  },
                ]}
              >
                {date}
              </Text>
              {recipesForWeek[date] ? (
                <View style={styles.mealContainer}>
                  {image ? (
                    <Image source={{ uri: image }} style={[images.mealImage]} />
                  ) : (
                    <Image
                      source={require("../../assets/placeholderImage.png")}
                      style={images.mealImage}
                    />
                  )}
                  <View style={styles.mealInfo}>
                    <View style={{ justifyContent: "center", gap: 4 }}>
                      <Text style={styles.recipeText}>
                        {recipesForWeek[date].title}
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 4,
                          alignItems: "center",
                        }}
                      >
                        <Timer />
                        <Text style={styles.recipeTime}>
                          {recipesForWeek[date].time} min
                        </Text>
                      </View>
                      <Text style={styles.recipeText}>
                        {recipesForWeek[date].categories.join(", ")}
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={String(recipesForWeek[date]?.portions || "")}
                        onChangeText={(text) =>
                          handlePortionsChange(date, parseInt(text) || 0)
                        }
                      />
                    </View>
                    <View style={{ justifyContent: "center" }}>
                      <TouchableOpacity
                        style={{
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          alignItems: "center",
                        }}
                        onPress={() => handleDeleteRecipe(date)}
                      >
                        <Trash />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() =>
                    navigation.navigate("AddMeal", {
                      currentDay: date,
                      onMealAdded: fetchRecipesForWeek, // Sender tilbakeringingsfunksjonen
                    })
                  }
                >
                  <Text style={styles.addButtonText}>Legg til oppskrift</Text>
                  <Plus />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Complete menu */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.buttonClose}
          onPress={addToShoppingList}
        >
          <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
            Fullfør
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalView}>
          <View style={styles.modalContainer}>
            <HeaderComponent
              headerText="Add to groceries"
              rightButton={rightButton}
            />

            <ScrollView
              contentContainerStyle={{ gap: 20 }}
              style={{ overflow: "hidden", zIndex: 0 }}
            >
              <View style={styles.list}>
                {ingredients.map((ingredient, index) => (
                  <TouchableOpacity
                    onPress={() => handleCompleteIngredient(ingredient)}
                    key={`${ingredient.name.toLowerCase()}|${index}`}
                    style={styles.listItem}
                  >
                    <View style={styles.listText}>
                      <View
                        style={{ minWidth: 48, flexDirection: "row", gap: 4 }}
                      >
                        <Text>{ingredient.quantity}</Text>
                        <Text>{ingredient.unit}</Text>
                      </View>
                      <Text
                        style={{
                          marginStart: 8,
                          fontSize: 16,
                          fontWeight: "500",
                        }}
                      >
                        {ingredient.name}
                      </Text>
                    </View>
                    <View style={styles.checkBox}></View>
                  </TouchableOpacity>
                ))}
                {showCompleted && completedIngredients.length > 0 && (
                  <View style={styles.list}>
                    {completedIngredients.map((ingredient, index) => (
                      <TouchableOpacity
                        onPress={() => handleUncompleteIngredient(ingredient)}
                        key={`completed-${ingredient.name.toLowerCase()}|${index}`}
                        style={styles.listItem}
                      >
                        <View style={styles.listText}>
                          <View
                            style={{
                              minWidth: 48,
                              flexDirection: "row",
                              gap: 4,
                            }}
                          >
                            <Text>{ingredient.quantity}</Text>
                            <Text>{ingredient.unit}</Text>
                          </View>
                          <Text
                            style={{
                              marginStart: 8,
                              fontSize: 16,
                              fontWeight: "500",
                            }}
                          >
                            {ingredient.name}
                          </Text>
                        </View>
                        <View style={styles.checkedBox}>
                          <Check />
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
              onPress={confirmShoppingList}
            >
              <Text
                style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}
              >
                Add {ingredients.length} items
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgColor,
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
  },
  dayContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 0,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 4,
  },
  addButton: {
    padding: 16,
    marginTop: 5,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  addButtonText: {
    color: colors.primary,
    textAlign: "center",
  },
  recipeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  recipeTime: {
    fontSize: 12,
  },
  modalView: {
    backgroundColor: "rgba(0, 0, 0, .4)",
    flex: 1,
    padding: 20,
    paddingTop: 64,
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    gap: 20,
  },
  list: {
    gap: 8,
  },
  listItems: {
    marginBottom: 8,
    flex: 1,
    backgroundColor: "red",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
  },
  listText: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  checkBox: {
    height: 20,
    width: 20,
    borderColor: "#E1E8F9",
    borderWidth: 1.5,
    borderRadius: 10,
  },
  checkedBox: {
    height: 20,
    width: 20,
    backgroundColor: "#185BF0",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 10,
  },
  modalButtonClose: {
    backgroundColor: "#185BF0",
    height: 24,
    width: 24,
    borderRadius: 10,
    justifyContent: "center",
  },
  mealContainer: {
    backgroundColor: colors.secondary,
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
  },
  mealInfo: {
    paddingHorizontal: 12,
    justifyContent: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
});
