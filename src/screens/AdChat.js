import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  Text,
} from "react-native";
import Message from "../components/Message";
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../firebase";

const AdChat = ({ route }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const { adId } = route.params;

  const fetchMessages = async () => {
    const messagesQuery = query(
      collection(db, "chats", adId, "messages"),
      orderBy("timestamp", "asc")
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messagesData = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setMessages(messagesData);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, "chats", adId, "messages"),
        orderBy("timestamp", "asc")
      ),
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMessages(messagesData);
      }
    );

    return () => {
      // Clean up the listener when the component is unmounted
      unsubscribe();
    };
  }, [adId]);

  const handleSend = async () => {
    // Hent den faktiske UID-en til den nåværende brukeren
    const currentUserId = auth.currentUser.uid;

    // Add logic to send a new message to Firestore
    const messagesCollectionRef = collection(db, "chats", adId, "messages");
    await addDoc(messagesCollectionRef, {
      text: newMessage,
      senderId: currentUserId,
      timestamp: new Date(),
    });

    // Update state to refresh the messages
    setNewMessage("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => item.id + index.toString()}
        renderItem={({ item }) => (
          <Message
            message={item}
            isCurrentUser={item.senderId === auth.currentUser.uid}
          />
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Skriv melding..."
          value={newMessage}
          onChangeText={(text) => setNewMessage(text)}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginRight: 8,
    padding: 8,
  },
});

export default AdChat;
