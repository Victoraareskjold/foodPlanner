import { StyleSheet, Text, View, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'

import { categories } from './Categories';
import colors from '../../styles/colors'

import StatusButton from './StatusButton';

const AdCard = (props) => {
  
  const { adData, navigation } = props;
  const category = categories.find(category => category.text === adData.kategori);

  return (
    <TouchableOpacity 
      style={styles.cardContainer}
      onPress={() => navigation.navigate('AdView', { adData: adData })}
    >
      <View style={styles.textContainer}>

        <Image 
          source={require('../../assets/vedBilde.png')}
          style={styles.image}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 0}}>
          <Text style={{ fontSize: 18, fontWeight: '500' }}>{adData.overskrift}</Text>
          {category && <Image source={category.icon} style={[styles.icon, { marginLeft: 8 }]} />}
        </View>
        <Text 
          style={{ fontSize: 14, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}
          numberOfLines={2}
        >{adData.beskrivelse}</Text>

        <StatusButton status={adData.status}/>

      </View>

    </TouchableOpacity>
  );
};

export default AdCard;

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 140,
    borderRadius: 5,
    marginBottom: 16,
  },
  icon: {
    height: 24,
    width: 24,
  },
  cardContainer: {
    borderRadius: 10,
    width: 300,
    backgroundColor: colors.white,
    marginRight: 20,
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
  textContainer: {
    padding: 16,
  },
})