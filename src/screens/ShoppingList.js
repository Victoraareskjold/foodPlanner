import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
  Image,
} from "react-native";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteField,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import containerStyles from "../../styles/containerStyles";
import fonts from "../../styles/fonts";
import Check from "../../assets/SVGs/Check";

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [completedIngredients, setCompletedIngredients] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);

  const fetchIngredients = async () => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const familyId = userDocSnap.data().familyId;
        const weekMenuRef = collection(db, "families", familyId, "weekMenu");
        const weekMenuSnap = await getDocs(weekMenuRef);
        let recipeCounts = {};
        weekMenuSnap.forEach((doc) => {
          recipeCounts[doc.data().recipeId] =
            (recipeCounts[doc.data().recipeId] || 0) + 1;
        });

        const recipesQuery = query(
          collection(db, "recipes"),
          where("familyId", "==", familyId)
        );
        const recipesSnapshot = await getDocs(recipesQuery);
        let ingredientMap = {};
        recipesSnapshot.forEach((doc) => {
          const count = recipeCounts[doc.id] || 0;
          if (count > 0) {
            doc.data().ingredients?.forEach((ingredient) => {
              if (ingredient.name && ingredient.name.length > 1) {
                const key = `${ingredient.name.toLowerCase()}|${
                  ingredient.unit
                }`;
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

        // Hente fullførte ingredienser
        const completedRef = collection(
          db,
          "families",
          familyId,
          "completedIngredients"
        );
        const completedSnap = await getDocs(completedRef);
        completedSnap.forEach((doc) => {
          const data = doc.data();
          const key = `${data.name.toLowerCase()}|${data.unit}`;
          ingredientMap[key] = { ...data, completed: true };
        });

        const aggregatedIngredients = Object.values(ingredientMap);
        setIngredients(aggregatedIngredients.filter((ing) => !ing.completed));
        setCompletedIngredients(
          aggregatedIngredients.filter((ing) => ing.completed)
        );
      } else {
        console.log("No user data found");
      }
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const handleCompleteIngredient = async (ingredient) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const familyId = userDocSnap.data().familyId;
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
        if ((ingredientRef, (completed = true))) {
          handleUncompleteIngredient(ingredient);
        }
        fetchIngredients(); // Oppdater visningen etter å ha endret tilstanden
      }
    }
  };

  const handleUncompleteIngredient = async (ingredient) => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const familyId = userDocSnap.data().familyId;
        const ingredientRef = doc(
          db,
          "families",
          familyId,
          "completedIngredients",
          ingredient.name
        );
        await deleteDoc(ingredientRef, {
          ingredient,
        });
        fetchIngredients(); // Oppdater visningen etter å ha endret tilstanden
      }
    }
  };

  const toggleCompletedList = () => {
    setShowCompleted(!showCompleted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <View style={styles.container}>
        <SafeAreaView />
        <View style={styles.header}>
          <Text style={fonts.header}>Handleliste</Text>
        </View>
        <View style={[containerStyles.defaultContainer, { gap: 32 }]}>
          <ScrollView>
            <View style={styles.list}>
              {ingredients.map((ingredient, index) => (
                <TouchableOpacity
                  onPress={() => handleCompleteIngredient(ingredient)}
                  key={`${ingredient.name.toLowerCase()}|${index}`}
                  style={styles.listItem}
                >
                  <View style={styles.listText}>
                    <Text>{ingredient.quantity}</Text>
                    <Text>{ingredient.unit}</Text>
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
            </View>
          </ScrollView>
          <TouchableOpacity onPress={toggleCompletedList}>
            <Text>{showCompleted ? "Skjul fullførte" : "Vis fullførte"}</Text>
          </TouchableOpacity>
          <ScrollView>
            {showCompleted && completedIngredients.length > 0 && (
              <View style={styles.list}>
                {completedIngredients.map((ingredient, index) => (
                  <TouchableOpacity
                    onPress={() => handleUncompleteIngredient(ingredient)}
                    key={`completed-${ingredient.name.toLowerCase()}|${index}`}
                    style={styles.listItem}
                  >
                    <View style={styles.listText}>
                      <Text>{ingredient.quantity}</Text>
                      <Text>{ingredient.unit}</Text>
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
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
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
  header: {
    paddingHorizontal: 20,
    marginTop: 12,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
  },
});
