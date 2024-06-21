import { View, TouchableOpacity, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import containerStyles from "../../styles/containerStyles";
import buttons from "../../styles/buttons";
import fonts from "../../styles/fonts";

import SearchBar from "../components/SearchBar";
import HeaderComponent from "../components/HeaderComponent";
import RecipeList from "../components/RecipeList";
import useFamilyRecipes from "../hooks/useFamilyRecipes";

export default function Recipes() {
  const navigation = useNavigation();
  const recipeData = useFamilyRecipes();

  const handleRecipeView = (recipe) => {
    navigation.navigate("RecipeView", { recipe });
  };

  return (
    <View
      style={[
        containerStyles.defaultContainer,
        { paddingHorizontal: 0, gap: 0 },
      ]}
    >
      <View style={{ paddingHorizontal: 20 }}>
        <HeaderComponent headerText="All Recipes" leftButton={false} />
        <SearchBar placeholder={"søk etter oppskrifter"} />
      </View>

      <RecipeList recipes={recipeData} onPressItem={handleRecipeView} />

      <TouchableOpacity
        style={[buttons.primaryBtn, { marginBottom: 12, marginHorizontal: 20 }]}
        onPress={() => navigation.navigate("CreateRecipe")}
      >
        <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
          Oprett ny oppskrift
        </Text>
      </TouchableOpacity>
    </View>
  );
}
