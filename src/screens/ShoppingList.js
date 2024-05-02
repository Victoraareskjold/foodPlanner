import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { db, auth } from "../../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import containerStyles from "../../styles/containerStyles";

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const familyId = userDocSnap.data().familyId;
          const weekMenuRef = collection(db, "families", familyId, "weekMenu");
          const weekMenuSnap = await getDocs(weekMenuRef);
          let recipeCounts = {}; // Objekt for å telle antall forekomster av hver recipeId
          weekMenuSnap.forEach((doc) => {
            const recipeId = doc.data().recipeId;
            recipeCounts[recipeId] = (recipeCounts[recipeId] || 0) + 1; // Inkrementer tellingen for hver recipeId
          });

          const recipesQuery = query(
            collection(db, "recipes"),
            where("familyId", "==", familyId)
          );
          const recipesSnapshot = await getDocs(recipesQuery);
          let ingredientMap = {}; // For å aggregere ingredienser
          recipesSnapshot.forEach((doc) => {
            const count = recipeCounts[doc.id] || 0;
            if (count > 0) {
              const recipeIngredients = doc.data().ingredients || [];
              recipeIngredients.forEach((ingredient) => {
                if (ingredient.name && ingredient.name.length > 1) {
                  const key = `${ingredient.name.toLowerCase()}|${
                    ingredient.unit
                  }`;
                  const quantityToAdd = parseFloat(ingredient.quantity) * count;
                  if (ingredientMap[key]) {
                    ingredientMap[key].quantity += quantityToAdd;
                  } else {
                    ingredientMap[key] = {
                      ...ingredient,
                      quantity: quantityToAdd,
                    };
                  }
                }
              });
            }
          });

          const aggregatedIngredients = Object.values(ingredientMap);
          setIngredients(aggregatedIngredients);
        } else {
          console.log("No user data found");
        }
      }
    };

    fetchIngredients();
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.container}>
        <SafeAreaView />
        <View style={[containerStyles.defaultContainer, { gap: 32 }]}>
          <View style={styles.list}>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItems}>
                <TouchableOpacity style={styles.listItem}>
                  <View style={styles.listText}>
                    <Text>{ingredient.quantity}</Text>
                    <Text>{ingredient.unit}</Text>
                    <Text style={{ marginStart: 8 }}>{ingredient.name}</Text>
                  </View>
                  <View style={styles.checkBox}></View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  list: {
    gap: 12,
  },
  listItems: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 5,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listText: {
    flexDirection: "row",
    gap: 4,
  },
  checkBox: {
    height: 16,
    width: 16,
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 50,
  },
});
