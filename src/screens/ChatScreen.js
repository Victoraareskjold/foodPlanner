import React, { useState, useEffect, useLayoutEffect } from "react";
import { GiftedChat, Message, InputToolbar } from "react-native-gifted-chat";
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
  const [isUserAdCreator, setIsUserAdCreator] = useState(false);
  const [showAgreementCard, setShowAgreementCard] = useState(true);

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
            const ad = adDocSnap.data();
            setAdData(ad);
            setIsUserAdCreator(ad.uid === auth.currentUser.uid); // Sjekk om brukeren er annonsens oppretter
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
        const responderDocRef = doc(db, "users", responderId);
        const responderDocSnap = await getDoc(responderDocRef);

        let responderName = "";
        if (responderDocSnap.exists()) {
          const responderData = responderDocSnap.data();
          responderName = `${responderData.firstName} ${responderData.lastName}`;
        } else {
          console.error("Kunne ikke finne brukerdata for responderId");
          return; // Håndter feilen på passende måte
        }

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

  const CustomButtons = () => (
    <View>
      {!isUserAdCreator && !isAgreementRequested && (
        <TouchableOpacity
          onPress={sendAgreementRequest}
          style={styles.requestBtn}
        >
          <Text>Inngå Avtale</Text>
        </TouchableOpacity>
      )}

      {!isUserAdCreator && !doesWorkSessionExist() && isAgreementConfirmed && (
        <TouchableOpacity
          onPress={sendStartWorkRequest}
          style={styles.requestBtn}
        >
          <Text>Start Arbeid</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const appendSpecialCard = (messages) => {
    if (showAgreementCard) {
      const specialCard = {
        _id: "special-card",
        text: "Er du klar for å inngå en avtale?",
        createdAt: new Date(),
        user: { _id: "system" },
        system: true,
      };
      return [...messages, specialCard];
    }
    return messages;
  };

  const onSendAgreement = () => {
    const agreementMessage = {
      _id: Math.random().toString(),
      text: "Avtaleforespørsel sendt",
      createdAt: new Date(),
      user: { _id: auth.currentUser.uid },
      customType: "agreementRequest",
    };
    setShowAgreementCard(false); // Skjul kortet
    onSend([agreementMessage]);
  };

  const renderMessage = (props) => {
    const { currentMessage } = props;

    if (props.currentMessage._id === "special-card") {
      return (
        <TouchableOpacity onPress={onSendAgreement}>
          <View style={styles.specialCard}>
            <Text>Er du klar for å inngå en avtale?</Text>
            <Text style={styles.buttonText}>Inngå Avtale</Text>
          </View>
        </TouchableOpacity>
      );
    }

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
    <View style={{ backgroundColor: "#F7F7F9", flex: 1 }}>
      <ChatAdCard adData={adData} />
      <CustomButtons />
      <GiftedChat
        timeFormat="HH:mm"
        dateFormat="D. MMMM"
        locale="nb-NO"
        messages={messages}
        onSend={(messages) => onSend(messages)}
        user={{ _id: auth.currentUser.uid }}
        renderMessage={renderMessage}
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={{ marginBottom: 6 }} />
        )}
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
    marginHorizontal: 32,
    marginVertical: 12,
  },
  requestBoxReceiver: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginHorizontal: 32,
    marginBottom: 12,
  },
  confirmedRequestBox: {
    backgroundColor: colors.lightGreen, // Eksempel på grønn bakgrunnsfarge
    padding: 10,
    marginHorizontal: 32,
    marginBottom: 12,
    borderRadius: 10,
  },
  declinedRequestBox: {
    backgroundColor: colors.lightRed, // Rød bakgrunnsfarge
    padding: 10,
    marginHorizontal: 32,
    marginBottom: 12,
    borderRadius: 10,
  },
  requestBtn: {
    backgroundColor: colors.primary,
    marginHorizontal: 32,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
});

export default ChatScreen;
