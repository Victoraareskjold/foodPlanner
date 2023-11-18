import { StyleSheet, Text, View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';

import { auth, db } from "../../../firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword } from 'firebase/auth';

import OnboardingStyles from '../../../styles/OnboardingStyles'
import Colors from '../../../styles/Colors';
import containerStyles from "../../../styles/containerStyles";

export default function CreateUser({ route, navigation }) {

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState(null);
    
    const emailRef = useRef(null);

    /* Set focus on load */
    useEffect(() => {
        if (emailRef.current) {
            emailRef.current.focus();
        }
    }, []); // Tom avhengighetsarray betyr at effekten kjøres ved montering

    const createAccount = async () => {
        try {
          if (password === confirmPassword) {
            await createUserWithEmailAndPassword(auth, email, password);
            console.log('Bruker opprettet!');
            navigation.navigate('DinSideStack')
          } else {
            setError("Passwords don't match");
          }
        } catch (e) {
          setError('There was a problem creating your account');
          console.log(e)
        }
      };            

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : '0'}
            style={[containerStyles.backgroundContainer, { paddingHorizontal: 24 }]}
        >
            <SafeAreaView style={{backgroundColor: Colors.white, flex: 1}}>

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
                <Text>Din e-post adresse</Text>
                <TextInput
                    ref={emailRef}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                    style={{ marginTop: 4 }}
                    placeholder="Ola.Nordmann@gmail.com"
                ></TextInput>

                {/* Password */}
                <Text>Velg et passord</Text>
                <TextInput 
                    style={{ marginTop: 4 }}
                    placeholderTextColor="#aaa"
                    placeholder='* * * * * *'
                    value={password}
                    onChangeText={setPassword}
                ></TextInput>

                {/* Confirm password */}
                <Text>Bekreft passord</Text>
                <TextInput 
                    style={{ marginTop: 4 }}
                    placeholderTextColor="#aaa"
                    placeholder='* * * * * *'
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                ></TextInput>

                {error && <Text>{error}</Text>}

                {/* Log inn */}
                <TouchableOpacity
                    style={{ position: 'absolute', bottom: 12}}
                    onPress={createAccount}
                    disabled={!email || !password || !confirmPassword}
                >
                    <Text>Gå videre</Text>
                </TouchableOpacity>
           
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};