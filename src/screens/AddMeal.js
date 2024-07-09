import { View } from "react-native";
import { useState, useEffect } from "react";

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

import SearchBar from "../components/SearchBar";
import HeaderComponent from "../components/HeaderComponent";
import containerStyles from "../../styles/containerStyles";
import RecipeList from "../components/RecipeList";

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
          collection(db, "families", familyId, "recipes"),
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
      portions: recipe.portions, // Legg til porsjoner her
    };

    try {
      await setDoc(dayDocRef, dayData);
    } catch (error) {
      console.error("Feil ved lagring av oppskrift", error);
    }
  };

  return (
    <View style={[containerStyles.defaultContainer, { paddingHorizontal: 0 }]}>
      <HeaderComponent headerText="Velg en oppskrift" leftButton={true} />
      <View style={{ paddingHorizontal: 20 }}>
        <SearchBar placeholder={"søk etter oppskrifter"} />
      </View>
      <RecipeList recipes={recipeData} onPressItem={handleSaveRecipe} />
    </View>
  );
}
