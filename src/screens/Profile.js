import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StyleSheet,
  Modal,
} from "react-native";
import { auth, db, storage } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  arrayUnion,
} from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import colors from "../../styles/colors";

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [image, setImage] = useState(null);

  const [familyName, setFamilyName] = useState("");
  const [joinFamilyCode, setJoinFamilyCode] = useState("");

  const [familyId, setFamilyId] = useState(null); // Holder på familie IDen
  const [familyData, setFamilyData] = useState(null); // Holder på familiens navn og kode

  const [createFamilyModalVisible, setCreateFamilyModalVisible] =
    useState(false);
  const [joinFamilyModalVisible, setJoinFamilyModalVisible] = useState(false);

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
    // Hent brukerens data og familieinformasjon når komponenten lastes
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        let userData = userDocSnap.data();
        setUserProfile(userData);
        // Sjekk om brukeren er del av en familie
        if (userData.familyId) {
          setFamilyId(userData.familyId);
          fetchFamilyData(userData.familyId); // Hent familiens data
        }
      }
    };

    fetchUserData();
  }, []);

  const fetchFamilyData = async (familyId) => {
    const familyDocRef = doc(db, "families", familyId);
    const familyDocSnap = await getDoc(familyDocRef);

    if (familyDocSnap.exists()) {
      setFamilyData(familyDocSnap.data());
    }
  };

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

  // Funksjon for å opprette familie
  const handleCreateFamily = async () => {
    const uniqueFamilyCode = uuidv4(); // Genererer en unik kode for familien
    try {
      if (familyName.trim() === "") {
        alert("Vennligst fyll inn et familienavn");
        return;
      }

      const docRef = await addDoc(collection(db, "families"), {
        name: familyName, // Bruker nå 'familyName' fra staten
        members: [auth.currentUser.uid],
        familyCode: uniqueFamilyCode, // Lagrer den unike koden
      });

      // Oppdater brukerens profil med familyId
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { familyId: docRef.id });

      setFamilyId(docRef.id); // Oppdaterer state
      setFamilyData({ name: familyName, familyCode: uniqueFamilyCode }); // Setter familiens data
      setCreateFamilyModalVisible(false); // Lukker modalen etter vellykket opprettelse
    } catch (error) {
      console.error("Error adding family: ", error);
    }
  };

  // Funksjon for å bli med i en familie
  const handleJoinFamily = async () => {
    try {
      // Anta at familiene er lagret i en samling kalt 'families' og hver familie har en 'familyCode'
      const familiesRef = collection(db, "families");
      const querySnapshot = await getDocs(
        query(familiesRef, where("familyCode", "==", joinFamilyCode))
      );

      // Sjekk om det finnes noen familie med den koden
      if (!querySnapshot.empty) {
        const familyDoc = querySnapshot.docs[0]; // Ta den første matchende familien
        const familyId = familyDoc.id;

        // Legg til brukeren i familiens medlemsliste
        await updateDoc(doc(db, "families", familyId), {
          members: arrayUnion(auth.currentUser.uid),
        });

        // Oppdater brukerens profil med familyId
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          familyId: familyId,
        });

        setFamilyId(familyId); // Oppdaterer state
        setFamilyData({ ...familyDoc.data(), id: familyId }); // Oppdaterer familiens data
        setJoinFamilyModalVisible(false); // Lukker modalen

        alert("Du har blitt lagt til i familien!");
      } else {
        alert("Ingen familie med den koden ble funnet.");
      }
    } catch (error) {
      console.error("Feil ved å bli med i familie:", error);
      alert("Kunne ikke bli med i familien, prøv igjen senere.");
    }
  };

  // Modal for å opprette familie
  const CreateFamilyModal = ({ isVisible, onClose, onSubmit }) => {
    const [familyName, setFamilyName] = useState("");

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Opprett en ny familie</Text>
          <TextInput
            style={styles.input}
            onChangeText={setFamilyName}
            value={familyName}
            placeholder="Familienavn"
          />

          <TouchableOpacity onPress={() => onSubmit(familyName)}>
            <Text>Opprett Familie</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  };

  // Modal for å bli med i en familie
  const JoinFamilyModal = ({ isVisible, onClose, onSubmit }) => {
    const [joinCode, setJoinCode] = useState("");

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isVisible}
        onRequestClose={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Bli med i en eksisterende familie
          </Text>
          <TextInput
            style={styles.input}
            onChangeText={setJoinCode}
            value={joinCode}
            placeholder="Familiekode"
          />
          <TouchableOpacity onPress={() => onSubmit(joinCode)}>
            <Text>Bli med</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
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
          <TouchableOpacity onPress={pickImage}>
            {image ? (
              <Image
                source={{ uri: userProfile.profileImageUrl }}
                style={{ width: 200, height: 200, borderRadius: 100 }}
                onPress={pickImage}
              />
            ) : (
              <Image
                source={require("../../assets/user-1.png")}
                style={{ width: 200, height: 200, borderRadius: 100 }}
                onPress={pickImage}
              />
            )}
          </TouchableOpacity>
        )}

        {image && (
          <Image
            source={{ uri: image }}
            style={{ width: 200, height: 200, borderRadius: 100 }}
          />
        )}
      </View>
      {/* Statistics */}
      <View style={{ paddingHorizontal: 20, marginTop: 32 }}>
        {/* Knapper */}
        {!familyId && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setCreateFamilyModalVisible(true)}
            >
              <Text>Opprett Familie</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setJoinFamilyModalVisible(true)}
            >
              <Text>Bli med i Familie</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Hvis brukeren er en del av en familie, vis familiens navn og kode */}
        {familyId && familyData && (
          <View style={styles.familyInfoContainer}>
            <Text>Familienavn:</Text>
            <Text style={styles.familyText}>{familyData.name}</Text>
            <Text>Familiekode:</Text>
            <Text style={styles.familyText}>{familyData.familyCode}</Text>
          </View>
        )}

        {/* Modal for å opprette familie */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={createFamilyModalVisible}
          onRequestClose={() => setCreateFamilyModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Opprett en ny familie</Text>
            <TextInput
              style={styles.input}
              onChangeText={setFamilyName}
              value={familyName}
              placeholder="Familiens navn"
            />
            {/* Tillegg UI for å invitere medlemmer om nødvendig */}
            <TouchableOpacity
              style={styles.button}
              onPress={handleCreateFamily}
            >
              <Text>Opprett Familie</Text>
            </TouchableOpacity>
          </View>
        </Modal>

        {/* Modal for å bli med i en familie */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={joinFamilyModalVisible}
          onRequestClose={() => setJoinFamilyModalVisible(false)}
        >
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Bli med i en eksisterende familie
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setJoinFamilyCode}
              value={joinFamilyCode}
              placeholder="Familiens kode"
            />
            <TouchableOpacity style={styles.button} onPress={handleJoinFamily}>
              <Text>Bli Med</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    margin: 10,
  },
  button: {
    backgroundColor: "#DDDDDD",
    padding: 10,
    margin: 10,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: 200,
  },
  familyText: {
    marginBottom: 8,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: "400",
  },
});

export default Profile;
