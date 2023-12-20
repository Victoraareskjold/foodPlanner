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
  setDoc,
} from "firebase/firestore";
import colors from "../../styles/colors";
import AgreementRequestCard from "../components/AgreementRequestCard";
import WorkStartRequestCard from "../components/WorkStartRequestCard";
import ChatAdCard from "../components/ChatAdCard";
import WorkSessionCard from "../components/WorkSessionCard";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [adData, setAdData] = useState(null);
  const [isAgreementRequested, setIsAgreementRequested] = useState(false);
  const [isAgreementConfirmed, setIsAgreementConfirmed] = useState(false);
  const { chatId, adTitle } = route.params;
  const [otherUserId, setOtherUserId] = useState(null);
  const [timer, setTimer] = useState({
    running: false,
    startTime: null,
    elapsed: 0,
  });

  useEffect(() => {
    const fetchOtherParticipantInfo = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        const participants = chatDocSnap.data().participants;
        const otherUserId = participants.find(
          (uid) => uid !== auth.currentUser.uid
        );

        const userDocRef = doc(db, "users", otherUserId);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const otherUserName = `${userDocSnap.data().firstName} ${
            userDocSnap.data().lastName
          }`;
          navigation.setOptions({
            headerTitle: otherUserName,
          });
        }
      }
    };

    fetchOtherParticipantInfo();
  }, [chatId, navigation]);

  useEffect(() => {
    const fetchOtherParticipantId = async () => {
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (chatDocSnap.exists()) {
        const participants = chatDocSnap.data().participants;
        const otherUserId = participants.find(
          (uid) => uid !== auth.currentUser.uid
        );
        setOtherUserId(otherUserId);
      }
    };

    fetchOtherParticipantId();
  }, [chatId]);

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
    const existingSession = messages.find(
      (message) => message.customType === "workSession"
    );
    if (!existingSession) {
      const sessionMessage = {
        _id: Math.random().toString(),
        text: "",
        createdAt: new Date(),
        user: {
          _id: auth.currentUser.uid,
        },
        customType: "workSession",
        timerStatus: "stopped",
      };
      onSend([sessionMessage]);
    }
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
      if (!chatDocSnap.exists()) return;

      const adId = chatDocSnap.data().adId;
      const adDocRef = doc(db, "annonser", adId);
      const adDocSnap = await getDoc(adDocRef);
      if (!adDocSnap.exists()) return;

      if (response === "Ja") {
        await updateDoc(adDocRef, {
          status: "Pågår",
          workerUid: otherUserId, // Setter den andre brukeren som arbeider
        });

        // Lagre starttidspunktet for arbeidet
        const startTime = new Date();
        await updateDoc(chatDocRef, {
          workStartTime: startTime,
          workStatus: "running",
        });

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

  const sendTimerUpdateMessage = async (text, customType) => {
    await addDoc(collection(db, `chats/${chatId}/messages`), {
      text,
      sentAt: new Date(),
      sentBy: auth.currentUser.uid,
      customType,
    });
  };

  const startTimer = async () => {
    const timerRef = doc(db, "chats", chatId, "timer", "current");
    const now = new Date();
    await setDoc(
      timerRef,
      {
        running: true,
        startTime: now,
      },
      { merge: true }
    );
    updateWorkSessionMessageInState("running");
  };

  const pauseTimer = async () => {
    const timerRef = doc(db, "chats", chatId, "timer", "current");
    const docSnap = await getDoc(timerRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.startTime) {
        const now = new Date();
        const newElapsed =
          Math.floor(
            (now.getTime() - data.startTime.toDate().getTime()) / 1000
          ) + (data.elapsed || 0);
        await setDoc(
          timerRef,
          {
            running: false,
            elapsed: newElapsed,
          },
          { merge: true }
        );
      }
    }
    updateWorkSessionMessageInState("paused");
  };

  const stopTimer = async () => {
    const timerRef = doc(db, "chats", chatId, "timer", "current");
    await setDoc(
      timerRef,
      {
        running: false,
        startTime: null,
        elapsed: 0,
      },
      { merge: true }
    );
    updateWorkSessionMessageInState("stopped");
  };

  const doesWorkSessionExist = () => {
    return messages.some((message) => message.customType === "workSession");
  };

  const updateTimer = async () => {
    const timerRef = doc(db, "chats", chatId, "timer", "current");
    const docSnap = await getDoc(timerRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.running && data.startTime) {
        const now = new Date();
        const newElapsed =
          Math.floor(
            (now.getTime() - data.startTime.toDate().getTime()) / 1000
          ) + (data.elapsed || 0);
        setTimer({ ...timer, elapsed: newElapsed });
      }
    }
  };

  const updateWorkSessionMessageInState = (newStatus) => {
    setMessages((prevMessages) => {
      return prevMessages.map((message) => {
        if (message.customType === "workSession") {
          return { ...message, timerStatus: newStatus };
        }
        return message;
      });
    });
  };

  useEffect(() => {
    let interval;
    if (timer.running) {
      interval = setInterval(updateTimer, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer.running]);

  useEffect(() => {
    const timerRef = doc(db, "chats", chatId, "timer", "current");

    const unsubscribe = onSnapshot(timerRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setTimer({
          running: data.running,
          startTime: data.startTime?.toDate(),
          elapsed: data.elapsed || 0,
        });
      }
    });

    return unsubscribe;
  }, [chatId]);

  const renderMessage = (props) => {
    const { currentMessage } = props;

    // I ChatScreen-komponenten, inne i renderMessage-funksjonen:
    if (currentMessage.customType === "workSession") {
      return (
        <WorkSessionCard
          currentMessage={currentMessage}
          onStart={() => startTimer()}
          onPause={() => pauseTimer()}
          onStop={() => stopTimer()}
          elapsed={timer.elapsed}
          isRunning={timer.running}
        />
      );
    }

    const isSender = currentMessage.user._id === auth.currentUser.uid;

    // Bestemmer stilen basert på om brukeren er senderen
    const requestBoxStyle = isSender
      ? styles.requestBoxSender
      : styles.requestBoxReceiver;

    /* if (
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
    } */

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
    <View style={{ backgroundColor: "#F7F7F9", flex: 1 }}>
      <ChatAdCard adData={adData} />
      {!isAgreementRequested && (
        <TouchableOpacity onPress={sendAgreementRequest}>
          <Text>Inngå Avtale</Text>
        </TouchableOpacity>
      )}

      {!isAgreementRequested && (
        <TouchableOpacity onPress={sendAgreementRequest}>
          <Text>Inngå Avtale</Text>
        </TouchableOpacity>
      )}

      {!doesWorkSessionExist() && (
        <TouchableOpacity
          onPress={sendStartWorkRequest}
          style={styles.startWorkButton}
        >
          <Text>Start Arbeid</Text>
        </TouchableOpacity>
      )}

      <GiftedChat
        timeFormat="HH:mm"
        dateFormat="D. MMMM"
        locale="nb-NO"
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: auth.currentUser.uid }}
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
    margin: 6,
  },
  requestBoxReceiver: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    margin: 6,
  },
  confirmedRequestBox: {
    backgroundColor: colors.lightGreen, // Eksempel på grønn bakgrunnsfarge
    padding: 10,
    margin: 6,
    borderRadius: 10,
  },
  declinedRequestBox: {
    backgroundColor: colors.lightRed, // Rød bakgrunnsfarge
    padding: 10,
    margin: 6,
    borderRadius: 10,
  },
});

export default ChatScreen;
