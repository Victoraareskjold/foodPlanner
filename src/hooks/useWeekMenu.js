import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";
import useFamilyId from "./useFamilyId";

const useWeekMenu = (weekDates) => {
  const [weekMenu, setWeekMenu] = useState({});
  const { familyId, loading } = useFamilyId();

  useEffect(() => {
    if (familyId) {
      const unsubscribes = weekDates.map((date) => {
        const docRef = doc(db, "families", familyId, "weekMenu", date);
        return onSnapshot(docRef, (docSnapshot) => {
          if (docSnapshot.exists()) {
            const recipeId = docSnapshot.data().recipeId;
            setWeekMenu((prevMenu) => ({
              ...prevMenu,
              [date]: recipeId,
            }));
          }
        });
      });

      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    }
  }, [familyId, weekDates, loading]);

  return weekMenu;
};

export default useWeekMenu;
