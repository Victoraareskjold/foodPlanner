import { SafeAreaView, Text, View, TouchableOpacity } from "react-native";
import React from "react";
import fonts from "../../styles/fonts";
import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";
import { useNavigation } from "@react-navigation/native";

import BackHandler from "../../assets/SVGs/BackHandler";

const HeaderComponent = ({ leftButton, headerText }) => {
  const navigation = useNavigation();

  return (
    <View>
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
        {leftButton && (
          <TouchableOpacity style={buttons.headerButton}></TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default HeaderComponent;
