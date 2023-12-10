import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";
import SearchBar from "../components/SearchBar";

const categorizeConversations = (conversations) => {
  const activeConversations = conversations.filter(
    (conv) => conv.adStatus === "Ikke startet" || conv.adStatus === "Påbegynt"
  );
  const otherConversations = conversations.filter(
    (conv) => conv.adStatus !== "Ikke startet" && conv.adStatus !== "Påbegynt"
  );

  return { activeConversations, otherConversations };
};

export default function ChatChannels() {
  const [conversations, setConversations] = useState([]);
  const navigation = useNavigation();
  const [activeConversations, setActiveConversations] = useState([]);
  const [otherConversations, setOtherConversations] = useState([]);

  const getUserChats = async (userId) => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  const getLastMessage = async (chatId) => {
    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("sentAt", "desc"), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      return querySnapshot.docs[0].data();
    }

    return null; // Endret til null for å indikere ingen meldinger
  };

  const getAdInfo = async (adId) => {
    const adRef = doc(db, "annonser", adId);
    const adDoc = await getDoc(adRef);
    return adDoc.data();
  };

  const fetchConversations = async () => {
    const userId = auth.currentUser.uid;
    const userChats = await getUserChats(userId);
    const updatedConversations = (
      await Promise.all(
        userChats.map(async (chat) => {
          const lastMessage = await getLastMessage(chat.id);
          if (!lastMessage) return null;

          const adInfo = await getAdInfo(chat.adId);
          if (!adInfo || !adInfo.user) return null; // Sjekk at adInfo og adInfo.user eksisterer

          // Bruk informasjonen direkte fra adInfo.user
          return {
            chatId: chat.id,
            lastMessage: lastMessage.text,
            timestamp: new Date(
              lastMessage.sentAt.seconds * 1000
            ).toLocaleString(),
            adStatus: adInfo.status,
            userName: `${adInfo.user.firstName} ${adInfo.user.lastName}`, // Sett brukernavnet
            userProfilePic: adInfo.user.profileImageUrl, // Sett profilbildet
          };
        })
      )
    ).filter(Boolean);

    return updatedConversations;
  };

  useEffect(() => {
    fetchConversations().then((updatedConversations) => {
      const { activeConversations, otherConversations } =
        categorizeConversations(updatedConversations);
      setActiveConversations(activeConversations);
      setOtherConversations(otherConversations);
    });
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const updatedConversations = await fetchConversations();
      const { activeConversations, otherConversations } =
        categorizeConversations(updatedConversations);
      setActiveConversations(activeConversations);
      setOtherConversations(otherConversations);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ marginBottom: 12 }}
      onPress={() => {
        // Når du navigerer til ChatScreen
        navigation.navigate("ChatScreen", {
          chatId: item.chatId,
          adTitle: item.adTitle, // Legg til dette
        });
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {item.userProfilePic && (
          <Image
            source={{ uri: item.userProfilePic }}
            style={{ width: 48, height: 48, borderRadius: 50, marginRight: 12 }}
          />
        )}
        <View>
          <Text style={{ fontSize: 16, fontWeight: "600" }}>
            {item.userName}
          </Text>
          <Text style={{ fontSize: 14, fontWeight: 400 }}>
            {item.lastMessage}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={fonts.header}>Dine meldinger</Text>
      </View>
      <View style={containerStyles.defaultContainer}>
        <SearchBar placeholder={"Søk etter annonser eller samtaler"} />
      </View>
      <View style={containerStyles.defaultContainer}>
        {activeConversations.length > 0 && (
          <>
            <Text style={{ marginBottom: 12 }}>Aktive Samtaler</Text>
            <FlatList
              data={activeConversations}
              renderItem={renderItem}
              keyExtractor={(item) => item.chatId}
            />
          </>
        )}

        {otherConversations.length > 0 && (
          <>
            <Text style={{ marginBottom: 12 }}>Alle Samtaler</Text>
            <FlatList
              data={otherConversations}
              renderItem={renderItem}
              keyExtractor={(item) => item.chatId}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
