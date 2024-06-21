import { StyleSheet, View, Image, TextInput } from "react-native";
import { useState } from "react";
import React from "react";
import colors from "../../styles/colors";

const SearchBar = ({ placeholder }) => {
  const [input, setInput] = useState("");
  console.log(input);
  return (
    <View style={styles.searchContainer}>
      <Image
        source={require("../../assets/search.png")}
        style={{ width: 24, height: 24, marginRight: 8, opacity: 0.5 }}
      />
      <TextInput
        placeholderTextColor={colors.defaultLight}
        value={input}
        onChangeText={(text) => setInput(text)}
        placeholder={placeholder}
        style={{ width: "100%" }}
      ></TextInput>
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    marginTop: 0,
    backgroundColor: "#FBFBFB",
    paddingVertical: 8,
    flexDirection: "row",
    borderRadius: 10,
    paddingHorizontal: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.lightGrey,
  },
});
