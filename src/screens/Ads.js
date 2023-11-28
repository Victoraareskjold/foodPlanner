import { StyleSheet, Text, View, SafeAreaView, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";

import AdCardList from "../components/AdCardList";
import { categories } from "../components/Categories";

import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";

import SearchBar from "../components/SearchBar";
import CategoryButtons from "../components/CategoryButtons";

export default function Ads() {
  const navigation = useNavigation();

  const [adData, setAdData] = useState([]);

  const [userUID, setUserUID] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("Se alle"); // Standardverdi satt til "Alle" eller en annen passende standardkategori

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    handleSelectCategory("Se alle");
  }, []);

  useEffect(() => {
    const adsCollectionRef = collection(db, "annonser");
    const unsubscribe = onSnapshot(
      adsCollectionRef,
      (snapshot) => {
        const currentUserUID = auth.currentUser ? auth.currentUser.uid : null;
        const adsData = snapshot.docs
          .filter((doc) => doc.data().status === "Ikke startet")
          .filter(
            (doc) =>
              selectedCategory === "Se alle" ||
              doc.data().kategori === selectedCategory
          )
          .filter((doc) => doc.data().uid !== currentUserUID)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        setAdData(adsData);
      },
      (error) => {
        // Håndter eventuelle feil her
        console.error("Feil ved henting av annonser:", error);
      }
    );

    return () => unsubscribe(); // Rengjør abonnement når komponenten avmonteres
  }, [selectedCategory]);

  return (
    <View style={styles.container}>
      <SafeAreaView />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          marginTop: 32,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={fonts.header}>Alle annonser</Text>
      </View>

      <View style={containerStyles.defaultContainer}>
        <SearchBar placeholder={"Søk etter annonser"} />
        <CategoryButtons
          categories={categories}
          onSelectCategory={handleSelectCategory}
        />
      </View>

      <View style={containerStyles.defaultContainer}>
        <FlatList
          ListEmptyComponent={
            <Text style={{ alignSelf: "center", marginTop: 20 }}>
              Ingen annonser
            </Text>
          }
          data={adData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <AdCardList adData={item} navigation={navigation} />
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
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 20,
    rowGap: 16,
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: 5,
    width: 108,
    alignItems: "center",
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
});
