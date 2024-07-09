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
import colors from "../../styles/colors";
import HeaderComponent from "../components/HeaderComponent";

const categories = ["Kjøtt", "Kylling", "Fisk", "Vegetar"];

const SelectCategory = () => {
  const navigation = useNavigation();

  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(
        selectedCategories.filter((cat) => cat !== category)
      );
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  return (
    <View style={containerStyles.defaultContainer}>
      <HeaderComponent headerText={"Velg kategori"} leftButton={true} />

      <Text style={fonts.subHeader}>Råvare</Text>

      <View style={{ gap: 12 }}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            onPress={() => toggleCategory(category)}
            style={[
              buttons.categoryBtn,
              {
                backgroundColor: selectedCategories.includes(category)
                  ? colors.popColorSecondary
                  : colors.white,
              },
            ]}
          >
            <Text
              style={{
                color: selectedCategories.includes(category)
                  ? colors.popColor
                  : colors.popColor,
                fontWeight: "600",
              }}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => {
          navigation.navigate("CreateRecipe", {
            selectedCategories: selectedCategories,
          });
        }}
        style={{
          paddingVertical: 12,
          backgroundColor: colors.primary,
          borderRadius: 50,
        }}
      >
        <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
          Lagre Valg
        </Text>
      </TouchableOpacity>
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
