import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ScrollView,
} from "react-native";
import { categories } from "./Categories";
import { useState, useEffect, useRef } from "react";

import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import fonts from "../../styles/fonts";
import images from "../../styles/images";
import containerStyles from "../../styles/containerStyles";

const CategoryButtons = ({ navigation }) => {
  const handleCategoryPress = (category) => {
    navigation.navigate("RecipeCategoryScreen", { category: category }); // Legg til denne linjen for å navigere
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator="false">
        <View style={styles.categoryContainer}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.categoryButton]}
              onPress={() => handleCategoryPress(item.text)}
            >
              <Image source={item.icon} style={{ width: 48, height: 48 }} />
              <Text style={styles.categoryText}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {},
  categoryContainer: {
    flexWrap: "wrap",
    flexDirection: "row", // legger elementene horisontalt
    justifyContent: "space-between",
    rowGap: 20,
  },
  categoryButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 5,
    paddingVertical: 24,
    backgroundColor: colors.lightRed,
    width: "48%",
    alignItems: "center",
    gap: 12,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default CategoryButtons;
