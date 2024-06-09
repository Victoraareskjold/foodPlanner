import {
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../firebase";

import colors from "../../../styles/colors";
import containerStyles from "../../../styles/containerStyles";

export default function SetupName({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const emailRef = useRef(null);

  /* Set focus on load */
  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []); // Tom avhengighetsarray betyr at effekten kjøres ved montering

  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Logget inn!");
      navigation.navigate("Home");
    } catch (error) {
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Your email or password was incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else {
        setError("There was a problem with your request");
        console.log(error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "0"}
      style={[containerStyles.backgroundContainer, { paddingHorizontal: 24 }]}
    >
      <SafeAreaView style={{ backgroundColor: colors.white, flex: 1 }}>
        {/* Header & subheader */}
        <Ionicons
          name="chevron-back"
          size={24}
          color="black"
          style={{ marginBottom: 12 }}
          onPress={() => navigation.goBack()}
        />

        <Text>Velkommen tilbake! 👋</Text>

        <Text style={{ marginBottom: 64 }}>
          Skriv inn e-post og passord for å logge inn.
        </Text>

        {/* Email adress */}
        <Text>E-post adresse</Text>
        <TextInput
          ref={emailRef}
          style={{ marginTop: 4 }}
          placeholderTextColor="#aaa"
          placeholder="Ola.Nordmann@gmail.com"
          value={email}
          onChangeText={setEmail}
        ></TextInput>

        {/* Password */}
        <Text>Passord</Text>
        <TextInput
          style={{ marginTop: 4 }}
          placeholderTextColor="#aaa"
          placeholder="* * * * * *"
          value={password}
          onChangeText={setPassword}
        ></TextInput>

        {error && <Text>{error}</Text>}

        {/* Log inn */}
        <TouchableOpacity
          style={{ position: "absolute", bottom: 12 }}
          onPress={loginUser}
          disabled={!email || !password}
        >
          <Text>Gå videre</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
