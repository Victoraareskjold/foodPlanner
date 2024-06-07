import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, getDoc } from "firebase/firestore";
import useFamilyId from "./useFamilyId";

const useFamilyShoppingList = (weekId) => {
  const [shoppingList, setShoppingList] = useState([]);
  const { familyId, loading } = useFamilyId();

  useEffect(() => {
    const fetchShoppingList = async () => {
      if (familyId) {
        try {
          const shoppingListRef = doc(
            db,
            "families",
            familyId,
            "shoppingLists",
            weekId
          );

          const shoppingListSnap = await getDoc(shoppingListRef);
          if (shoppingListSnap.exists()) {
            const data = shoppingListSnap.data();
            setShoppingList(data.ingredients || []);
          } else {
            setShoppingList([]);
          }
        } catch (error) {
          console.error("Error fetching shopping list:", error);
        }
      }
    };

    if (!loading) {
      fetchShoppingList();
    }
  }, [familyId, weekId, loading]);

  return shoppingList;
};

export default useFamilyShoppingList;
