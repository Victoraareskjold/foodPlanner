import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import CheckIcon from "../../assets/SVGs/CheckIcon.js";
import Pause from "../../assets/SVGs/Pause.js";
import Play from "../../assets/SVGs/Play.js";
import colors from "../../styles/colors";

const WorkSessionCard = ({ onStart, onPause, onStop, elapsed, isRunning }) => {
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    seconds = seconds % 60;

    const timeComponents = [];

    if (hours > 0) {
      timeComponents.push(
        <Text key="hours-number" style={styles.numberStyle}>
          {hours}
        </Text>,
        <Text key="hours-text" style={styles.textStyle}>
          {hours === 1 ? " time " : " timer "}
        </Text>
      );
    }

    if (minutes > 0 || hours > 0) {
      timeComponents.push(
        <Text key="minutes-number" style={styles.numberStyle}>
          {minutes}
        </Text>,
        <Text key="minutes-text" style={styles.textStyle}>
          {minutes === 1 ? " minutt " : " minutter "}
        </Text>
      );
    }

    if (seconds > 0 || (hours === 0 && minutes === 0)) {
      timeComponents.push(
        <Text key="seconds-number" style={styles.numberStyle}>
          {seconds}
        </Text>,
        <Text key="seconds-text" style={styles.textStyle}>
          {seconds === 1 ? " sekund" : " sekunder"}
        </Text>
      );
    } else if (hours === 0 && minutes === 0 && seconds === 0) {
      timeComponents.push(<Text key="zero-seconds">0 sekunder</Text>);
    }

    return <View style={{ flexDirection: "row" }}>{timeComponents}</View>;
  };

  const handleStopWithConfirmation = () => {
    Alert.alert(
      "Bekreft fullføring",
      "Er du sikker på at du vil fullføre?",
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Fullfør", onPress: onStop },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.workSessionCard}>
      <Text>Pågående arbeid:</Text>
      <View style={{ alignItems: "center", gap: 20 }}>
        <Text>{formatTime(elapsed)}</Text>
        <View style={{ flexDirection: "row", gap: 32 }}>
          {!isRunning && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.lightBlue }]}
              onPress={onStart}
            >
              <Play />
              <Text style={[styles.btnText, { color: colors.blue }]}>
                Start
              </Text>
            </TouchableOpacity>
          )}

          {isRunning && (
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.lightRed }]}
              onPress={onPause}
            >
              <Pause />
              <Text style={[styles.btnText, { color: colors.red }]}>Pause</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colors.lightGreen }]}
            onPress={handleStopWithConfirmation}
          >
            <CheckIcon />
            <Text style={[styles.btnText, { color: colors.green }]}>
              Fullfør
            </Text>
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
    marginHorizontal: 32,
    marginBottom: 12,
    backgroundColor: colors.white,
    borderRadius: 10,
    gap: 32,
  },
  btn: {
    backgroundColor: colors.grey,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    minWidth: 96,
  },
  btnText: {
    fontSize: 16,
  },
  numberStyle: {
    fontSize: 18,
    fontWeight: "700",
  },
  textStyle: {
    fontSize: 18,
  },
});

export default WorkSessionCard;
