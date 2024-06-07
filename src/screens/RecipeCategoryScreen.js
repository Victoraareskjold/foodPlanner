import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import containerStyles from "../../styles/containerStyles";
import { db, auth } from "../../firebase"; // Pass på riktig sti til din Firebase konfigurasjon
import { collection, query, where, getDocs } from "firebase/firestore";

import SearchBar from "../components/SearchBar";

const RecipeCategoryScreen = ({ route, navigation }) => {
  const { category } = route.params;
  const [recipes, setRecipes] = useState([]);
  const [familyCode, setFamilyCode] = useState(null);

  useEffect(() => {
    const fetchFamilyCodeAndRecipes = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userId = currentUser.uid;
        try {
          const userDoc = await getDocs(
            query(collection(db, "brukere"), where("userId", "==", userId))
          );
          if (!userDoc.empty) {
            const familyCode = userDoc.docs[0].data().familyCode;

            const q = query(
              collection(db, "oppskrifter"),
              where("kategori", "==", category),
              where("familyCode", "==", familyCode)
            );
            const querySnapshot = await getDocs(q);
            const fetchedRecipes = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRecipes(fetchedRecipes);
          }
        } catch (error) {
          console.error(
            "Error fetching user's family code or recipes: ",
            error
          );
        }
      }
    };

    fetchFamilyCodeAndRecipes();
  }, [category]);

  return (
    <View style={styles.container}>
      <SafeAreaView />
      <View
        style={{
          marginTop: 20,
          flexDirection: "column",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <SearchBar placeholder={"søk etter oppskrifter"} />
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AdCardList adData={item} />}
        ListEmptyComponent={<Text>Ingen oppskrifter funnet.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  // Du kan legge til flere stiler her om nødvendig
});

export default RecipeCategoryScreen;
