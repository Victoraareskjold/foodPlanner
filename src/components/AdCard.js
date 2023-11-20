import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'

import { categories } from './Categories';
import Colors from '../../styles/Colors'

const AdCard = ({ adData }) => {

  const category = categories.find(category => category.text === adData.kategori);

  return (
    <TouchableOpacity style={styles.cardContainer}>
      <Image 
        source={require('../../assets/vedBilde.png')}
        style={styles.image}
      />
      <View style={styles.textContainer}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0}}>
        <Text style={{ fontSize: 18, fontWeight: '500' }}>{adData.overskrift}</Text>
        {category && <Image source={category.icon} style={[styles.icon, { marginLeft: 8 }]} />}
      </View>
      <Text 
        style={{ fontSize: 16, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}
        numberOfLines={2}
      >{adData.beskrivelse}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default AdCard;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 124,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  icon: {
    height: 24,
    width: 24,
  },
  cardContainer: {
    borderRadius: 5,
    width: 310,
    backgroundColor: Colors.grey,
    marginRight: 20,
  },
  textContainer: {
    padding: 16,
  },
})