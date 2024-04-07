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

export default function WeeklyMenu() {
  const [recipeData, setRecipeData] = useState([]);
  const weekDates = generateWeekDates();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentDay, setCurrentDay] = useState(null);
  const [familyId, setFamilyId] = useState(null);
  const [selectedRecipesForWeek, setSelectedRecipesForWeek] = useState({});

  useEffect(() => {
    const fetchRecipes = async () => {
      if (familyId) {
        const familyRecipesRef = query(
          collection(db, "recipes"),
          where("familyId", "==", familyId)
        );
        try {
          const snapshot = await getDocs(familyRecipesRef);
          const fetchedRecipes = [];
          snapshot.forEach((doc) =>
            fetchedRecipes.push({ id: doc.id, ...doc.data() })
          );
          setRecipeData(fetchedRecipes);
        } catch (error) {
          console.error("Feil ved henting av oppskrifter", error);
        }
      }
    };

    fetchRecipes();
  }, [familyId]); // Avhenger av familyId

  const handleAddRecipe = (day) => {
    setCurrentDay(day);
    setIsModalVisible(true);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        try {
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

    fetchUserData();
  }, []); // Tomt avhengighetsarray sikrer at dette kun kjøres ved montering

  const fetchFamilyMembers = async (familyId) => {
    const familyDocRef = doc(db, "families", familyId);
    const familyDocSnap = await getDoc(familyDocRef);

    if (familyDocSnap.exists()) {
      const familyData = familyDocSnap.data();
      return familyData.members; // Returnerer array av medlems-IDs
    } else {
      console.log("Familie ikke funnet");
      return [];
    }
  };

  useEffect(() => {
    const fetchAndSetRecipes = async () => {
      const members = await fetchFamilyMembers(familyId);
      const recipes = [];

      for (const memberId of members) {
        const memberRecipesRef = collection(db, "recipes"); // Anta at det er en måte å filtrere basert på memberId
        const q = query(memberRecipesRef, where("userId", "==", memberId)); // Dette forutsetter at oppskrifter har en `userId`

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          recipes.push({ id: doc.id, ...doc.data() });
        });
      }

      setRecipeData(recipes);
    };

    if (familyId) {
      fetchAndSetRecipes();
    }
  }, [familyId]);

  const saveRecipeForDay = async (day, recipe) => {
    const dayDocRef = doc(db, "families", familyId, "weekMenu", day);

    const dayData = {
      date: day,
      recipeId: recipe.id,
      recipeTitle: recipe.title,
    };

    try {
      await setDoc(dayDocRef, dayData);
      console.log("Oppskrift lagret for dagen!");
    } catch (error) {
      console.error("Feil ved lagring av oppskrift for dagen", error);
    }
  };

  const selectRecipeForDay = (recipe, day) => {
    saveRecipeForDay(day, recipe);
    setIsModalVisible(false);
  };

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

      <View style={[containerStyles.defaultContainer, { flex: 1, gap: 12 }]}>
        {weekDates.map((date, index) => (
          <View key={index} style={styles.dayContainer}>
            <Text style={styles.dayText}>{date}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddRecipe(date)}
            >
              <Text style={styles.addButtonText}>Legg til Oppskrift</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Modal */}
      <Modal
        animationType="slide"
        presentationStyle="pageSheet"
        visible={isModalVisible}
        onRequestClose={() => {
          setIsModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.modalView}>
          <FlatList
            data={recipeData}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.recipeItem}
                onPress={() => selectRecipeForDay(item, currentDay)}
              >
                <Text style={styles.recipeText}>{item.title}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
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
