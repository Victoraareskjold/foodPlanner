import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
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

import { categories } from "../components/Categories";
import ProfileModal from "../components/ProfileModal";

import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";

import MealCalendar from "../components/MealCalendar";
import GroceryList from "../components/GroceryList";

export default function ShoppingList() {
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
        <Text style={fonts.header}>Handleliste</Text>

        {/* Bell & user */}
        <View style={{ flexDirection: "row" }}>
          <TouchableOpacity onPress={openProfileModal}>
            {image ? (
              <Image
                source={{ uri: image }}
                style={[images.icon48, { marginLeft: 8, borderRadius: 24 }]}
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

      {/* Planlagte måltider */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Planlagte måltid</Text>
        <View>
          <MealCalendar />
        </View>
      </View>

      {/* Handleliste */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Handleliste</Text>
        <View>
          <GroceryList />
        </View>
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
    gap: 12,
  },
});
