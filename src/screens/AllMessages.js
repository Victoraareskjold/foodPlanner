import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const AllMessages = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchMessages = async () => {
        const userUid = auth.currentUser.uid;
      
        // Replace 'userUid' with the actual user ID you want to retrieve messages for
        const messagesQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', userUid)
        );
      
        const messagesSnapshot = await getDocs(messagesQuery);
        const messagesData = [];
      
        // Iterate through each chat and retrieve messages
        for (const chatDoc of messagesSnapshot.docs) {
          const chatId = chatDoc.id;
          const chatMessagesQuery = query(
            collection(db, 'chats', chatId, 'messages'),
            where('senderId', '==', userUid)
            // Uncomment the following line if you want to include messages where the user is the receiver
            // where('receiverId', '==', userUid)
          );
      
          const chatMessagesSnapshot = await getDocs(chatMessagesQuery);
          const chatMessages = chatMessagesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
      
          // Add chat messages to the overall messagesData array
          messagesData.push(...chatMessages);
        }
      
        // Sort messagesData by timestamp or any other relevant criteria
        messagesData.sort((a, b) => a.timestamp - b.timestamp);
      
        setMessages(messagesData);
      };      

    fetchMessages();
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.messageItem}
            onPress={() => navigation.navigate('AdChat', { adId: item.adId, otherUserId: item.receiverId, firstName: item.otherUserName })}
          >
            <Text>{item.otherUserName}</Text>
            {/* Add other relevant information about the message */}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  messageItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AllMessages;
