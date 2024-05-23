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
import { collection, onSnapshot } from "firebase/firestore";

import { categories } from "../components/Categories";

import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";

import SearchBar from "../components/SearchBar";
import CategoryButtons from "../components/CategoryButtons";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";

export default function Recipes() {
  const navigation = useNavigation();
  const [recipeData, setRecipeData] = useState([]);
  const [userUID, setUserUID] = useState("");

  useEffect(() => {
    const recipeCollectionRef = collection(db, "recipes");
    const unsubscribe = onSnapshot(
      recipeCollectionRef,
      (snapshot) => {
        const currentUserUID = auth.currentUser ? auth.currentUser.uid : null;
        const recipeData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecipeData(recipeData);
      },
      (error) => {
        console.error("Feil ved henting av annonser:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 82, //endre tilbake til 12!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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
          <TouchableOpacity
            style={buttons.circleBtn}
            onPress={() => navigation.navigate("CreateRecipe")}
          >
            <Text>+</Text>
          </TouchableOpacity>
        </View>

        <SearchBar placeholder={"søk etter oppskrifter"} />
      </View>

      <View style={[containerStyles.defaultContainer, { flex: 1 }]}>
        <FlatList
          data={recipeData}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                navigation.navigate("RecipeView", { recipeId: item.id })
              }
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <Text style={fonts.subHeader}>{item.title}</Text>
                <Text style={fonts.body}>{item.time} min</Text>
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

                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {item.countries.map((country, index) => (
                    <View key={index} style={buttons.categoryBtn}>
                      <Text style={styles.countryText}>{country}</Text>
                    </View>
                  ))}
                </View>
              </View>
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
    backgroundColor: "#FCFCFC",
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    rowGap: 16,
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  text: {
    color: "#272727",
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
  },
  categoryText: {
    color: colors.blue,
    ...fonts.body,
  },
  countryText: {
    color: colors.green,
    ...fonts.body,
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 5,
    backgroundColor: colors.white,
    gap: 12,
  },
});
