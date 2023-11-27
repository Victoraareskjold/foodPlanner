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

const CategoryButtons = ({ onSelectCategory }) => {
  const [activeCategory, setActiveCategory] = useState("Se alle");

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
    onSelectCategory(category);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoryContainer}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.categoryButton,
                activeCategory === item.text && styles.activeCategory, // Legg til styling for aktiv kategori
              ]}
              onPress={() => handleCategoryPress(item.text)}
            >
              <Text
                style={[
                  fonts.body,
                  activeCategory === item.text && styles.activeText, // Legg til styling for aktiv tekst
                ]}
              >
                {item.text}
              </Text>
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  categoryButton: {
    backgroundColor: colors.primaryLight,
    marginRight: 8,
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 0,
    marginBottom: 24,
  },
  categoryText: {},
  activeCategory: {
    // Customize the styles for the active category
    backgroundColor: colors.primary, // Use your primary color or any other color you prefer
    color: colors.white,
  },
  activeText: {
    color: "#FFF",
  },
});

export default CategoryButtons;
