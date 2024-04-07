import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";

import { db, auth } from "../../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import fonts from "../../styles/fonts";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";

const CreateRecipe = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [time, setTime] = useState("");
  const { selectedCategories, selectedCountries } = route.params ?? {};
  const [ingredients, setIngredients] = useState([""]);
  const ingredientRefs = useRef([]);

  const [error, setError] = useState("");

  useEffect(() => {
    const lastIndex = ingredients.length - 1;
    const lastRef = ingredientRefs.current[lastIndex];

    if (lastRef && lastRef.current) {
      lastRef.current.focus();
    }
  }, [ingredients.length]);

  const handleIngredientChange = (text, index) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = text;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    if (ingredients[ingredients.length - 1] !== "") {
      setIngredients([...ingredients, ""]);
    } else {
      ingredientRefs.current[ingredients.length - 1].current.focus();
    }
  };

  const saveRecipeToFirebase = async () => {
    if (
      (selectedCategories?.length ?? 0) === 0 ||
      (selectedCountries?.length ?? 0) === 0
    ) {
      setError("Du må velge minst én kategori og ett land før du lagrer.");
      return;
    }

    setError("");

    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        userFamilyId = userDocSnap.data().familyId;
      } else {
        console.error("Kan ikke finne brukerdata for å hente familyId");
        setError("Feil ved henting av familyId. Kan ikke lagre oppskrift.");
        return;
      }
    } else {
      console.error("Ingen innlogget bruker funnet");
      setError("Du må være logget inn for å lagre en oppskrift.");
      return;
    }

    const recipeData = {
      title,
      link,
      time,
      ingredients,
      categories: selectedCategories,
      countries: selectedCountries,
      familyId: userFamilyId,
    };

    try {
      const docRef = await addDoc(collection(db, "recipes"), recipeData);
      console.log("Document written with ID: ", docRef.id);
      console.log("Oppskrift lagret!");
      navigation.goBack();
    } catch (error) {
      console.error("Feil ved lagring av oppskrift", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView />
      <View style={{ padding: 20 }}>
        <Image
          source={require("../../assets/vedBilde.png")}
          style={{ height: 196, width: "100%", borderRadius: 10 }}
        />
      </View>
      <View
        style={[containerStyles.defaultContainer, { gap: 8, marginTop: 0 }]}
      >
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="Overskrift"
            value={title}
            onChangeText={setTitle}
            style={placeholderStyles.simple}
          />
        </View>
        <View style={{ gap: 12, flexDirection: "row" }}>
          <TextInput
            placeholder="Link til oppskrift"
            value={link}
            onChangeText={setLink}
            style={[placeholderStyles.simple, { flex: 1 }]}
          />
          <TextInput
            placeholder="Tid"
            value={time}
            onChangeText={setTime}
            style={[placeholderStyles.simple, { width: 88 }]}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexDirection: "row", gap: 8 }}
        >
          {selectedCategories && selectedCategories.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {selectedCategories.map((category, index) => (
                <TouchableOpacity key={index} style={buttons.categoryBtn}>
                  <Text>{category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Tilsvarende kan du vise valgte land hvis det er nødvendig */}
          {selectedCountries && selectedCountries.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8 }}>
              {selectedCountries.map((country, index) => (
                <TouchableOpacity key={index} style={buttons.categoryBtn}>
                  <Text>{country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity onPress={() => navigation.navigate("SelectCategory")}>
          <Text style={{ color: colors.blue }}>
            {selectedCategories && selectedCategories.length > 0
              ? "Endre kategorier"
              : "Velg kategorier"}
          </Text>
        </TouchableOpacity>

        {/* Ingredienser */}
        <View style={{ gap: 4 }}>
          <Text style={styles.header}>Legg til ingredienser</Text>
          {ingredients.map((ingredient, index) => (
            <TextInput
              key={index}
              ref={ingredientRefs.current[index]}
              value={ingredient}
              onChangeText={(text) => handleIngredientChange(text, index)}
              placeholder="Legg til ingrediens.."
              style={placeholderStyles.simple}
            />
          ))}
          <TouchableOpacity style={styles.button} onPress={addIngredientField}>
            <Text style={styles.buttonText}>Legg til flere ingredienser</Text>
          </TouchableOpacity>
        </View>

        {error.length > 0 && (
          <Text style={{ color: "red", textAlign: "center", marginTop: 10 }}>
            {error}
          </Text>
        )}
        <TouchableOpacity
          style={{
            paddingVertical: 12,
            backgroundColor: "#007bff",
            borderRadius: 50,
          }}
          onPress={saveRecipeToFirebase}
        >
          <Text style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}>
            Lagre oppskrift
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateRecipe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
