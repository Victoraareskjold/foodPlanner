import React, { useState, useEffect, useLayoutEffect } from "react";
import { GiftedChat, Message } from "react-native-gifted-chat";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Touchable,
} from "react-native";
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
import colors from "../../styles/colors";
import AgreementRequestCard from "../components/AgreementRequestCard";
import WorkStartRequestCard from "../components/WorkStartRequestCard";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [adData, setAdData] = useState(null);
  const [isAgreementRequested, setIsAgreementRequested] = useState(false);
  const [isAgreementConfirmed, setIsAgreementConfirmed] = useState(false);
  const { chatId, adTitle } = route.params;

  const [isWorkStarted, setIsWorkStarted] = useState(false);
  const [showStopwatch, setShowStopwatch] = useState(false);
  const [workTimer, setWorkTimer] = useState(0); // Holder styr på tiden for stoppeklokken
  const [workInterval, setWorkInterval] = useState(null);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: adTitle || "Chat" });
  }, [navigation, adTitle]);

  useEffect(() => {
    const fetchAdData = async () => {
      try {
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
      const senderName = `${senderData.firstName} ${senderData.lastName}`;
      newMessages.forEach(async (message) => {
        await addDoc(collection(db, `chats/${chatId}/messages`), {
          text: message.text,
          sentAt: message.createdAt,
          sentBy: message.user._id,
          userName: senderName,
          customType: message.customType || "normal",
        });
      });
    }
  };

  const sendStartWorkRequest = () => {
    const existingRequest = messages.find(
      (message) => message.customType === "workStartRequest"
    );
    if (existingRequest) {
      alert("Det finnes allerede en arbeidsstartforespørsel.");
      return;
    }
    const requestMessage = {
      _id: Math.random().toString(),
      text: "Tilby å Starte Arbeid",
      createdAt: new Date(),
      user: {
        _id: auth.currentUser.uid,
      },
      customType: "workStartRequest",
    };
    onSend([requestMessage]);
  };

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
    await updateDoc(doc(db, "chats", chatId), {
      agreementRequested: true,
    });
  };

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
      const responderDocRef = doc(db, "users", responderId);
      const responderDocSnap = await getDoc(responderDocRef);
      const responderName = responderDocSnap.exists()
        ? `${responderDocSnap.data().firstName} ${
            responderDocSnap.data().lastName
          }`
        : "Ukjent bruker";
      if (response === "Ja") {
        await updateDoc(adDocRef, {
          status: "Pågår",
          workerUid: responderId,
        });

        // Lagre starttidspunktet for arbeidet
        const startTime = new Date();
        await updateDoc(chatDocRef, {
          workStartTime: startTime,
          workStatus: "running",
        });

        // Vis stoppeklokken
        setShowStopwatch(true);

        await updateDoc(chatDocRef, {
          agreementConfirmed: true,
        });
        setIsAgreementConfirmed(true);
        const messageDocRef = doc(db, `chats/${chatId}/messages`, messageId);
        await updateDoc(messageDocRef, {
          customType: "agreementConfirmed",
        });
        const updatedMessages = messages.map((msg) => {
          if (msg._id === messageId) {
            return {
              ...msg,
              text: `${responderName} har godtatt avtalen`,
              customType: "agreementConfirmed",
            };
          }
          return msg;
        });
        setMessages(updatedMessages);
      } else if (response === "Nei") {
        // Håndter avslag av avtalen her
      }
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const startStopwatch = async () => {
    await updateDoc(doc(db, "chats", chatId), {
      workStartTime: new Date(),
      workStatus: "running",
    });
  };

  // Funksjon for å stoppe stoppeklokken
  const stopStopwatch = async () => {
    await updateDoc(doc(db, "chats", chatId), {
      workStatus: "paused", // eller "stopped"
    });
  };

  useEffect(() => {
    const chatDocRef = doc(db, "chats", chatId);

    const unsubscribe = onSnapshot(chatDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setIsAgreementRequested(data.agreementRequested || false);
        setIsAgreementConfirmed(data.agreementConfirmed || false);

        if (data.workStartTime) {
          const startTime = data.workStartTime.toDate();
          const currentTime = new Date();
          const elapsedMillis = currentTime.getTime() - startTime.getTime();
          const elapsedSeconds = Math.floor(elapsedMillis / 1000);

          setWorkTimer(elapsedSeconds);

          if (data.workStatus === "running" && !workInterval) {
            setWorkInterval(
              setInterval(() => {
                setWorkTimer((prevTime) => prevTime + 1);
              }, 1000)
            );
          } else if (data.workStatus !== "running" && workInterval) {
            clearInterval(workInterval);
            setWorkInterval(null);
          }
        }
      }
    });

    return () => {
      unsubscribe();
      if (workInterval) clearInterval(workInterval);
    };
  }, [chatId]);

  const formatTime = (milliseconds) => {
    let totalSeconds = Math.floor(milliseconds / 1000);
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;
    const isSender = currentMessage.user._id === auth.currentUser.uid;

    // Bestemmer stilen basert på om brukeren er senderen
    const requestBoxStyle = isSender
      ? styles.requestBoxSender
      : styles.requestBoxReceiver;

    if (
      currentMessage.customType === "workStartRequest" &&
      isAgreementConfirmed
    ) {
      return (
        <View style={{ padding: 10 }}>
          <Text>Arbeidstid: {formatTime(workTimer * 1000)}</Text>
          <TouchableOpacity onPress={startStopwatch}>
            <Text>Start</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={stopStopwatch}>
            <Text>Stopp</Text>
          </TouchableOpacity>
        </View>
      );
    }

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
