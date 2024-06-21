import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import HeaderComponent from "../components/HeaderComponent";
import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";
import { auth } from "../../firebase";

const Settings = () => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <View style={containerStyles.defaultContainer}>
      <HeaderComponent leftButton={true} headerText="Settings" />
      <View style={{ flex: 1 }}>
        <TouchableOpacity style={buttons.primaryBtn}>
          <Text>hei</Text>
        </TouchableOpacity>
      </View>
      <View style={{ marginBottom: 20 }}>
        <TouchableOpacity style={buttons.primaryBtn} onPress={handleLogout}>
          <Text>Logg ut</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Settings;

const styles = StyleSheet.create({});
