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
  const [adData, setAdData] = useState(null);
  const { chatId, adTitle } = route.params;

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
    try {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        console.error("No such document!");
        return;
      }

      const adId = chatDocSnap.data().adId;
      const adDocRef = doc(db, "annonser", adId);
      const adDocSnap = await getDoc(adDocRef);

      if (!adDocSnap.exists()) {
        console.error("No such document!");
        return;
      }

      const adOwnerId = adDocSnap.data().uid; // Eieren av annonsen
      const workerUid =
        senderId !== adOwnerId
          ? senderId
          : chatDocSnap.data().participants.find((uid) => uid !== senderId);

      if (response === "Ja") {
        // Oppdater annonsestatus og workerUid i Firestore
        await updateDoc(adDocRef, {
          status: "Pågår",
          workerUid: workerUid,
        });

        // Oppdater meldingens customType i Firestore
        const messageDocRef = doc(db, `chats/${chatId}/messages`, messageId);
        await updateDoc(messageDocRef, {
          customType: "agreementConfirmed",
        });

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

        // Oppdater eventuell tilstandslogikk eller UI her basert på den oppdaterte meldingen
      } else if (response === "Nei") {
        // Håndter avslag av avtalen her
        // Du kan legge til kode her for å håndtere situasjonen når avtalen avslås
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    const isSender = currentMessage.user._id === auth.currentUser.uid;

    // Bestemmer stilen basert på om brukeren er senderen
    const requestBoxStyle = isSender
      ? styles.requestBoxSender
      : styles.requestBoxReceiver;

    switch (currentMessage.customType) {
      case "workStartRequest":
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
                      handleAgreementResponse(
                        "Ja",
                        currentMessage._id,
                        auth.currentUser.uid
                      )
                    }
                  >
                    <Text>Ja</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      handleAgreementResponse(
                        "Nei",
                        currentMessage._id,
                        auth.currentUser.uid
                      )
                    }
                  >
                    <Text>Nei</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        );

      case "agreementRequest":
        return (
          <AgreementRequestCard
            isSender={isSender}
            userName={currentMessage.user.name}
            onAccept={() =>
              handleAgreementResponse(
                "Ja",
                currentMessage._id,
                auth.currentUser.uid
              )
            }
            onDecline={() =>
              handleAgreementResponse(
                "Nei",
                currentMessage._id,
                auth.currentUser.uid
              )
            }
          />
        );

      case "agreementConfirmed":
        return (
          <View style={styles.confirmedRequestBox}>
            <Text>
              {currentMessage.user._id === auth.currentUser.uid
                ? `${currentMessage.user.name} har godtatt avtalen`
                : "Du har godtatt avtalen"}
            </Text>
          </View>
        );

      case "agreementDeclined":
        return (
          <View style={styles.declinedRequestBox}>
            <Text>
              {currentMessage.user._id === auth.currentUser.uid
                ? `${currentMessage.user.name} har avslått avtalen`
                : "Du har godtatt avtalen"}
            </Text>
          </View>
        );

      default:
        return <Message {...props} />;
    }
  };

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      <TouchableOpacity onPress={sendAgreementRequest}>
        <Text>Inngå Avtale</Text>
      </TouchableOpacity>
      {messages.some(
        (m) => m.customType === "agreementRequest" && m.status === "godkjent"
      ) && (
        <TouchableOpacity onPress={sendStartWorkRequest}>
          <Text>Tilby å Starte Arbeid</Text>
        </TouchableOpacity>
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
  declinedRequestBox: {
    backgroundColor: "#FFD6D6", // Rød bakgrunnsfarge
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
});

export default ChatScreen;
