import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, onSnapshot, collectionGroup, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';

const AllMessages = () => {
  const navigation = useNavigation();
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userUid = auth.currentUser.uid;
    
        const chatsQuery = query(collectionGroup(db, 'messages'));
        const chatsSnapshot = await getDocs(chatsQuery);
        console.log('Chats Snapshot:', chatsSnapshot.docs);
    
        const chatsData = [];
    
        for (const chatDoc of chatsSnapshot.docs) {
          const chatId = chatDoc.ref.parent.parent.id; // Get the chatId from the parent's parent (chats/chatId/messages/messageId)
          const latestMessage = chatDoc.data();
    
          // Check if chatId already exists in chatsData
          const existingChatIndex = chatsData.findIndex((chat) => chat.chatId === chatId);
    
          if (existingChatIndex === -1) {
            // If chatId doesn't exist, add it to chatsData
            chatsData.push({
              chatId: chatId,
              otherUserId: latestMessage.senderId !== userUid ? latestMessage.senderId : latestMessage.receiverId,
              otherUserName: latestMessage.otherUserName,
              adId: latestMessage.adId,
              lastMessage: latestMessage.text,
              timestamp: latestMessage.timestamp,
            });
          } else {

            // If chatId exists, update the existing entry if the new message is more recent

            if (latestMessage.timestamp.seconds > chatsData[existingChatIndex].timestamp.seconds ||
                (latestMessage.timestamp.seconds === chatsData[existingChatIndex].timestamp.seconds &&
                  latestMessage.timestamp.nanoseconds > chatsData[existingChatIndex].timestamp.nanoseconds)) {
              chatsData[existingChatIndex].lastMessage = latestMessage.text;
              chatsData[existingChatIndex].timestamp = latestMessage.timestamp;
            }

          }
        }
    
        console.log('Chats Data:', chatsData);
    
        // Sort chatsData by timestamp or any other relevant criteria
        chatsData.sort((a, b) => b.timestamp - a.timestamp);
    
        setChats(chatsData);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };    

    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Dine meldinger</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.chatId + item.timestamp.seconds + item.timestamp.nanoseconds}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.messageItem}
            onPress={() => navigation.navigate('AdChat', { adId: item.adId, otherUserId: item.otherUserId, firstName: item.otherUserName })}
          >
            <Text>{item.otherUserName}</Text>
            <Text>Last Message: {item.lastMessage}</Text>
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