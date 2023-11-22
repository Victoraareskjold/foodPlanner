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
import colors from '../../styles/colors';

export default function CreateAd({ route }) {

  const { category } = route.params;
  const navigation = useNavigation();

  const [overskrift, setOverskrift] = useState('');
  const [beskrivelse, setBeskrivelse] = useState('');
  const [telefonnummer, setTelefonnummer] = useState('');
  const [sted, setSted] = useState('');

  const [status, setStatus] = useState('Ikke startet'); // Default status 

  const [formErrorMessage, setFormErrorMessage] = useState('');

  const isFormValid = () => {
    return overskrift.trim() !== '' &&
      beskrivelse.trim() !== '' &&
      telefonnummer.trim() !== '' &&
      sted.trim() !== '';
  };

  const leggTilAnnonse = async () => {
    try {
      // Hent en referanse til Firestore-databasen
      const db = getFirestore(firestore);
  
      // Hent en referanse til 'annonser'-samlingen
      const annonseCollectionRef = collection(db, 'annonser');
  
      // Hent brukerens UID fra Firebase autentisering
      const userUID = auth.currentUser.uid;
  
      // Sjekk om skjemaet er gyldig før du legger til en annonse
      if (!isFormValid()) {
        setFormErrorMessage('Alle felt må fylles ut');
        return;
      }
  
      // Legg til annonse i samlingen med brukerens UID
      await addDoc(annonseCollectionRef, {
        overskrift,
        beskrivelse,
        telefonnummer,
        sted,
        kategori: category,
        uid: userUID,
        status,
      });
  
      // Når annonse er lagt til, gå tilbake til forrige skjerm
      navigation.goBack();
    } catch (error) {
      // Hvis det oppstår en feil, logg feilen til konsollen
      console.error('Feil ved opplasting av annonse:', error);
      
      // Sett feilmeldingen for å vise den til brukeren
      setFormErrorMessage('Det oppstod en feil ved opprettelse av annonse');
    }
  };  

  return (
      <View style={{ backgroundColor: '#FFF', flex: 1 }}>
        <SafeAreaView/>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>

          <View style={containerStyles.defaultContainer}>

          {formErrorMessage !== '' && (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorMessage}>{formErrorMessage}</Text>
                </View>
              )}

            <Text>Overskrift</Text>
            <TextInput
              style={placeholderStyles.simple}
              placeholder="Overskrift"
              value={overskrift}
              onChangeText={(text) => setOverskrift(text)}
            />

            <View style={{ marginBottom: 12, backgroundColor: colors.lightPrimary, padding: 6, borderRadius: 5 }}>
              <Text>Kategori: {category}</Text>
            </View>

            <Text>Beskrivelse</Text>
            <TextInput
              style={placeholderStyles.bigbox}
              placeholder="Jeg trenger hjelp til..."
              numberOfLines={5}
              value={beskrivelse}
              onChangeText={(text) => setBeskrivelse(text)}
              multiline={true}
            />

            <Text>Telefonnummer</Text>
            <TextInput
              style={placeholderStyles.simple}
              placeholder="12345678"
              autoComplete='tel'
              value={telefonnummer}
              onChangeText={(text) => setTelefonnummer(text)}
            />

            <Text>Sted</Text>
            <TextInput
              style={placeholderStyles.simple}
              placeholder="Karl Johans Gate 1, 0159 Oslo"
              value={sted}
              onChangeText={(text) => setSted(text)}
            />

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
  errorContainer: {
    marginBottom: 12,
  },
  errorMessage: {
    color: 'red',
    fontSize: 16,
    fontWeight: '500',
  },
});
