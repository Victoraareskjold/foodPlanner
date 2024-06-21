import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";
import { useNavigation } from "@react-navigation/native";
import BackHandler from "../../assets/SVGs/BackHandler";

const HeaderComponent = ({ leftButton, headerText, rightButton }) => {
  const navigation = useNavigation();

  return (
    <View style={{ backgroundColor: "#FFF" }}>
      <SafeAreaView />
      <View style={containerStyles.headerContainer}>
        {leftButton && (
          <TouchableOpacity
            style={buttons.headerButton}
            onPress={() => navigation.goBack()}
          >
            <BackHandler />
          </TouchableOpacity>
        )}
        <Text style={fonts.header}>{headerText}</Text>
        {rightButton && (
          <TouchableOpacity style={buttons.headerButton}>
            {rightButton()}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HeaderComponent;
