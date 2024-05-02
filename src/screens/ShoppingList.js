import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
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

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    const fetchIngredients = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const familyId = userDocSnap.data().familyId;
          const q = query(
            collection(db, "recipes"),
            where("familyId", "==", familyId)
          );
          const querySnapshot = await getDocs(q);
          let allIngredients = [];

          querySnapshot.forEach((doc) => {
            const recipeIngredients = doc.data().ingredients || [];
            allIngredients.push(...recipeIngredients);
          });

          setIngredients(allIngredients);
        } else {
          console.log("No user data found");
        }
      }
    };

    fetchIngredients();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {ingredients.map((ingredient, index) => (
        <View key={index} style={styles.ingredientContainer}>
          <TouchableOpacity>
            <Text>
              {ingredient.quantity}
              {ingredient.unit}
              {ingredient.name}
            </Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  ingredientContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
  },
});
