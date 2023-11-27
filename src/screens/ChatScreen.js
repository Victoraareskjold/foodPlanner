import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { chatId } = route.params;

  useEffect(() => {
    if (!chatId) {
      console.error("Chat ID is undefined");
      return;
    }

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("sentAt", "asc")); // Sorterer meldinger etter tidspunkt

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesArray = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(messagesArray);
    });

    return () => unsubscribe(); // Rengjør abonnementet når komponenten avmonteres
  }, [chatId]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return; // Forhindrer å sende tomme meldinger

    const messageRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messageRef, {
      text: newMessage.trim(),
      sentBy: auth.currentUser?.uid,
      sentAt: new Date(),
    });

    setNewMessage("");
  };

  return (
    <View>
      {/* FlatList og TextInput som før */}
      <FlatList
        data={messages}
        renderItem={({ item }) => <Text>{item.text}</Text>}
        keyExtractor={(item) => item.id}
      />
      <TextInput
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Skriv en melding..."
      />
      <Button title="Send" onPress={handleSendMessage} />
    </View>
  );
};

export default ChatScreen;
