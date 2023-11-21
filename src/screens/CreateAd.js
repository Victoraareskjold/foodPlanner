import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useState, useEffect, useRef } from 'react';

import { auth, db } from "../../firebase";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";

import { firestore } from "../../firebase";  // Importer firestore fra din firebase-config

import containerStyles from '../../styles/containerStyles';
import placeholderStyles from '../../styles/placeholderStyles';
import buttons from '../../styles/buttons';
import fonts from '../../styles/fonts';

export default function CreateAd({ route }) {

  const { category } = route.params;
  const navigation = useNavigation();

  const [overskrift, setOverskrift] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');

  const [status, setStatus] = useState('not started'); // Default status is 'not started'

  const leggTilAnnonse = async () => {
    try {
      const db = getFirestore(firestore);

      const annonseCollectionRef = collection(db, 'annonser');

      // Hent brukerens UID fra Firebase autentisering
      const userUID = auth.currentUser.uid;

      // Legg til annonse i samlingen med brukerens UID
      await addDoc(annonseCollectionRef, {
        overskrift,
        beskrivelse,
        kategori: category,
        uid: userUID,
        status,
      });

      navigation.goBack();
    } catch (error) {
      console.error('Feil ved opplasting av annonse:', error);
    }
  };

  return (
      <View style={{ backgroundColor: '#FFF', flex: 1 }}>
        <SafeAreaView/>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>

          <View style={containerStyles.defaultContainer}>

            <TextInput
              style={placeholderStyles.simple}
              placeholder="Overskrift"
              value={overskrift}
              onChangeText={(text) => setOverskrift(text)}
            />

            <TextInput
              style={placeholderStyles.simple}
              placeholder="Beskrivelse"
              value={beskrivelse}
              onChangeText={(text) => setBeskrivelse(text)}
            />

            <Text>Kategori: {category}</Text>

            <TouchableOpacity style={buttons.btn1} onPress={leggTilAnnonse}>
              <Text style={[fonts.btnBody, { color: 'blue' }]}>
                Opprett annonse
              </Text>
            </TouchableOpacity>

          </View>

          </KeyboardAvoidingView>
      </View>
  );
};

const styles = StyleSheet.create({
});
