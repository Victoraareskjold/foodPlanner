import { BlurView } from "@react-native-community/blur";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../styles/colors";

const WorkStartRequestCard = ({ onStart, onStop, timer, isTimerRunning }) => {
  return (
    <View style={styles.confirmedRequestBox}>
      {isTimerRunning ? (
        <>
          <Text>Arbeid pågår: {timer}</Text>
          <TouchableOpacity onPress={onStop}>
            <Text>Stopp timer</Text>
          </TouchableOpacity>
        </>
      ) : (
        <View>
          <Text>Status om pågående arbeid</Text>
          <TouchableOpacity onPress={onStart}>
            <Text>Start timer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default WorkStartRequestCard;

const styles = StyleSheet.create({
  requestBox: {},
  requestBoxSender: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  requestBoxReceiver: {
    backgroundColor: colors.primary,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  confirmedRequestBox: {
    backgroundColor: colors.darkGrey,
    borderColor: colors.lightGrey,
    borderWidth: 1,
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
  declinedRequestBox: {
    backgroundColor: "#FFD6D6", // Rød bakgrunnsfarge
    padding: 10,
    margin: 5,
    borderRadius: 10,
  },
});
