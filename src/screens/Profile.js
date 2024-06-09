import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  arrayUnion,
} from "firebase/firestore";

import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import colors from "../../styles/colors";
import placeholderStyles from "../../styles/placeholderStyles";
import HeaderComponent from "../components/HeaderComponent";
import ProfileImage from "../components/ProfileImage";
import useUserData from "../hooks/userUserData";
import useFamilyId from "../hooks/useFamilyId";
import Settings from "../../assets/SVGs/Settings";
import { useNavigation } from "@react-navigation/native";

const Profile = () => {
  const { userData, loading: userLoading } = useUserData();
  const { familyId, loading: familyLoading } = useFamilyId();
  const [familyData, setFamilyData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [createFamilyModalVisible, setCreateFamilyModalVisible] =
    useState(false);
  const [joinFamilyModalVisible, setJoinFamilyModalVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (familyId) {
      fetchFamilyData(familyId);
    }
  }, [familyId]);

  const fetchFamilyData = async (familyId) => {
    const familyDocRef = doc(db, "families", familyId);
    const familyDocSnap = await getDoc(familyDocRef);

    if (familyDocSnap.exists()) {
      const familyData = familyDocSnap.data();
      setFamilyData(familyData);

      const members = await Promise.all(
        familyData.members.map(async (memberId) => {
          const memberDocRef = doc(db, "users", memberId);
          const memberDocSnap = await getDoc(memberDocRef);
          if (memberDocSnap.exists()) {
            return { id: memberId, ...memberDocSnap.data() };
          } else {
            return null;
          }
        })
      );

      setFamilyMembers(members.filter((member) => member !== null));
    }
  };

  const handleCreateFamily = async (familyName) => {
    try {
      if (familyName.trim() === "") {
        alert("Vennligst fyll inn et familienavn");
        return;
      }

      const docRef = await addDoc(collection(db, "families"), {
        name: familyName,
        members: [auth.currentUser.uid],
      });

      const userDocRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDocRef, { familyId: docRef.id });

      setFamilyId(docRef.id);
      setFamilyData({ name: familyName, familyId: docRef.id });
      setCreateFamilyModalVisible(false);
    } catch (error) {
      console.error("Error adding family: ", error);
    }
  };

  const handleJoinFamily = async (joinFamilyCode) => {
    try {
      const familyDocRef = doc(db, "families", joinFamilyCode);
      const familyDocSnap = await getDoc(familyDocRef);

      if (familyDocSnap.exists()) {
        const familyData = familyDocSnap.data();

        await updateDoc(familyDocRef, {
          members: arrayUnion(auth.currentUser.uid),
        });

        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          familyId: joinFamilyCode,
        });

        setFamilyId(joinFamilyCode);
        setFamilyData({ ...familyData, id: joinFamilyCode });
        setJoinFamilyModalVisible(false);

        alert("Du har blitt lagt til i familien!");
      } else {
        alert("Ingen familie med den ID-en ble funnet.");
      }
    } catch (error) {
      console.error("Feil ved å bli med i familie:", error);
      alert("Kunne ikke bli med i familien, prøv igjen senere.");
    }
  };

  if (userLoading || familyLoading) {
    return (
      <View style={{ justifyContent: "center", flex: 1 }}>
        <ActivityIndicator />
      </View>
    );
  }

  const rightButton = () => (
    <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
      <Settings />
    </TouchableOpacity>
  );

  return (
    <View style={containerStyles.defaultContainer}>
      <HeaderComponent headerText="Profil" rightButton={rightButton} />
      {userData && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <ProfileImage
            imageUrl={userData.profileImageUrl}
            onImageChange={(uri) => setImage(uri)}
          />
          <Text>
            {userData.firstName} {userData.lastName}
          </Text>
        </View>
      )}

      {!familyId ? (
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
      ) : (
        familyData && (
          <View style={styles.familyInfoContainer}>
            <View style={{ flexDirection: "column", gap: 8 }}>
              <View>
                <Text style={fonts.btnBody}>Familienavn:</Text>
                <Text style={[placeholderStyles.simple, fonts.body2]}>
                  {familyData.name}
                </Text>
              </View>
              <View>
                <Text style={fonts.btnBody}>Familiekode:</Text>
                <Text style={[placeholderStyles.simple, fonts.body2]}>
                  {familyId}
                </Text>
              </View>
            </View>
            <View>
              <Text style={fonts.btnBody}>Medlemmer:</Text>
              {familyMembers.map((member) => (
                <View
                  key={member.id}
                  style={[
                    placeholderStyles.simple,
                    { flexDirection: "row", alignItems: "center", gap: 8 },
                  ]}
                >
                  <ProfileImage imageUrl={member.profileImageUrl} />
                  <Text style={fonts.body2}>
                    {member.firstName} {member.lastName}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )
      )}

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
            placeholder="Familienavn"
            onChangeText={(text) => setFamilyName(text)}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCreateFamily(familyName)}
          >
            <Text>Opprett</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setCreateFamilyModalVisible(false)}
          >
            <Text>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={joinFamilyModalVisible}
        onRequestClose={() => setJoinFamilyModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Bli med i en familie</Text>
          <TextInput
            style={styles.input}
            placeholder="Familiekode"
            onChangeText={(text) => setJoinFamilyCode(text)}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleJoinFamily(joinFamilyCode)}
          >
            <Text>Bli med</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setJoinFamilyModalVisible(false)}
          >
            <Text>Avbryt</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 20,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
  },
  familyInfoContainer: {
    marginTop: 20,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
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
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    width: "80%",
  },
});

export default Profile;
