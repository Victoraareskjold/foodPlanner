import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { collectionGroup, query, onSnapshot } from "firebase/firestore";
import { auth, db } from "../../firebase";

import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";

const AllMessages = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const userUid = auth.currentUser.uid;
    const chatsQuery = query(collectionGroup(db, "messages"));

    const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
      const chatData = {};

      querySnapshot.forEach((chatDoc) => {
        const chatId = chatDoc.ref.parent.parent.id;
        const latestMessage = chatDoc.data();

        if (
          !chatData[chatId] ||
          latestMessage.timestamp > chatData[chatId].timestamp
        ) {
          chatData[chatId] = {
            chatId: chatId,
            otherUserId:
              latestMessage.senderId !== userUid
                ? latestMessage.senderId
                : latestMessage.receiverId,
            otherUserName: latestMessage.otherUserName,
            adId: latestMessage.senderId,
            lastMessage: latestMessage.text,
            timestamp: latestMessage.timestamp,
          };
        }
      });

      const latestMessages = Object.values(chatData);

      setChats(latestMessages);
    });

    return () => {
      // Rens opp og avslutt lytteren når komponenten blir avmontert
      unsubscribe();
    };
  }, []);

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
      <View style={styles.container}>
        <FlatList
          scrollEnabled
          data={chats}
          keyExtractor={(item) => item.chatId}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.messageItem}
              onPress={() =>
                navigation.navigate("AdChat", {
                  adId: adData.id,
                  firstName: adData.user ? adData.user.firstName : "",
                })
              }
            >
              <Text>{item.adId}</Text>
              <Text>Sist melding: {item.lastMessage}</Text>
              {/* Add other relevant information about the message */}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});

export default AllMessages;
