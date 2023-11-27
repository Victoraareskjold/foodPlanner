import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
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

const ChatChannels = () => {
  const [conversations, setConversations] = useState([]);
  const navigation = useNavigation();

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
          if (!lastMessage) return null; // Hopper over chater uten meldinger

          const adInfo = await getAdInfo(chat.adId);
          return {
            chatId: chat.id,
            lastMessage: lastMessage.text,
            timestamp: new Date(
              lastMessage.sentAt.seconds * 1000
            ).toLocaleString(),
            adTitle: adInfo ? adInfo.overskrift : "Annonse",
          };
        })
      )
    ).filter(Boolean); // Filtrer ut null-verdier

    return updatedConversations;
  };

  useEffect(() => {
    fetchConversations().then(setConversations);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const updatedConversations = await fetchConversations();
      setConversations(updatedConversations);
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ backgroundColor: "grey", marginBottom: 12 }}
      onPress={() => {
        // Når du navigerer til ChatScreen
        navigation.navigate("ChatScreen", {
          chatId: item.chatId,
          adTitle: item.adTitle, // Legg til dette
        });
      }}
    >
      <Text>{item.adTitle}</Text>
      <Text>{item.lastMessage}</Text>
      <Text>{item.timestamp}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ padding: 60 }}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.chatId}
      />
    </View>
  );
};

export default ChatChannels;
