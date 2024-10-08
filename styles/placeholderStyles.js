import { StyleSheet, Text, View } from "react-native";
import React from "react";
import colors from "./colors";

export default StyleSheet.create({
  simple: {
    backgroundColor: colors.secondary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  bigbox: {
    backgroundColor: colors.darkGrey,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 5,
    textAlignVertical: "top",
  },
});
