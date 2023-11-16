// WorkCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const WorkCard = ({ color, icon, text, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.card, { backgroundColor: color }]}>
        <Image source={icon} style={styles.icon} />
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: 10,
    width: 108,
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  text: {
    color: '#272727',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkCard;
