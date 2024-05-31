import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import { db, auth } from "../../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import fonts from "../../styles/fonts";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import { setPriority } from "firebase/database";

const CreateRecipe = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [time, setTime] = useState("");

  const { selectedCategories } = route.params ?? {};
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [portions, setPortions] = useState("");
  const [unit, setUnit] = useState("");
  const ingredientRefs = useRef([]);

  const [error, setError] = useState("");

  useEffect(() => {
    const lastIndex = ingredients.length - 1;
    const lastRef = ingredientRefs.current[lastIndex];
    if (lastRef && lastRef.name) {
      lastRef.name.focus();
    }
  }, [ingredients.length]);

  const handleIngredientChange = (value, index, field) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    if (ingredientName && quantity && unit) {
      const newIngredient = { name: ingredientName, quantity, unit };
      setIngredients([...ingredients, newIngredient]);
      // Nullstiller inputfeltene
      setIngredientName("");
      setQuantity("");
      /* setQuantity("");
      setUnit(""); */
    } else {
      // Håndter feil hvis noen felt mangler
      setError("Alle felt må fylles ut for å legge til en ingrediens");
    }
  };

  const renderAddedIngredients = () => {
    return ingredients.map((ingredient, index) => (
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

  const saveRecipeToFirebase = async () => {
    if ((title?.length ?? 0) === 0) {
      setError("Du må gi oppskriften en tittel.");
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
      portions,
      categories: selectedCategories,
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ScrollView style={styles.container}>
        <SafeAreaView />
        <View>
          <Image
            source={require("../../assets/placeholderImage.png")}
            style={{ height: 200, width: "100%" }}
          />
        </View>
        <View style={[containerStyles.defaultContainer, { gap: 32 }]}>
          <View style={{ gap: 12 }}>
            <View>
              <TextInput
                placeholder="Overskrift"
                value={title}
                onChangeText={setTitle}
                style={placeholderStyles.simple}
              />
            </View>
            <View style={{ gap: 12, flexDirection: "row" }}>
              <TextInput
                placeholder="Nettside link"
                value={link}
                onChangeText={setLink}
                style={[placeholderStyles.simple, { flex: 1 }]}
              />
              <TextInput
                placeholder="Porsjoner"
                value={portions}
                onChangeText={setPortions}
                style={[placeholderStyles.simple, { minWidth: 96 }]}
              />
              <TextInput
                placeholder="Tid"
                value={time}
                onChangeText={setTime}
                style={[placeholderStyles.simple, { minWidth: 96 }]}
              />
            </View>
          </View>

          <View style={{ gap: 12 }}>
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
            </ScrollView>

            <TouchableOpacity
              style={styles.categoryBtn}
              onPress={() => navigation.navigate("SelectCategory")}
            >
              <Text style={{ textAlign: "center" }}>
                {selectedCategories && selectedCategories.length > 0
                  ? "Endre kategorier"
                  : "Velg kategorier"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ingredienser */}
          <View style={{ gap: 12 }}>
            {/* Ingrediens input felt */}
            <TextInput
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="Ingrediens navn"
              style={[placeholderStyles.simple, { flex: 3 }]}
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Antall"
                style={[placeholderStyles.simple, { width: 80 }]}
              />
              <Picker
                itemStyle={{
                  fontSize: 14,
                }}
                style={[
                  placeholderStyles.simple,
                  {
                    flex: 1,
                    height: 49,
                    justifyContent: "center",
                    overflow: "scroll",
                    fontSize: 8,
                  },
                ]}
                selectedValue={unit}
                onValueChange={(itemValue, itemIndex) => setUnit(itemValue)}
                placeholder="Enhet"
              >
                <Picker.Item label="stk." value="stk." />
                <Picker.Item label="L" value="L" />
                <Picker.Item label="dl" value="dl" />
                <Picker.Item label="kg" value="kg" />
                <Picker.Item label="g" value="g" />
              </Picker>
              <TouchableOpacity
                style={styles.categoryBtn}
                onPress={addIngredient}
              >
                <Text style={[fonts.btnBody, { alignSelf: "center" }]}>
                  Legg til
                </Text>
              </TouchableOpacity>
            </View>
            {renderAddedIngredients()}
          </View>
          {error.length > 0 && (
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          )}
          <TouchableOpacity
            style={[styles.button, {}]}
            onPress={saveRecipeToFirebase}
          >
            <Text
              style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}
            >
              Lagre oppskrift
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateRecipe;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  categoryBtn: {
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    flex: 1,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    flex: 1,
  },
});
