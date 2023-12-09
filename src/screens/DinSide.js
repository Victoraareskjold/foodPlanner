import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import {
  collection,
  where,
  query,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore"; // Correct import statements

import AdCard from "../components/AdCard";
import { categories } from "../components/Categories";
import ProfileModal from "../components/ProfileModal";
import SearchBar from "../components/SearchBar";

import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";

export default function DinSide() {
  useEffect(() => {
    if (!auth.currentUser) {
      navigation.navigate("Login");
    }
  }, []);

  const navigation = useNavigation();

  const [userProfile, setUserProfile] = useState(null); // Deklarer state for brukerprofil
  const [image, setImage] = useState(null);

  const firstSixCategories = categories.slice();

  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const openProfileModal = () => {
    setProfileModalVisible(true);
  };
  const closeProfileModal = () => {
    setProfileModalVisible(false);
  };

  const WorkCard = ({ color, icon, text, onPress }) => {
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.card, { backgroundColor: color }]}>
          <Image source={icon} style={styles.icon} />
          <Text style={styles.text}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [adData, setAdData] = useState([]);

  const updateAds = (newAds, existingAds) => {
    const adsMap = new Map();

    if (Array.isArray(existingAds)) {
      existingAds.forEach((ad) => adsMap.set(ad.id, ad));
    }

    if (Array.isArray(newAds)) {
      newAds.forEach((ad) => adsMap.set(ad.id, ad));
    }

    const combinedAds = Array.from(adsMap.values());
    return combinedAds;
  };

  const fetchAdsFromDatabase = (userUid) => {
    const adsCollectionRef = collection(db, "annonser");

    // Lytter for annonser hvor brukeren er eier
    const unsubscribeOwner = onSnapshot(
      query(adsCollectionRef, where("uid", "==", userUid)),
      (snapshot) => {
        const ownerAds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdData((existingAds) => updateAds(ownerAds, existingAds));
      }
    );

    // Lytter for annonser hvor brukeren er arbeider
    const unsubscribeWorker = onSnapshot(
      query(adsCollectionRef, where("workerUid", "==", userUid)),
      (snapshot) => {
        const workerAds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAdData((existingAds) => updateAds(workerAds, existingAds));
      }
    );

    // Returner en funksjon for å avbryte abonnementet
    return () => {
      unsubscribeOwner();
      unsubscribeWorker();
    };
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = fetchAdsFromDatabase(user.uid);
      return () => unsubscribe(); // Avslutter lytterne når komponenten avmonteres
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserProfile(userData);
        setImage(userData.profileImageUrl); // Lagrer URL-en til profilbildet i tilstanden
      }
    };

    if (auth.currentUser) {
      fetchUserData();
    }
  }, []);

  useEffect(() => {}, [adData]); // Dette vil kjøre hver gang adData endres

  const removeAdFromList = (adId) => {
    setAdData((currentAds) => currentAds.filter((ad) => ad.id !== adId));
  };

  return (
    <ScrollView style={styles.container}>
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
        <Text style={fonts.header}>Din side</Text>

        {/* Bell & user */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity>
            <Image
              source={require("../../assets/noti.png")}
              style={images.icon48}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={openProfileModal}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={[images.icon48, { marginLeft: 8, borderRadius: 24 }]} // Sirkelformet stil
              />
            ) : (
              <Image
                source={require("../../assets/user-1.png")}
                style={[images.icon48, { marginLeft: 8 }]}
              />
            )}
          </TouchableOpacity>

          {/* Profilmodal */}
          <ProfileModal
            isVisible={isProfileModalVisible}
            onClose={closeProfileModal}
          />
        </View>
      </View>

      {/* Pågående arbeid */}
      {adData.length > 0 && (
        <View style={containerStyles.defaultContainer}>
          <Text style={fonts.subHeader}>Aktive jobber & søknader</Text>

          <View style={{ marginTop: 20 }}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={adData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <AdCard adData={item} navigation={navigation} />
              )}
            />
          </View>
        </View>
      )}

      {/* Hva trenger du hjelp med? */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Hva trenger du hjelp med?</Text>

        {/* Searchbar */}
        {/* <View style={{ marginTop: 12 }}>
          <SearchBar placeholder={"Søk etter kategorier"} />
        </View> */}

        {/* cards */}
        {/* <ScrollView
          style={styles.cardGrid}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {firstSixCategories.map((category) => (
            <WorkCard
              key={category.id}
              color={category.color}
              icon={category.icon}
              text={category.text}
              onPress={() => {
                if (category.id === 9) {
                  // Behandling for det siste kortet
                  // For eksempel, navigasjon til en annen skjerm
                  navigation.navigate("AllCategories");
                } else {
                  // Behandling for de andre kortene
                  navigation.navigate("CreateAd", { category: category.text });
                }
              }}
            />
          ))}
        </ScrollView> */}
        <View style={styles.buttonContainer}>
          {/* create ad */}
          <TouchableOpacity
            style={buttons.iconButton}
            onPress={() => navigation.navigate("Ads")}
          >
            <Image
              style={{ width: 24, height: 24, marginBottom: 12 }}
              source={require("../../assets/search.png")}
            />
            <Text style={fonts.btnBody}>Finn arbeid</Text>
          </TouchableOpacity>

          {/* View ads */}
          <TouchableOpacity
            style={buttons.iconButton}
            onPress={() => navigation.navigate("CreateAd")}
          >
            <Image
              style={{ width: 24, height: 24, marginBottom: 12 }}
              source={require("../../assets/plus.png")}
            />
            <Text style={fonts.btnBody}>Opprett annonse</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pågående arbeid */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Fullfør oppsett av profil</Text>

        <View style={{ marginTop: 16 }}></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  cardGrid: {
    flexDirection: "row",
    marginTop: 20,
  },
  card: {
    paddingVertical: 8,
    borderRadius: 5,
    width: 96,
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  text: {
    color: "#272727",
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    Width: "100%",
    justifyContent: "space-between",
    gap: 20,
  },
});
