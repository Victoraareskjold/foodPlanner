import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'

const AdCard = ({ adData }) => {
  return (
    <View>
      <Text>{adData.overskrift}</Text>
      <Text>{adData.beskrivelse}</Text>
      {/* Legg til annen informasjon du vil vise fra adData */}
    </View>
  );
};

export default AdCard;

const styles = StyleSheet.create({})