import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

import containerStyles from '../../styles/containerStyles';
import placeholderStyles from '../../styles/placeholderStyles';
import buttons from '../../styles/buttons';
import fonts from '../../styles/fonts';

export default function CreateAd({ route }) {

  const { category } = route.params;
  const navigation = useNavigation();

  return (
      <View style={{ backgroundColor: '#FFF', flex: 1 }}>
        <SafeAreaView/>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>

          <View style={containerStyles.defaultContainer}>

            <TextInput 
              style={placeholderStyles.simple}
              placeholder='Overskrift'
            />

            <TextInput 
              style={placeholderStyles.simple}
              placeholder='Beskrivelse'
            />

            <Text>Kategori: {category}</Text>

            <TouchableOpacity
              style={buttons.btn1}
            >
              <Text style={[fonts.btnBody, {color: 'blue'}]}>Opprett annonse</Text>
            </TouchableOpacity>

          </View>

          </KeyboardAvoidingView>
      </View>
  );
};

const styles = StyleSheet.create({
});
