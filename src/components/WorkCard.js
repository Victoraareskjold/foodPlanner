// WorkCard.js
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const WorkCard = ({ color, icon, text, onPress }) => {

  const textColor = text === 'Se alle' ? '#FFF' : '#272727'; // Endre farge basert på teksten

  return (
    <TouchableOpacity onPress={onPress}>
      <View style={[styles.cardMain, { backgroundColor: color }]}>
        <Image source={icon} style={styles.icon} />
        <Text style={[styles.text, { color: textColor }]}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardMain: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: 5,
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
    fontWeight: '500',
    alignSelf: 'center',
  },
});

export default WorkCard;
