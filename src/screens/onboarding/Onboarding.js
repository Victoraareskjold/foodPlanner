import { StyleSheet, Text, View, Image, TouchableOpacity, SafeAreaView } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'
import { useState, useEffect, useRef } from 'react'

import { onAuthStateChanged } from 'firebase/auth';

import { auth } from '../../../firebase';

import OnboardingAssets from './OnboardingAssets'
import Slider from '../../components/Slider'
import OnboardingStyles from '../../../styles/OnboardingStyles'
import Colors from '../../../styles/Colors'

export default function Onboarding () {

    const navigation = useNavigation();

    const [loggedIn, setLoggedIn] = useState(false);

    onAuthStateChanged(auth, (user) => {
        if (user) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      });

    return (
        <SafeAreaView style={{flex:1, backgroundColor: Colors.white,}}>
            
            <View style={OnboardingStyles.centerContainer}>
                <View style={OnboardingStyles.headerContainer}>
                    {/* <Image 
                        source={require('../../../assets/noti.png')}
                        style={{height: 32, width: 32, marginRight: 12}}
                    /> */}
                    <Text style={OnboardingStyles.header}>Assistas</Text>
                </View>

                <View style={OnboardingStyles.mainContainer}>
                    <Slider />
                </View>

                <View style={OnboardingStyles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[OnboardingStyles.primaryBtn, { paddingHorizontal: 40, marginBottom: 6}]}
                        onPress={() => navigation.navigate('Login')} // Legg til denne linjen for å navigere til 'SetupName'
                    >
                        <Text style={OnboardingStyles.linkText}>Logg inn</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[OnboardingStyles.secondaryBtn, {width: '100%', paddingHorizontal: 40, marginBottom: 0}]}
                        onPress={() => navigation.navigate('SetupName')} // Legg til denne linjen for å navigere til 'SetupName'
                    >
                        <Text style={OnboardingStyles.linkText2}>Registrer deg</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({})