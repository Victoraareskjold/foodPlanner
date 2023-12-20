import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import colors from "../../styles/colors";

const WorkSessionCard = ({ onStart, onPause, onStop, elapsed, isRunning }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.workSessionCard}>
      <Text>Pågående arbeid:</Text>
      <View style={{ alignItems: "center", gap: 4 }}>
        <Text>{formatTime(elapsed)}</Text>
        <View style={{ flexDirection: "row", gap: 20 }}>
          {!isRunning && (
            <TouchableOpacity onPress={onStart}>
              <Text>Start</Text>
            </TouchableOpacity>
          )}

          {isRunning && (
            <TouchableOpacity onPress={onPause}>
              <Text>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity onPress={onStop}>
            <Text>Fullfør</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  workSessionCard: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    margin: 6,
    backgroundColor: colors.lightGrey,
    borderRadius: 10,
    gap: 12,
  },
});

export default WorkSessionCard;
