import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useRoute } from "@react-navigation/native";
import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import fonts from "../../styles/fonts";
import buttons from "../../styles/buttons";
import HeaderComponent from "../components/HeaderComponent";

const RecipeView = () => {
  const route = useRoute();
  const { recipe } = route.params;

  const renderIngredients = () => {
    return recipe.ingredients.map((ingredient, index) => (
      <View
        key={index}
        style={{ flexDirection: "row", gap: 12, marginBottom: 8 }}
      >
        <Text style={[{ flex: 3 }]}>{ingredient.name}</Text>
        <Text style={[{ flex: 1 }]}>{ingredient.quantity}</Text>
        <Text style={[{ flex: 1 }]}>{ingredient.unit}</Text>
      </View>
    ));
  };

  const renderSteps = () => {
    if (!recipe.steps) {
      return <Text>Ingen steg tilgjengelig</Text>;
    }
    return recipe.steps.map((step, index) => (
      <View
        key={index}
        style={{ flexDirection: "row", gap: 0, marginBottom: 8 }}
      >
        <Text style={[{ width: 20 }]}>{index + 1}.</Text>
        <Text style={[{ flex: 1 }]}>{step}</Text>
      </View>
    ));
  };

  return (
    <View
      style={[
        containerStyles.defaultContainer,
        { paddingHorizontal: 0, gap: 0 },
      ]}
    >
      <HeaderComponent headerText={recipe.title} leftButton={true} />
      <ScrollView>
        <Image
          source={
            recipe.image
              ? { uri: recipe.image }
              : require("../../assets/placeholderImage.png")
          }
          style={{ height: 200, width: "100%", marginBottom: 32 }}
        />
        <View
          style={[
            containerStyles.defaultContainer,
            { gap: 32, marginBottom: 32 },
          ]}
        >
          <View style={{ gap: 12 }}>
            <View>
              <Text style={placeholderStyles.simple}>{recipe.title}</Text>
            </View>
            <View style={{ gap: 12, flexDirection: "row" }}>
              <Text style={[placeholderStyles.simple, { flex: 1 }]}>
                {recipe.link}
              </Text>
              <Text style={[placeholderStyles.simple, { minWidth: 96 }]}>
                {recipe.portions}
              </Text>
              <Text style={[placeholderStyles.simple, { minWidth: 96 }]}>
                {recipe.time}
              </Text>
            </View>
          </View>

          <View style={{ gap: 12 }}>
            {recipe.categories && recipe.categories.length > 0 && (
              <View style={{ flexDirection: "row", gap: 8 }}>
                {recipe.categories.map((category, index) => (
                  <TouchableOpacity key={index} style={buttons.categoryBtn}>
                    <Text>{category}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Ingredienser */}
          <View style={{ gap: 12 }}>
            <Text style={fonts.title}>Ingredienser:</Text>
            {renderIngredients()}
          </View>

          {/* Steg */}
          <View style={{ gap: 12 }}>
            <Text style={fonts.title}>Steg:</Text>
            {renderSteps()}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RecipeView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
