import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { categories } from "../components/Categories"; // Oppdater med riktig sti
import colors from "../../styles/colors";

export default function CategorySelector({ onSelectCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    onSelectCategory(category);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.card,
            selectedCategory === category.text && styles.selectedCard,
          ]}
          onPress={() => handleSelectCategory(category.text)}
        >
          <Text
            style={[
              styles.text,
              selectedCategory === category.text && styles.selectedCard,
            ]}
          >
            {category.text}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: colors.white,
  },
  card: {
    marginRight: 12,
    padding: 12,
    borderRadius: 5,
  },
  selectedCard: {
    backgroundColor: colors.primary, // Sett din ønskede farge for valgte kort
    color: colors.white,
  },
  text: {
    // Stiler for teksten på kortet
  },
});
