import { auth, db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, FlatList } from "react-native";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { chatId } = route.params;

  useEffect(() => {
    if (!chatId) {
      console.error("Chat ID is undefined");
      return;
    }
    // Hent meldinger for denne chatten fra Firebase
    // Dette er en forenklet fremgangsmåte. Du bør bruke en lytter for å hente oppdateringer i sanntid.
    const fetchMessages = async () => {
      const messagesRef = collection(db, `chats/${chatId}/messages`);
      const messagesSnapshot = await getDocs(messagesRef);
      setMessages(
        messagesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };

    fetchMessages();
  }, []);

  const handleSendMessage = async () => {
    // Sende en ny melding til Firebase
    const messageRef = collection(db, `chats/${chatId}/messages`);
    await addDoc(messageRef, {
      text: newMessage,
      sentBy: auth.currentUser?.uid,
      sentAt: new Date(),
    });
    setNewMessage("");
  };

  return (
    <View>
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
