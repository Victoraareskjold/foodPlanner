import {
  Text,
  View,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import DropDownPicker from "react-native-dropdown-picker";

import { db, auth } from "../../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import fonts from "../../styles/fonts";
import buttons from "../../styles/buttons";
import colors from "../../styles/colors";
import HeaderComponent from "../components/HeaderComponent";
import Plus from "../../assets/SVGs/Plus";

const CreateRecipe = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [time, setTime] = useState("");

  const { selectedCategories } = route.params ?? {};
  const [ingredients, setIngredients] = useState([]);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [portions, setPortions] = useState("");
  const [unit, setUnit] = useState("stk.");
  const ingredientRefs = useRef([]);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("stk.");
  const [items, setItems] = useState([
    { label: "stk.", value: "stk." },
    { label: "L", value: "L" },
    { label: "dl", value: "dl" },
    { label: "kg", value: "kg" },
    { label: "g", value: "g" },
  ]);

  const [error, setError] = useState("");

  const ingredientNameRef = useRef(null);

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
      setQuantity("1");
      /* setUnit(""); */
      setTimeout(() => {
        ingredientNameRef.current?.focus(); // Beholder fokus på TextInput med forsinkelse
      }, 1);
    } else {
      // Håndter feil hvis noen felt mangler
      setError("Alle felt må fylles ut for å legge til en ingrediens");
    }
  };

  const handleSubmitEditing = () => {
    if (ingredientName.length > 0) {
      addIngredient();
    }
  };

  const renderAddedIngredients = () => {
    return ingredients.map((ingredient, index) => (
      <View
        key={index}
        style={{
          flexDirection: "row",
          gap: 24,
          marginBottom: 8,
          backgroundColor: colors.secondary,
          padding: 16,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: colors.dark, fontSize: 14 }}>
          {ingredient.quantity} {ingredient.unit}
        </Text>
        <Text style={[{ flex: 1, color: colors.dark, fontSize: 14 }]}>
          {ingredient.name}
        </Text>
      </View>
    ));
  };

  const saveRecipeToFirebase = async () => {
    if ((title?.length ?? 0) === 0) {
      setError("Du må gi oppskriften en tittel.");
      return;
    }

    setError("");

    let userFamilyId;

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
      // Lagre oppskriften under families/{familyId}/recipes
      const familyRecipesCollectionRef = collection(
        db,
        "families",
        userFamilyId,
        "recipes"
      );
      const docRef = await addDoc(familyRecipesCollectionRef, recipeData);
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
    >
      <HeaderComponent headerText={title} leftButton={true} />
      <ScrollView style={styles.container}>
        <View>
          <Image
            source={require("../../assets/placeholderImage.png")}
            style={{ height: 200, width: "100%", marginBottom: 20 }}
          />
        </View>
        <View style={[containerStyles.defaultContainer, { gap: 48 }]}>
          <View style={{ gap: 12 }}>
            <View>
              <TextInput
                placeholder="Overskrift"
                value={title}
                onChangeText={setTitle}
                style={placeholderStyles.simple}
                placeholderTextColor={colors.primary}
              />
            </View>
            <View style={{ gap: 12, flexDirection: "row" }}>
              <TextInput
                placeholder="Nettside link"
                value={link}
                onChangeText={setLink}
                style={[placeholderStyles.simple, { flex: 1 }]}
                placeholderTextColor={colors.primary}
              />
              <TextInput
                placeholder="Porsjoner"
                value={portions}
                onChangeText={setPortions}
                style={[placeholderStyles.simple, { minWidth: 96 }]}
                placeholderTextColor={colors.primary}
              />
              <TextInput
                placeholder="Tid"
                value={time}
                onChangeText={setTime}
                style={[placeholderStyles.simple, { minWidth: 96 }]}
                placeholderTextColor={colors.primary}
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
                <View style={{ flexDirection: "row", gap: 12 }}>
                  {selectedCategories.map((category, index) => (
                    <TouchableOpacity key={index} style={buttons.categoryBtn}>
                      <Text
                        style={{
                          color: colors.popColor,
                          fontWeight: "600",
                        }}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.categoryBtn}
              onPress={() => navigation.navigate("SelectCategory")}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "600",
                }}
              >
                {selectedCategories && selectedCategories.length > 0
                  ? "Endre kategorier"
                  : "Velg kategorier"}
              </Text>
              <Plus />
            </TouchableOpacity>
          </View>

          <View>
            <Text
              style={{
                marginBottom: 4,
                color: colors.primary,
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Ingredienser
            </Text>
            {renderAddedIngredients()}
          </View>

          {/* Ingredienser */}
          <View style={{ gap: 12 }}>
            {/* Ingrediens input felt */}
            <TextInput
              ref={ingredientNameRef}
              value={ingredientName}
              onChangeText={setIngredientName}
              placeholder="Ingrediens navn"
              style={[placeholderStyles.simple, { flex: 1 }]}
              placeholderTextColor={colors.primary}
              onSubmitEditing={handleSubmitEditing}
              returnKeyType="done"
            />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                value={quantity}
                onChangeText={setQuantity}
                placeholder="Antall"
                style={[placeholderStyles.simple, { flex: 1 }]}
                placeholderTextColor={colors.primary}
                keyboardType="numeric"
              />

              <DropDownPicker
                labelStyle={{ color: colors.dark }}
                containerStyle={{
                  flex: 1,
                  backgroundColor: colors.secondary,
                  borderRadius: 10,
                  borderColor: colors.secondary,
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.secondary,
                  borderColor: colors.secondary,
                }}
                dropDownContainerStyle={{
                  flex: 1,
                  backgroundColor: "white",
                  borderColor: colors.secondary,
                }}
                placeholder={value}
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={setValue}
                setItems={setItems}
                onChangeValue={(value) => setUnit(value)}
              />

              <TouchableOpacity style={styles.addBtn} onPress={addIngredient}>
                <Text
                  style={[
                    fonts.btnBody,
                    { alignSelf: "center", color: colors.popColor },
                  ]}
                >
                  Legg til
                </Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: colors.bgColor,
  },
  categoryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    alignSelf: "center",
  },
  addBtn: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flex: 1,
    backgroundColor: colors.popColorSecondary,
    borderRadius: 10,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    flex: 1,
  },
});
