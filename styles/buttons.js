import { StyleSheet, Text, View } from "react-native";
import React from "react";
import colors from "./colors";

export default StyleSheet.create({
  btn1: {
    marginTop: 6,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
  },
  textBtn: {
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    borderColor: "blue",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 12,
  },
  iconButton: {
    backgroundColor: colors.lightGrey,
    width: "50%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 5,
    paddingVertical: 24,
    flex: 1,
  },
  circleBtn: {
    backgroundColor: colors.lightGrey,
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    borderRadius: 100,
  },
  categoryBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 5,
    marginRight: 8,
    backgroundColor: colors.darkGrey,
  },
});
