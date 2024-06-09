import React from "react";
import { Image, TouchableOpacity } from "react-native";
import { auth, storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";

const ProfileImage = ({ imageUrl, onImageChange }) => {
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await uploadImage(uri);
      onImageChange(uri);
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
    } catch (error) {
      console.error("Opplastingsfeil:", error);
    }
  };

  return (
    <TouchableOpacity onPress={pickImage}>
      <Image
        source={
          imageUrl ? { uri: imageUrl } : require("../../assets/user-1.png")
        }
        style={{ width: 40, height: 40, borderRadius: 100 }}
      />
    </TouchableOpacity>
  );
};

export default ProfileImage;
