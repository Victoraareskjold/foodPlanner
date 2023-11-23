import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Message = ({ message, isCurrentUser, firstName }) => {
  const containerStyle = isCurrentUser
    ? styles.currentUserMessageContainer
    : styles.otherUserMessageContainer;

  const textStyle = isCurrentUser
    ? styles.currentUserMessageText
    : styles.otherUserMessageText;

  return (
    <View style={[styles.messageContainer, containerStyle]}>
      <Text style={[styles.senderText, textStyle]}>
        {isCurrentUser ? 'Du' : firstName}
      </Text>
      <Text style={[styles.messageText, textStyle]}>{message.text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    maxWidth: '80%', // Just an example, adjust as needed
  },
  messageText: {
    fontSize: 16,
  },
  senderText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentUserMessageContainer: {
    backgroundColor: '#DCF8C6', // Example color for the current user's message
  },
  otherUserMessageContainer: {
    backgroundColor: '#e5e5e5',
  },
  currentUserMessageText: {
    color: '#0C8346', // Example color for the current user's message text
  },
  otherUserMessageText: {
    color: '#000000',
  },
});

export default Message;
