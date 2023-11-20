import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'

import { categories } from './Categories';

const AdCard = ({ adData }) => {

  const category = categories.find(category => category.text === adData.kategori);

  return (
    <TouchableOpacity style={styles.cardContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6}}>
        <Text style={{ fontSize: 16, fontWeight: '500' }}>{adData.overskrift}</Text>
        {category && <Image source={category.icon} style={[styles.icon, { marginLeft: 8 }]} />}
      </View>
      <Text 
        style={{ fontSize: 14, fontWeight: '400' }}
        numberOfLines={2}
      >{adData.beskrivelse}</Text>
    </TouchableOpacity>
  );
};

export default AdCard;

const styles = StyleSheet.create({
  icon: {
    height: 24,
    width: 24,
  },
  cardContainer: {
    padding: 12 ,
    width: 280,
  },
})