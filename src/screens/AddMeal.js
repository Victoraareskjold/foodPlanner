import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  getDocs,
} from "firebase/firestore";

import fonts from "../../styles/fonts";

export default function AddMeal({ route, navigation }) {
  const { currentDay, onMealAdded } = route.params;

  const [recipeData, setRecipeData] = useState([]);
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    const fetchFamilyId = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFamilyId(userData.familyId);
          } else {
            console.log("Kan ikke finne brukerdata");
          }
        } catch (error) {
          console.error("Feil ved henting av brukerdata", error);
        }
      }
    };

    fetchFamilyId();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (familyId) {
        const familyRecipesRef = query(
          collection(db, "recipes"),
          where("familyId", "==", familyId)
        );
        try {
          const snapshot = await getDocs(familyRecipesRef);
          const fetchedRecipes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecipeData(fetchedRecipes);
        } catch (error) {
          console.error("Feil ved henting av oppskrifter", error);
        }
      }
    };

    fetchRecipes();
  }, [familyId]);

  const handleSaveRecipe = async (recipe) => {
    try {
      await saveRecipeForDay(currentDay, recipe);
      if (onMealAdded) onMealAdded();
      navigation.goBack();
    } catch (error) {
      console.error("Feil ved lagring av oppskrift", error);
      alert("Kunne ikke lagre oppskriften. Prøv igjen.");
    }
  };

  const saveRecipeForDay = async (day, recipe) => {
    if (!familyId) {
      console.log("Family ID er ikke satt");
      return;
    }

    const dayDocRef = doc(
      db,
      "families",
      familyId,
      "weekMenu",
      day.replaceAll("/", "-")
    );

    const dayData = {
      date: day,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    };

    try {
      await setDoc(dayDocRef, dayData);
    } catch (error) {
      console.error("Feil ved lagring av oppskrift", error);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />

      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 32,
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={fonts.header}>Dine oppskrifter</Text>
        </View>
      </View>

      <View style={styles.container}>
        <FlatList
          data={recipeData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.recipeItem}
              onPress={() => handleSaveRecipe(item)}
            >
              <Text style={styles.recipeText}>{item.title}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  recipeItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  recipeText: {
    fontSize: 18,
  },
});
