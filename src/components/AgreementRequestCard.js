// AgreementRequestCard.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import colors from "../../styles/colors";

const AgreementRequestCard = ({ isSender, onAccept, onDecline, userName }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>
        {isSender
          ? "Du har sendt en avtaleforespørsel"
          : `${userName} har sendt en avtaleforespørsel`}
      </Text>
      {!isSender && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={onAccept} style={styles.button}>
            <Text>Godta</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onDecline} style={styles.button}>
            <Text>Avslå</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    margin: 5,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    // Legg til ytterligere stil her om nødvendig
  },
  header: {
    fontSize: 16,
    marginBottom: 10,
    // Legg til ytterligere stil her om nødvendig
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // Legg til ytterligere stil her om nødvendig
  },
  button: {
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    // Legg til ytterligere stil her om nødvendig
  },
});

export default AgreementRequestCard;
