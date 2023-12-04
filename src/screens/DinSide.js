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

  const fetchAdsFromDatabase = (userUid) => {
    const adsCollectionRef = collection(db, "annonser");

    // Funksjon for å kombinere og oppdatere annonser
    const updateAds = (newAds, existingAds) => {
      // Fjern duplikater og kombiner
      const combinedAds = [
        ...newAds,
        ...existingAds.filter(
          (ad) => !newAds.find((newAd) => newAd.id === ad.id)
        ),
      ];
      setAdData(combinedAds);
    };

    // Lytter for annonser hvor brukeren er eier
    const unsubscribeOwner = onSnapshot(
      query(adsCollectionRef, where("uid", "==", userUid)),
      (snapshot) => {
        const ownerAds = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        updateAds(ownerAds, adData);
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
        updateAds(workerAds, adData);
      }
    );

    // Returnerer en funksjon for å avslutte lytterne
    return () => {
      unsubscribeOwner();
      unsubscribeWorker();
    };
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = fetchAdsFromDatabase(user.uid);

      return () => {
        // Clean up the listener when the component is unmounted
        unsubscribe();
      };
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

      {/* Hva trenger du hjelp med? */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Hva trenger du hjelp med?</Text>

        {/* Searchbar */}
        <View style={{ marginTop: 12 }}>
          <SearchBar placeholder={"Søk etter kategorier"} />
        </View>

        {/* cards */}
        <ScrollView
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
        </ScrollView>
      </View>

      {/* Pågående arbeid */}
      <View style={containerStyles.defaultContainer}>
        <Text style={fonts.subHeader}>Pågående arbeid</Text>

        <View style={{ marginTop: 16 }}>
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
});
