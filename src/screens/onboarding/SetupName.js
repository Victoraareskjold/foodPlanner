import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from "../../../firebase";
import { getFirestore, doc, setDoc, collection, addDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";

import OnboardingStyles from '../../../styles/OnboardingStyles'
import colors from '../../../styles/colors';
import containerStyles from "../../../styles/containerStyles";

export default function SetupName({ navigation }) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const firstNameRef = useRef(null);

    /* Set focus on load */
    useEffect(() => {
        if (firstNameRef.current) {
            firstNameRef.current.focus();
        }
    }, []); // Tom avhengighetsarray betyr at effekten kjøres ved montering

    let [validationMessage, setValidationMessage] = useState('');

    let validateAndSet = (value, valueToCompare, setValue) => {
        if (value !== valueToCompare) {
            setValidationMessage('Passordene er ikke like');
        } else {
            setValidationMessage('');
        }
        setValue(value);
    };

    let storeDataAndContinue = () => {
        if (!firstName || !lastName) {
            setValidationMessage('Vennligst fyll ut alle feltene');
            return;
        }
        
        navigation.navigate("SignUp", {
            firstName: firstName,
            lastName: lastName,
        });
    };

    /* Capitalize words */
    const capitalizeWords = (str) => 
    str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : '0'}
            style={[containerStyles.backgroundContainer, { paddingHorizontal: 24 }]}
        >
            <SafeAreaView style={{backgroundColor: colors.white, flex: 1}}>

            {/* Header & subheader */}
                <Ionicons 
                    name="chevron-back" 
                    size={24} 
                    color="black" 
                    style={{marginBottom: 12}}
                    onPress={() => navigation.goBack()}
                />

                <Text>
                    Velkommen til Assistas! 👋
                </Text>

                <Text style={{ marginBottom: 64 }}>
                    Fortell oss litt om deg selv.
                </Text>

                {/* First name */}
                <Text>Fornavn & mellomnavn</Text>
                <TextInput
                    ref={firstNameRef}
                    style={{ marginTop: 4 }}
                    placeholderTextColor="#aaa"
                    placeholder="Ola Nordmann"
                    value={firstName}
                    onChangeText={(text) => setFirstName(capitalizeWords(text))}
                ></TextInput>

                {/* Last name */}
                <Text>Etternavn</Text>
                <TextInput 
                    style={{ marginTop: 4 }}
                    placeholderTextColor="#aaa"
                    placeholder='Hansen'
                    value={lastName}
                    onChangeText={text => setLastName(capitalizeWords(text))}
                ></TextInput>

            {/* Validation message */}
            <View style={containerStyles.errorMessageContainer}>
                <Text style={containerStyles.errorMessageContainer}>{validationMessage}</Text>
            </View>

            {/* Log inn */}
                <TouchableOpacity
                    onPress={storeDataAndContinue}
                    style={{ position: 'absolute', bottom: 12}}
                >
                    <Text>Gå videre</Text>
                </TouchableOpacity>
           
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};