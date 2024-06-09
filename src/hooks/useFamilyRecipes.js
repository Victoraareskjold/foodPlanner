import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import useFamilyId from "./useFamilyId";

const useFamilyRecipes = () => {
  const [recipeData, setRecipeData] = useState([]);
  const { familyId, loading } = useFamilyId();

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

    if (!loading) {
      fetchRecipes();
    }
  }, [familyId, loading]);

  return recipeData;
};

export default useFamilyRecipes;
