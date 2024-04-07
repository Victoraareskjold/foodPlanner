import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import colors from "../../styles/colors";

const generateWeekDates = () => {
  let dates = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    let newDate = new Date(today);
    newDate.setDate(today.getDate() + i);
    dates.push(
      newDate.toLocaleDateString("no-NO", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      })
    ); // Formatert etter ønske
  }
  return dates;
};

export default function WeeklyMenu() {
  const navigation = useNavigation();
  const weekDates = generateWeekDates();
  const [familyId, setFamilyId] = useState(null);
  const [recipesForTheWeek, setRecipesForTheWeek] = useState({});

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          console.log("User data fetched");
          setFamilyId(docSnap.data().familyId);
        } else {
          console.log("No user data found");
        }
      });
    }
  }, []);

  useEffect(() => {
    if (!familyId) return;

    const unsubscribes = [];

    weekDates.forEach((date) => {
      // Bruker datoen direkte uten å endre formatet
      const docRef = doc(db, "families", familyId, "weekMenu", date);

      const unsubscribe = onSnapshot(
        docRef,
        (doc) => {
          if (doc.exists()) {
            console.log(`Data found for ${date}:`, doc.data());
            setRecipesForTheWeek((prevRecipes) => ({
              ...prevRecipes,
              [date]: doc.data().recipeTitle,
            }));
          } else {
            console.log(`No data found for ${date}`);
          }
        },
        (error) =>
          console.error(`Error fetching recipe for date ${date}`, error)
      );

      unsubscribes.push(unsubscribe);
    });

    // Cleanup function
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, [familyId]);

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View style={styles.header}>
        <Text style={fonts.header}>Ukes meny</Text>
      </View>

      {weekDates.map((date, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayText}>{date}</Text>
          {recipesForTheWeek[date] ? (
            <Text style={styles.recipeText}>{recipesForTheWeek[date]}</Text>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingHorizontal: 20,
    marginTop: 32,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
  },
  dayContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
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
    fontSize: 18,
  },
});
