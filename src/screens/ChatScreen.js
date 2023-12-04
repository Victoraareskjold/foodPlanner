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

  const [isAgreementRequested, setIsAgreementRequested] = useState(false);
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
  const sendAgreementRequest = async () => {
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
    setIsAgreementRequested(true);

    // Oppdater chatdokumentet med avtaleforespørselstatus
    const chatDocRef = doc(db, "chats", chatId);
    await updateDoc(chatDocRef, {
      agreementRequested: true,
    });
  };

  // Når du henter chatdata
  useEffect(() => {
    const fetchChatData = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        // Sjekk om avtaleforespørsel allerede er sendt
        const isAgreementRequested =
          chatDocSnap.data().agreementRequested || false;
        setIsAgreementRequested(isAgreementRequested);
      }
    };

    fetchChatData();
  }, [chatId]);

  // Funksjon for å håndtere svar på inngå avtale forespørsel
  const handleAgreementResponse = async (response, messageId, responderId) => {
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

      // Finn brukerens navn som responderer
      const responderDocRef = doc(db, "users", responderId);
      const responderDocSnap = await getDoc(responderDocRef);
      const responderName = responderDocSnap.exists()
        ? `${responderDocSnap.data().firstName} ${
            responderDocSnap.data().lastName
          }`
        : "Ukjent bruker";

      if (response === "Ja") {
        // Oppdater annonsestatus og workerUid i Firestore
        await updateDoc(adDocRef, {
          status: "Pågår",
          workerUid: responderId,
        });

        // Oppdater chatdokumentet med avtalebekreftelsesstatus
        const chatDocRef = doc(db, "chats", chatId);
        await updateDoc(chatDocRef, {
          agreementConfirmed: true,
        });

        // Sett avtalen som bekreftet
        setIsAgreementConfirmed(true);

        // Oppdater meldingens customType i Firestore
        const messageDocRef = doc(db, `chats/${chatId}/messages`, messageId);
        await updateDoc(messageDocRef, {
          customType: "agreementConfirmed",
        });

        // Oppdater meldingsteksten
        const updatedMessages = messages.map((msg) => {
          if (msg._id === messageId) {
            const newMessageText = `${responderName} har godtatt avtalen`;

            return {
              ...msg,
              text: newMessageText,
              customType: "agreementConfirmed",
            };
          }
          return msg;
        });

        setMessages(updatedMessages);
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
                ? /* ? `${currentMessage.user.name} har godtatt avtalen` */
                  `Avtalen er inngått.`
                : "Du har godtatt avtalen"}
            </Text>
          </View>
        );

      case "agreementDeclined":
        return (
          <View style={styles.declinedRequestBox}>
            <Text>
              {currentMessage.user._id === auth.currentUser.uid
                ? /* ? `${currentMessage.user.name} har avslått avtalen` */
                  `Avtalen er avbrutt.`
                : "Du har avbrutt avtalen"}
            </Text>
          </View>
        );

      default:
        return <Message {...props} />;
    }
  };

  useEffect(() => {
    const chatDocRef = doc(db, "chats", chatId);

    // Lytter til endringer i chat-dokumentet
    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Oppdater lokal tilstand basert på om en avtaleforespørsel er sendt
        setIsAgreementRequested(data.agreementRequested || false);
        setIsAgreementConfirmed(data.agreementConfirmed || false);
      }
    });

    return () => unsubscribe(); // Rydd opp lytteren når komponenten unmounts
  }, [chatId]);

  return (
    <View style={{ backgroundColor: "white", flex: 1 }}>
      {!isAgreementRequested && (
        <TouchableOpacity onPress={sendAgreementRequest}>
          <Text>Inngå Avtale</Text>
        </TouchableOpacity>
      )}

      {isAgreementConfirmed && (
        <TouchableOpacity onPress={sendStartWorkRequest}>
          <Text>Start Arbeid</Text>
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
