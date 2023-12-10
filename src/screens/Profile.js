import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { auth, db, storage } from "../../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";
import Statistics from "./Statistics";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [image, setImage] = useState(null);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Beklager, vi trenger tilgangstillatelser for å gjøre dette!");
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        let userData = userDocSnap.data();

        setUserProfile(userData);
      }
    };

    fetchUserData();
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Tillater redigering
      aspect: [1, 1], // Beskjær til en firkant
      quality: 1,
    });

    if (!result.cancelled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImage(uri); // Lagrer URI-en i state
      uploadImage(uri); // Kaller uploadImage med valgt bilde-URI
    } else {
      console.log("Bildevalg avbrutt eller ingen bilde valgt");
    }
  };

  const uploadImage = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const storageRef = ref(
        storage,
        `profile/${auth.currentUser.uid}/profile.jpg`
      );

      await uploadBytes(storageRef, blob);
      const imageUrl = await getDownloadURL(storageRef);

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { profileImageUrl: imageUrl });

      console.log("Bilde opplastet og URL lagret i databasen: ", imageUrl);
    } catch (error) {
      console.error("Opplastingsfeil:", error);
    }
  };

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
        <Text style={fonts.header}>Din profil</Text>
      </View>

      {/* Name, profile etc. */}
      <View style={containerStyles.defaultContainer}>
        {userProfile && (
          <View>
            <Text>
              {userProfile.firstName} {userProfile.lastName}
            </Text>
            <Text>{userProfile.email}</Text>
          </View>
        )}
        {userProfile && (
          <View>
            {image ? (
              <Image
                source={{ uri: userProfile.profileImageUrl }}
                style={{ width: 200, height: 200, borderRadius: 100 }}
              />
            ) : (
              <Image
                source={require("../../assets/user-1.png")}
                style={{ width: 200, height: 200, borderRadius: 100 }}
              />
            )}
          </View>
        )}
        <TouchableOpacity onPress={pickImage}>
          <Text>Last opp profilbilde</Text>
        </TouchableOpacity>
        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />
        )}
      </View>

      {/* Statistics */}
      <View style={containerStyles.defaultContainer}>
        <Statistics />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});

export default Profile;
