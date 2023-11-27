import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
} from "react-native";
import { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { firestore } from "../../firebase";

import WorkCard from "../components/WorkCard";
import AdCard from "../components/AdCard";
import AdCardList from "../components/AdCardList";
import { categories } from "../components/Categories";
import ProfileModal from "../components/ProfileModal";

import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import fonts from "../../styles/fonts";
import images from "../../styles/images";
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
    const fetchData = async () => {
      try {
        const adsCollectionRef = collection(db, "annonser");
        const snapshot = await getDocs(adsCollectionRef);
        const currentUserUID = auth.currentUser ? auth.currentUser.uid : null;

        const adsData = snapshot.docs
          .filter((doc) => doc.data().status === "Ikke startet")
          .filter(
            (doc) =>
              selectedCategory === "Se alle" || // Endret her for å inkludere alle annonser når "Se alle" er valgt
              doc.data().kategori === selectedCategory
          )
          .filter((doc) => doc.data().uid !== currentUserUID)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        setAdData(adsData);
      } catch (error) {
        throw error;
      }
    };

    fetchData();
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
