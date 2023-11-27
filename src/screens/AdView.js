import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Touchable,
} from "react-native";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
import { firestore } from "../../firebase";

import WorkCard from "../components/WorkCard";
import AdCard from "../components/AdCard";
import { categories } from "../components/Categories";
import ProfileModal from "../components/ProfileModal";
import StatusButton from "../components/StatusButton";

import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";

const AdView = ({ route }) => {
  const navigation = useNavigation();

  const { adData } = route.params;

  const category = categories.find(
    (category) => category.text === adData.kategori
  );

  const [status, setStatus] = useState(adData.status);

  const handleStatusUpdate = async (newStatus) => {
    try {
      // Oppdater statusen i komponentens tilstand
      setStatus(newStatus);

      // Oppdater statusen i databasen
      const adRef = doc(db, "annonser", adData.id); // Anta at du har en unik id for hver annonse i adData
      await updateDoc(adRef, { status: newStatus });

      // Gi tilbakemelding eller oppdater annen logikk etter behov
      console.log(`Status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Feil ved oppdatering av status:", error);
    }
  };

  // Oppdater header-tittelen basert på annonsedataen
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: adData.overskrift });
  }, [navigation, adData]);

  const doesChatExist = async (currentUserId, otherUserId, adId) => {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("participants", "array-contains", currentUserId),
      where("adId", "==", adId)
    );

    const querySnapshot = await getDocs(q);
    let existingChatId = null;

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(otherUserId)) {
        existingChatId = doc.id;
      }
    });

    return existingChatId;
  };

  const handleStartChat = async () => {
    try {
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        Alert.alert("Feil", "Du må være logget inn for å starte en chat.");
        return;
      }

      const existingChatId = await doesChatExist(
        currentUserUid,
        adData.uid,
        adData.id
      );

      if (existingChatId) {
        navigation.navigate("ChatScreen", {
          chatId: existingChatId,
          adTitle: adData.overskrift,
        });
      } else {
        const newChat = {
          adId: adData.id,
          participants: [currentUserUid, adData.uid],
          messages: [],
          createdAt: new Date(),
        };
        const newChatDocRef = await addDoc(collection(db, "chats"), newChat);
        navigation.navigate("ChatScreen", {
          chatId: newChatDocRef.id,
          adTitle: adData.overskrift,
        });
      }
    } catch (error) {
      console.error("Feil ved opprettelse av chat:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/vedBilde.png")}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <Text style={{ fontSize: 24, fontWeight: "500", marginBottom: 6 }}>
          {adData.overskrift}
        </Text>

        <View>
          {category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{category.text}</Text>
              <Image source={category.icon} style={styles.icon} />
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.userContainer}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              style={{ width: 40, height: 40, marginRight: 12 }}
              source={require("../../assets/user-1.png")}
            />
            <Text style={{ fontSize: 16 }}>
              {adData.user
                ? `${adData.user.firstName} ${adData.user.lastName}`
                : "Ukjent bruker"}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={buttons.textBtn} onPress={handleStartChat}>
          <Text style={{ fontSize: 16, color: "blue" }}>Send melding</Text>
        </TouchableOpacity>

        <Text>Beskrivelse</Text>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 12,
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.76)",
          }}
        >
          {adData.beskrivelse}
        </Text>

        <Text>Sted</Text>
        <Text
          style={{
            fontSize: 16,
            marginBottom: 12,
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.76)",
          }}
        >
          {adData.sted}
        </Text>
      </View>
    </View>
  );
};

export default AdView;

const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    height: 24,
    width: 24,
    marginLeft: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    marginTop: 16,
    padding: 12,
  },
  userContainer: {
    backgroundColor: colors.lightGrey,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderRadius: 5,
  },
});
