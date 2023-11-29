import React, { useState, useEffect, useLayoutEffect } from "react";
import { GiftedChat, Message } from "react-native-gifted-chat";
import { auth, db } from "../../firebase";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);

  const { chatId, adTitle } = route.params;

  // Oppdater header-tittelen basert på adTitle
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: adTitle || "Chat" });
  }, [navigation, adTitle]);

  useEffect(() => {
    if (!chatId) return;

    const fetchUserProfileImage = async (userId) => {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      return userDocSnap.exists() ? userDocSnap.data().profileImageUrl : null;
    };

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("sentAt", "desc"));

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const fetchedMessages = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const messageData = doc.data();
          const imageUrl = await fetchUserProfileImage(messageData.sentBy);

          return {
            _id: doc.id,
            text: messageData.text,
            createdAt: new Date(messageData.sentAt.seconds * 1000),
            user: {
              _id: messageData.sentBy,
              avatar: imageUrl,
            },
            customType: messageData.customType || "normal",
          };
        })
      );

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = async (newMessages = []) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    newMessages.forEach(async (message) => {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        text: message.text,
        sentAt: message.createdAt,
        sentBy: message.user._id,
        customType: message.customType || "normal",
      });
    });
  };

  /* Request work start */
  const sendStartWorkRequest = () => {
    const requestMessage = {
      _id: Math.random().toString(),
      text: "Tilby å Starte Arbeid", // Eller en annen beskrivende tekst
      createdAt: new Date(),
      user: {
        _id: auth.currentUser.uid,
      },
      customType: "workStartRequest",
    };

    onSend([requestMessage]);
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;

    if (currentMessage.customType === "workStartRequest") {
      return (
        <View style={styles.requestBox}>
          <Text>{currentMessage.text}</Text>
          <TouchableOpacity>
            <Text>Ja</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text>Nei</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <Message {...props} />;
  };

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <TouchableOpacity onPress={sendStartWorkRequest}>
        <Text>Tilby å Starte Arbeid</Text>
      </TouchableOpacity>
      <GiftedChat
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{
          _id: auth.currentUser.uid,
        }}
        renderMessage={renderMessage}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  requestBox: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
});

export default ChatScreen;
