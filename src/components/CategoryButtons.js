import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { categories } from './Categories';
import { useState, useEffect, useRef } from 'react';
import colors from '../../styles/colors';

const CategoryButtons = ({ onSelectCategory  }) => {

    const [activeCategory, setActiveCategory] = useState('');

  const handleCategoryPress = (category) => {
    setActiveCategory(category);
    onSelectCategory(category);
  };
        
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              { backgroundColor: category.color },
              category.text === activeCategory && styles.activeCategory,
            ]}
            onPress={() => handleCategoryPress(category.text)}
          >
            <Text style={styles.categoryText}>{category.text}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {},
    categoryContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
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
    categoryText: {
      
    },
    activeCategory: {
      // Customize the styles for the active category
      backgroundColor: colors.primary, // Use your primary color or any other color you prefer
      color: colors.white,
    },
  });

export default CategoryButtons;