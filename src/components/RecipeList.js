import React from "react";
import {
  FlatList,
  TouchableOpacity,
  View,
  Image,
  Text,
  StyleSheet,
} from "react-native";
import fonts from "../../styles/fonts";
import images from "../../styles/images";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import Timer from "../../assets/SVGs/Timer";

const formatRecipes = (recipes, numColumns) => {
  const formattedRecipes = recipes.map((recipe) => ({
    ...recipe,
    categories: recipe.categories || [],
  }));

  const numberOfFullRows = Math.floor(formattedRecipes.length / numColumns);

  let numberOfElementsLastRow =
    formattedRecipes.length - numberOfFullRows * numColumns;
  while (numberOfElementsLastRow !== numColumns) {
    formattedRecipes.push({
      key: `blank-${numberOfElementsLastRow}`,
      empty: true,
      categories: [],
    });
    numberOfElementsLastRow = numberOfElementsLastRow + 1;
  }
  return formattedRecipes;
};

const RecipeList = ({ recipes, onPressItem }) => {
  const numColumns = 2;

  return (
    <FlatList
      style={{ flex: 1, marginTop: 12 }}
      columnWrapperStyle={{ justifyContent: "space-between", gap: 20 }}
      numColumns={numColumns}
      data={formatRecipes(recipes, numColumns)}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        if (item.empty) {
          return <View style={[styles.card, styles.itemInvisible]} />;
        }

        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => onPressItem(item)}
          >
            {item.image ? (
              <Image source={{ uri: item.image }} style={[images.mealImage2]} />
            ) : (
              <Image
                source={require("../../assets/placeholderImage.png")}
                style={images.mealImage2}
              />
            )}
            <View style={styles.mealInfo}>
              <Text style={fonts.body}>{item.title}</Text>
              <View
                style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
              >
                <Timer />
                <Text style={fonts.body2}>{item.time} min</Text>
              </View>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {item.categories.map((category, index) => (
                    <View key={index} style={buttons.categoryBtn}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    flex: 1,
    borderRadius: 5,
    backgroundColor: "#FFF",
  },
  mealInfo: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
  },
  categoryText: {
    color: colors.blue,
    ...fonts.body2,
  },
  itemInvisible: {
    display: "none",
    backgroundColor: "red",
  },
});

export default RecipeList;
