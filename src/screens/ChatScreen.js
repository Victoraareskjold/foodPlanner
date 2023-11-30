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
  updateDoc,
} from "firebase/firestore";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../styles/colors";

import AgreementRequestCard from "../components/AgreementRequestCard";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const adOwnerId = route.params.uid;
  const [adData, setAdData] = useState(null);
  const { chatId, adTitle } = route.params;
  const [isAgreementConfirmed, setIsAgreementConfirmed] = useState(false);

  // Oppdater header-tittelen basert på adTitle
  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: adTitle || "Chat" });
  }, [navigation, adTitle]);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
        // Antar at chat-dokumentet inneholder adId
        const chatDocRef = doc(db, "chats", chatId);
        const chatDocSnap = await getDoc(chatDocRef);

        if (chatDocSnap.exists() && chatDocSnap.data().adId) {
          const adId = chatDocSnap.data().adId;
          const adDocRef = doc(db, "annonser", adId);
          const adDocSnap = await getDoc(adDocRef);

          if (adDocSnap.exists()) {
            setAdData(adDocSnap.data());
          }
        }
      } catch (error) {
        console.error("Feil ved henting av annonsedata:", error);
      }
    };

    fetchAdData();
  }, [chatId]);

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
              name: messageData.userName,
            },
            customType: messageData.customType,
          };
        })
      );

      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [chatId]);

  const onSend = async (newMessages = []) => {
    const senderId = auth.currentUser.uid;
    const senderDocRef = doc(db, "users", senderId);
    const senderDocSnap = await getDoc(senderDocRef);

    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, newMessages)
    );

    if (senderDocSnap.exists()) {
      const senderData = senderDocSnap.data();
      const senderName = `${senderData.firstName} ${senderData.lastName}`; // Anta at brukernavn er lagret i disse feltene

      newMessages.forEach(async (message) => {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
          text: message.text,
          sentAt: message.createdAt,
          sentBy: message.user._id,
          userName: senderName, // Her legges brukernavn til
          customType: message.customType || "normal",
        });
      });
    }
  };

  /* Request work start */
  const sendStartWorkRequest = () => {
    /* If request already exists */
    const existingRequest = messages.find(
      (message) => message.customType === "workStartRequest"
    );

    if (existingRequest) {
      // Vis en advarsel hvis det allerede finnes en forespørsel
      alert("Det finnes allerede en arbeidsstartforespørsel.");
      return;
    }
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

  // Funksjon for å sende inngå avtale forespørsel
  const sendAgreementRequest = () => {
    const existingAgreementRequest = messages.find(
      (message) => message.customType === "agreementRequest"
    );

    if (existingAgreementRequest) {
      alert("Det finnes allerede en avtaleforespørsel.");
      return;
    }

    const agreementMessage = {
      _id: Math.random().toString(),
      text: "Inngå Avtale",
      createdAt: new Date(),
      user: { _id: auth.currentUser.uid },
      customType: "agreementRequest",
    };

    onSend([agreementMessage]);
  };

  // Funksjon for å håndtere svar på inngå avtale forespørsel
  const handleAgreementResponse = async (response, messageId, senderId) => {
    if (response === "Ja") {
      try {
        const chatDocRef = doc(db, "chats", chatId);
        const chatDocSnap = await getDoc(chatDocRef);
        if (chatDocSnap.exists() && chatDocSnap.data().adId) {
          const adId = chatDocSnap.data().adId;
          const adDocRef = doc(db, "annonser", adId);

          // Finn workerUid basert på hvem som sender forespørselen
          const currentUserId = auth.currentUser.uid;
          const participants = chatDocSnap.data().participants;
          const workerUid = participants.find((uid) => uid !== currentUserId);

          // Oppdater annonse med ny status og workerUid
          await updateDoc(adDocRef, {
            status: "Pågår",
            workerUid: workerUid,
          });

          // Oppdater meldingens customType i Firestore
          const messageDocRef = doc(db, `chats/${chatId}/messages`, messageId);
          await updateDoc(messageDocRef, {
            customType: "agreementConfirmed",
          });
        }

        // Oppdater meldingsteksten
        const updatedMessages = messages.map((msg) => {
          if (msg._id === messageId) {
            const isSender = senderId === auth.currentUser.uid;
            const newMessageText = isSender
              ? "Du har akseptert avtalen"
              : `${msg.user.name} har akseptert avtalen`;
            return {
              ...msg,
              text: newMessageText,
              customType: "agreementConfirmed",
            };
          }
          return msg;
        });
        setMessages(updatedMessages);
      } catch (error) {
        console.error("Feil ved oppdatering av annonsestatus:", error);
      }
      setIsAgreementConfirmed(true);
    }
    // Håndter "Nei" svar eller andre handlinger her
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    const isSender = currentMessage.user._id === auth.currentUser.uid;

    const requestBoxStyle = isSender
      ? styles.requestBoxSender
      : styles.requestBoxReceiver;

    /* Render for "tilby å starte arbeid" request */
    if (currentMessage.customType === "workStartRequest") {
      return (
        <View style={{ paddingHorizontal: 8 }}>
          <View style={requestBoxStyle}>
            <Text>
              {isSender ? "Din avtaleforespørsel" : "Avtalen er inngått"}
            </Text>
            {!isSender && (
              <>
                <TouchableOpacity
                  onPress={() =>
                    handleAgreementResponse("Ja", currentMessage._id)
                  }
                >
                  <Text>Ja</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleAgreementResponse("Nei", currentMessage._id)
                  }
                >
                  <Text>Nei</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    }

    // Render for "Inngå Avtale" request
    if (currentMessage.customType === "agreementRequest") {
      return (
        <AgreementRequestCard
          isSender={isSender}
          userName={currentMessage.user.name}
          onAccept={() =>
            handleAgreementResponse(
              "Ja",
              currentMessage._id,
              currentMessage.user._id
            )
          }
          onDecline={() =>
            handleAgreementResponse(
              "Nei",
              currentMessage._id,
              currentMessage.user._id
            )
          }
        />
      );
    }

    if (currentMessage.customType === "agreementConfirmed") {
      return (
        <View style={styles.confirmedRequestBox}>
          <Text>
            {isSender
              ? "Du har akseptert avtalen"
              : `${currentMessage.user.name} har akseptert avtalen`}
          </Text>
        </View>
      );
    }

    return <Message {...props} />;
  };

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      {adData && auth.currentUser.uid !== adData.uid && (
        <>
          <TouchableOpacity onPress={sendAgreementRequest}>
            <Text>Inngå Avtale</Text>
          </TouchableOpacity>
          {messages.some(
            (m) =>
              m.customType === "agreementRequest" && m.status === "godkjent"
          ) && (
            <TouchableOpacity onPress={sendStartWorkRequest}>
              <Text>Tilby å Starte Arbeid</Text>
            </TouchableOpacity>
          )}
        </>
      )}
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
  requestBox: {},
  requestBoxSender: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  requestBoxReceiver: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  confirmedRequestBox: {
    backgroundColor: "#DFF0D8", // Eksempel på grønn bakgrunnsfarge
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
});

export default ChatScreen;
