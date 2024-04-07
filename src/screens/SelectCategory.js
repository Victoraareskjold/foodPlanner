import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";

import containerStyles from "../../styles/containerStyles";
import fonts from "../../styles/fonts";
import buttons from "../../styles/buttons";

const categories = ["Kjøtt", "Fisk", "Kylling"];
const countries = ["Asian", "American", "Norwegian"];

const SelectCategory = () => {
  const navigation = useNavigation();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState([]);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const toggleCountry = (country) => {
    if (selectedCountries.includes(country)) {
      setSelectedCountries(selectedCountries.filter((cnt) => cnt !== country));
    } else {
      setSelectedCountries([...selectedCountries, country]);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView />

      <View
        style={[containerStyles.defaultContainer, { gap: 20, marginTop: 12 }]}
      >
        <Text style={fonts.header}>Velg dine kategorier</Text>
        <View>
          <Text style={fonts.subHeader}>Råvare</Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
            }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                onPress={() => toggleCategory(category)}
                style={[
                  buttons.categoryBtn,
                  {
                    backgroundColor: selectedCategories.includes(category)
                      ? "#185BF0"
                      : "#FBFBFB",
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedCategories.includes(category)
                      ? "#FFF"
                      : "#007bff",
                  }}
                >
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View>
          <Text style={fonts.subHeader}>Land</Text>
          <View
            style={{
              flexDirection: "row",
              marginTop: 8,
            }}
          >
            {countries.map((country) => (
              <TouchableOpacity
                key={country}
                onPress={() => toggleCountry(country)}
                style={[
                  buttons.categoryBtn,
                  {
                    backgroundColor: selectedCountries.includes(country)
                      ? "#185BF0"
                      : "#FBFBFB",
                  },
                ]}
              >
                <Text
                  style={{
                    color: selectedCountries.includes(country)
                      ? "#FFF"
                      : "#007bff",
                  }}
                >
                  {country}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            console.log(selectedCategories, selectedCountries);
            navigation.navigate("CreateRecipe", {
              selectedCategories: selectedCategories,
              selectedCountries: selectedCountries,
            });
          }}
          style={{
            paddingVertical: 12,
            backgroundColor: "#007bff",
            borderRadius: 50,
          }}
        >
          <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
            Lagre Valg
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SelectCategory;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
