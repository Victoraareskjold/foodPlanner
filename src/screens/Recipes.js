import { View, TouchableOpacity, Text } from "react-native";
import { useState, useEffect } from "react";

import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";

import SearchBar from "../components/SearchBar";
import HeaderComponent from "../components/HeaderComponent";
import RecipeList from "../components/RecipeList";
import fonts from "../../styles/fonts";
import { useNavigation } from "@react-navigation/native";
import useFamilyRecipes from "../hooks/useFamilyRecipes";

export default function Recipes() {
  const navigation = useNavigation();
  const recipeData = useFamilyRecipes();

  return (
    <View style={containerStyles.defaultContainer}>
      <HeaderComponent headerText="Dine oppskrifter" leftButton={false} />

      <SearchBar placeholder={"søk etter oppskrifter"} />

      <RecipeList recipes={recipeData} />

      <TouchableOpacity
        style={[buttons.primaryBtn, { marginBottom: 12 }]}
        onPress={() => navigation.navigate("CreateRecipe")}
      >
        <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
          Oprett ny oppskrift
        </Text>
      </TouchableOpacity>
    </View>
  );
}
