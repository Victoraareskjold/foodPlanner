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
  addDoc,
  documentId,
} from "firebase/firestore";
import { useMemo } from "react";
import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import colors from "../../styles/colors";
import Check from "../../assets/SVGs/Check";
import images from "../../styles/images";
import Timer from "../../assets/SVGs/Timer";
import Trash from "../../assets/SVGs/Trash";

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
            fetchRecipeDetails(recipeId, date);
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

  const fetchRecipeDetails = async (recipeId, date) => {
    if (!recipeId) return;
    const recipeDocRef = doc(db, "families", familyId, "recipes", recipeId);
    const recipeDocSnap = await getDoc(recipeDocRef);
    if (recipeDocSnap.exists()) {
      setRecipesForWeek((prevRecipes) => ({
        ...prevRecipes,
        [date]: recipeDocSnap.data(),
      }));
      setImage(recipeDocSnap.data().image);
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
    setShoppingList(ingredients);
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
              <Text style={styles.dayText}>{date}</Text>
              {recipesForWeek[date] ? (
                <View style={styles.mealContainer}>
                  {image ? (
                    <Image source={{ uri: image }} style={[images.mealImage]} />
                  ) : (
                    <Image
                      source={require("../../assets/vedBilde.png")}
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

                      {/* <Text style={styles.recipeText}>
                    {recipesForWeek[date].categories.join(", ")}
                  </Text> */}
                    </View>
                    <View style={{ justifyContent: "center" }}>
                      <TouchableOpacity
                        style={{
                          justifyContent: "center",
                          width: 32,
                          height: 32,
                          alignItems: "center",
                        }}
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
                    navigation.navigate("AddMeal", { currentDay: date })
                  }
                >
                  <Text style={styles.addButtonText}>Legg til Oppskrift</Text>
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
            <View
              style={[
                fonts.header,
                {
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              ]}
            >
              <Text style={fonts.subHeader}>Hva har du fra før av?</Text>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.buttonClose,
                  { alignSelf: "flex-end", backgroundColor: colors.lightGrey },
                ]}
                onPress={() => setModalVisible(!modalVisible)}
              >
                <Text
                  style={[
                    fonts.btnBody,
                    { alignSelf: "center", color: colors.defaultLight },
                  ]}
                >
                  Lukk
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ gap: 20 }}
              style={{ overflow: "visible", zIndex: 0 }}
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
                Legg til i handleliste
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
    backgroundColor: "#FCFCFC",
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
  },
  dayContainer: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    gap: 10,
  },
  dayText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: colors.lightBlue,
    padding: 12,
    marginTop: 5,
    borderRadius: 5,
  },
  addButtonText: {
    color: colors.blue,
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
    borderRadius: 5,
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
    borderRadius: 5,
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
    borderRadius: 5,
  },
  checkedBox: {
    height: 20,
    width: 20,
    backgroundColor: "#185BF0",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonClose: {
    backgroundColor: "#185BF0",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
  },
  mealContainer: {
    backgroundColor: colors.white,
    flexDirection: "row",
    borderRadius: 5,
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
