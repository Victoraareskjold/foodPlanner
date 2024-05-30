import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Image,
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
import images from "../../styles/images";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import Timer from "../../assets/SVGs/Timer";
import SearchBar from "../components/SearchBar";

export default function AddMeal({ route, navigation }) {
  const { currentDay, onMealAdded } = route.params;

  const [recipeData, setRecipeData] = useState([]);
  const [familyId, setFamilyId] = useState(null);
  const [image, setImage] = useState(null);

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

  const numColumns = 2;

  return (
    <View style={styles.container}>
      <SafeAreaView />

      <SearchBar placeholder={"søk etter oppskrifter"} />

      <FlatList
        style={{ flex: 1, marginTop: 12 }}
        columnWrapperStyle={{ justifyContent: "space-between", gap: 20 }}
        numColumns={numColumns}
        data={recipeData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("RecipeView", { recipeId: item.id })
            }
          >
            {image ? (
              <Image source={{ uri: image }} style={[images.mealImage2]} />
            ) : (
              <Image
                source={require("../../assets/placeholderImage.png")}
                style={images.mealImage2}
              />
            )}
            <View style={styles.mealInfo}>
              <Text style={fonts.body}>{item.title}</Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 4,
                  alignItems: "center",
                }}
              >
                <Timer />
                <Text style={fonts.body2}>{item.time} min</Text>
              </View>
              <View style={{ gap: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                >
                  {item.categories.map((category, index) => (
                    <View key={index} style={buttons.categoryBtn}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
  },
  recipeItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  recipeText: {
    fontSize: 18,
  },
  categoryText: {
    color: colors.blue,
    ...fonts.body2,
  },
  countryText: {
    color: colors.green,
    ...fonts.body2,
  },
  categoryContainer: {
    backgroundColor: colors.lightBlue,
    borderRadius: 20,
    marginRight: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  countryContainer: {
    backgroundColor: colors.lightGreen,
    borderRadius: 20,
    marginRight: 6,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  card: {
    overflow: "hidden",
    flex: 1,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  mealInfo: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
});
