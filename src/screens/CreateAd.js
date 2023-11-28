import React from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { useState, useEffect, useRef } from "react";

import { auth, db, storage } from "../../firebase";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  addDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import { firestore } from "../../firebase"; // Importer firestore fra din firebase-config

import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import buttons from "../../styles/buttons";
import fonts from "../../styles/fonts";
import colors from "../../styles/colors";

import * as ImagePicker from "expo-image-picker";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

export default function CreateAd({ route }) {
  const { category } = route.params;
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState(null);

  const [overskrift, setOverskrift] = useState("");
  const [beskrivelse, setBeskrivelse] = useState("");
  const [sted, setSted] = useState("");

  const [status, setStatus] = useState("Ikke startet"); // Default status

  const [isUploading, setIsUploading] = useState(false); // Ny tilstandsvariabel

  const [formErrorMessage, setFormErrorMessage] = useState("");

  const isFormValid = () => {
    return (
      overskrift.trim() !== "" &&
      beskrivelse.trim() !== "" &&
      sted.trim() !== ""
    );
  };

  const leggTilAnnonse = async () => {
    if (!isFormValid() || isUploading) {
      setFormErrorMessage("Alle felt må fylles ut eller opplasting pågår");
      return;
    }

    try {
      setIsUploading(true); // Start opplasting

      // Første del av funksjonen - last opp bildet og få URL
      const imageUrl = await uploadImage();

      // Andre del av funksjonen - legg til annonse
      const db = getFirestore(firestore);
      const userUID = auth.currentUser.uid;
      const annonseRef = await addDoc(collection(db, "annonser"), {
        overskrift,
        beskrivelse,
        sted,
        kategori: category,
        uid: userUID,
        status,
        bildeUrl: imageUrl || null, // Sett bildeUrl til null hvis imageUrl ikke er tilgjengelig
      });

      // Hent og oppdater brukerdata
      const userDocRef = doc(db, "users", userUID);
      const userDocSnapshot = await getDoc(userDocRef);
      const userData = userDocSnapshot.data();
      await updateDoc(annonseRef, { user: userData });

      // Naviger tilbake
      navigation.goBack();
    } catch (error) {
      console.error("Feil ved opplasting av annonse:", error);
      setFormErrorMessage("Det oppstod en feil ved opprettelse av annonse");
    } finally {
      setIsUploading(false); // Avslutt opplasting uansett utfall
    }
  };

  // Funksjon for å velge bilde
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImageUri(result.assets[0].uri); // Oppdaterer for å bruke den første asset-en
    }
  };

  // Funksjon for å laste opp bilde
  const uploadImage = async () => {
    if (!imageUri) return null;

    const response = await fetch(imageUri);
    const blob = await response.blob();

    const imageRef = storageRef(storage, `images/${Date.now()}`);
    await uploadBytes(imageRef, blob);

    const downloadUrl = await getDownloadURL(imageRef);
    return downloadUrl;
  };

  return (
    <View style={{ backgroundColor: "#FFF", flex: 1 }}>
      <SafeAreaView />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: "100%", height: 200 }}
          />
        )}
        <View style={containerStyles.defaultContainer}>
          <TouchableOpacity onPress={pickImage}>
            <Text>Last opp bilde</Text>
          </TouchableOpacity>
          {formErrorMessage !== "" && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{formErrorMessage}</Text>
            </View>
          )}

          <Text>Overskrift</Text>
          <TextInput
            style={placeholderStyles.simple}
            placeholder="Overskrift"
            value={overskrift}
            onChangeText={(text) => setOverskrift(text)}
          />

          <View
            style={{
              marginBottom: 12,
              backgroundColor: colors.lightPrimary,
              padding: 6,
              borderRadius: 5,
            }}
          >
            <Text>Kategori: {category}</Text>
          </View>

          <Text>Beskrivelse</Text>
          <TextInput
            style={placeholderStyles.bigbox}
            placeholder="Jeg trenger hjelp til..."
            numberOfLines={5}
            value={beskrivelse}
            onChangeText={(text) => setBeskrivelse(text)}
            multiline={true}
          />

          <Text>Sted</Text>
          <TextInput
            style={placeholderStyles.simple}
            placeholder="Karl Johans Gate 1, 0159 Oslo"
            value={sted}
            onChangeText={(text) => setSted(text)}
          />

          <TouchableOpacity
            style={buttons.btn1}
            onPress={leggTilAnnonse}
            disabled={isUploading} // Deaktiver knappen under opplasting
          >
            <Text style={[fonts.btnBody, { color: "blue" }]}>
              {isUploading ? "Oppretter Annonse..." : "Opprett annonse"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    marginBottom: 12,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    fontWeight: "500",
  },
});
