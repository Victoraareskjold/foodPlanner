import React, { useState, useEffect, useLayoutEffect } from "react";
import { GiftedChat } from "react-native-gifted-chat";
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

  const { chatId, adTitle } = route.params;

  // Oppdater header-tittelen basert på adTitle
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: adTitle || "Chat" });
  }, [navigation, adTitle]);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy("sentAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.id,
          text: doc.data().text,
          createdAt: new Date(doc.data().sentAt.seconds * 1000),
          user: {
            _id: doc.data().sentBy,
            // Her kan du legge til mer brukerinformasjon
          },
        }))
      );
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = async (newMessages = []) => {
    const { _id, createdAt, text, user } = newMessages[0];
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text,
      sentAt: createdAt,
      sentBy: user._id,
      // Andre felt om nødvendig
    });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={(messages) => onSend(messages)}
      user={{
        _id: auth.currentUser.uid,
        // Legg til mer informasjon om brukeren her om nødvendig
      }}
    />
  );
};

export default ChatScreen;
