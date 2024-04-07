import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  query,
  where,
  setDoc,
  getDocs,
} from "firebase/firestore";

import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";

import SearchBar from "../components/SearchBar";

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

export default function AddMeal({ route, navigation }) {
  const { currentDay } = route.params;

  const [recipeData, setRecipeData] = useState([]);
  const weekDates = generateWeekDates();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [familyId, setFamilyId] = useState(null);

  const handleSaveRecipe = async (recipe) => {
    console.log("Lagrer oppskrift", recipe.title); // Logging
    try {
      await saveRecipeForDay(currentDay, recipe);
      console.log("Oppskrift lagret suksessfullt");
      alert("Oppskrift lagret for " + currentDay); // Behold denne alerten
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
      console.log("Oppskrift lagret for dagen!"); // Behold logging, men fjern alert her
    } catch (error) {
      console.error("Feil ved lagring av oppskrift", error);
    }
  };

  useEffect(() => {
    const fetchFamilyId = async () => {
      if (auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setFamilyId(userData.familyId); // Oppdaterer familyId tilstand
          } else {
            console.log("Kan ikke finne brukerdata");
          }
        } catch (error) {
          console.error("Feil ved henting av brukerdata", error);
        }
      }
    };

    fetchFamilyId();
  }, []); // Denne useEffect kjører kun ved montering

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
          console.log(fetchedRecipes);
          setRecipeData(fetchedRecipes);
        } catch (error) {
          console.error("Feil ved henting av oppskrifter", error);
        }
      }
    };

    fetchRecipes();
  }, [familyId]);

  return (
    <View style={styles.container}>
      <SafeAreaView />

      {/* Header */}
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
          <Text style={fonts.header}>Ukes meny</Text>
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
  dayContainer: {},
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
  modalView: {
    padding: 20,
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
