import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  TextInput,
} from "react-native";
import { db, auth } from "../../firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import containerStyles from "../../styles/containerStyles";
import fonts from "../../styles/fonts";
import Check from "../../assets/SVGs/Check";
import Visible from "../../assets/SVGs/Visible";
import Invisible from "../../assets/SVGs/Invisible";
import placeholderStyles from "../../styles/placeholderStyles";
import { getCategoryForIngredient } from "../components/IngredientCategories";
import Swipeable from "react-native-gesture-handler/Swipeable";
import Trash from "../../assets/SVGs/Trash";
import HeaderComponent from "../components/HeaderComponent";

const getWeekId = () => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today - new Date(today.getFullYear(), 0, 1)) / 86400000 + 1
  );
  const weekNumber = Math.ceil((dayOfYear - today.getDay() + 10) / 7);

  return `Year${today.getFullYear()}- Week${weekNumber}`;
};

const ShoppingList = () => {
  const [ingredients, setIngredients] = useState([]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [familyId, setFamilyId] = useState(null);
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("stk.");
  const [error, setError] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      getDoc(userDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          setFamilyId(docSnap.data().familyId);
        }
      });
    }
  }, []);

  useEffect(() => {
    if (familyId) {
      const fetchShoppingList = async () => {
        try {
          const weekId = getWeekId();
          const shoppingListRef = doc(
            db,
            "families",
            familyId,
            "shoppingLists",
            weekId
          );

          const shoppingListSnap = await getDoc(shoppingListRef);
          if (shoppingListSnap.exists()) {
            const data = shoppingListSnap.data();
            console.log("Fetched shopping list data:", data); // Log fetched data
            setIngredients(data.ingredients || []); // Default to empty array
          } else {
            console.log("Shopping list document does not exist");
            setIngredients([]); // Default to empty array if document doesn't exist
          }
        } catch (error) {
          console.error("Error fetching shopping list:", error);
        }
      };

      fetchShoppingList();
    }
  }, [familyId]);

  useEffect(() => {
    console.log("Ingredients updated:", ingredients);
  }, [ingredients]);

  const updateIngredientStatus = async (ingredient, completed) => {
    if (familyId) {
      const weekId = getWeekId();
      const shoppingListRef = doc(
        db,
        "families",
        familyId,
        "shoppingLists",
        weekId
      );

      const updatedIngredients = ingredients.map((ing) =>
        ing.name === ingredient.name && ing.unit === ingredient.unit
          ? { ...ing, completed }
          : ing
      );

      await setDoc(
        shoppingListRef,
        { ingredients: updatedIngredients },
        { merge: true }
      );

      setIngredients(updatedIngredients);
    }
  };

  const addIngredient = async () => {
    if (ingredientName && quantity && unit) {
      if (familyId) {
        const weekId = getWeekId();
        const shoppingListRef = doc(
          db,
          "families",
          familyId,
          "shoppingLists",
          weekId
        );

        const existingIngredientIndex = ingredients.findIndex(
          (ing) => ing.name === ingredientName && ing.unit === unit
        );

        let updatedIngredients = [...ingredients];

        if (existingIngredientIndex !== -1) {
          // Oppdater eksisterende ingrediens
          const existingIngredient =
            updatedIngredients[existingIngredientIndex];
          const updatedQuantity =
            parseFloat(existingIngredient.quantity) + parseFloat(quantity);
          updatedIngredients[existingIngredientIndex] = {
            ...existingIngredient,
            quantity: updatedQuantity.toString(),
          };
        } else {
          // Legg til ny ingrediens
          const newIngredient = {
            name: ingredientName,
            quantity,
            unit,
            completed: false,
          };
          updatedIngredients.push(newIngredient);
        }

        await setDoc(
          shoppingListRef,
          { ingredients: updatedIngredients },
          { merge: true }
        );

        setIngredients(updatedIngredients);
        setIngredientName("");
        setError("");
      }
    } else {
      setError("Alle felt må fylles ut for å legge til en ingrediens.");
    }
  };

  const toggleCompletedList = () => {
    setShowCompleted(!showCompleted);
  };

  const categorizedIngredients = () => {
    const categories = {
      "🥩 Kjøtt": [],
      "🥛 Meieri": [],
      "🥐 Bakevarer": [],
      "🧂 Krydder": [],
      "🥕 Grønnsaker": [],
      "🍏 Frukt": [],
      "🍝 Ferdigmat": [],
      "🍲 Hermetikk": [],
      "🍞 Brødvarer": [],
      "🧀 Pålegg": [],
      "🧊 Frysevarer": [],
      Annet: [],
    };

    ingredients.forEach((ingredient) => {
      const category = getCategoryForIngredient(ingredient.name);
      if (!categories[category]) {
        categories[category] = []; // Initialize the category if it doesn't exist
      }
      categories[category].push(ingredient);
    });

    return categories;
  };

  const renderIngredients = (ingredientList) => {
    return ingredientList.map((ingredient, index) => (
      <Swipeable
        renderRightActions={rightSwipeActions}
        key={`${ingredient.name.toLowerCase()}|${index}`}
      >
        <TouchableOpacity
          onPress={() =>
            updateIngredientStatus(ingredient, !ingredient.completed)
          }
          key={`${ingredient.name.toLowerCase()}|${index}`}
          style={styles.listItem}
        >
          <View style={styles.listText}>
            <View style={{ minWidth: 48, flexDirection: "row", gap: 4 }}>
              <Text>{ingredient.quantity}</Text>
              <Text>{ingredient.unit}</Text>
            </View>
            <Text style={{ marginStart: 8, fontSize: 14, fontWeight: "500" }}>
              {ingredient.name}
            </Text>
          </View>
          <View
            style={ingredient.completed ? styles.checkedBox : styles.checkBox}
          >
            {ingredient.completed && <Check />}
          </View>
        </TouchableOpacity>
      </Swipeable>
    ));
  };

  const ingredientsByCategory = categorizedIngredients();

  const rightSwipeActions = (ingredient) => {
    return (
      <TouchableOpacity
        style={{
          borderRadius: 5,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 16,
        }}
      >
        <Trash />
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[
        containerStyles.defaultContainer,
        { paddingHorizontal: 0, gap: 0 },
      ]}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <SafeAreaView />
      <ScrollView
        contentContainerStyle={{
          gap: 20,
          paddingBottom: 108,
          paddingHorizontal: 20,
        }}
        style={{ overflow: "visible", zIndex: 0 }}
      >
        {Object.entries(ingredientsByCategory).map(
          ([category, ingredients]) =>
            ingredients.length > 0 &&
            !ingredients.every((ingredient) => ingredient.completed) && (
              <View key={category}>
                <Text style={styles.categoryHeader}>{category}</Text>
                <View style={styles.list}>
                  {renderIngredients(
                    ingredients.filter((ingredient) => !ingredient.completed)
                  )}
                </View>
              </View>
            )
        )}

        <TouchableOpacity
          style={{ alignSelf: "center" }}
          onPress={toggleCompletedList}
        >
          {showCompleted ? (
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Text style={fonts.body2}>Skjul fullførte</Text>
              <Invisible />
            </View>
          ) : (
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Text style={fonts.body2}>Vis fullførte</Text>
              <Visible />
            </View>
          )}
        </TouchableOpacity>
        {showCompleted && (
          <View style={styles.list}>
            {renderIngredients(
              ingredients.filter((ingredient) => ingredient.completed)
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <View style={{ gap: 12 }}>
          <TextInput
            placeholder="Ingrediens navn"
            value={ingredientName}
            onChangeText={setIngredientName}
            style={[placeholderStyles.simple]}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TextInput
              placeholder="Antall"
              value={quantity}
              onChangeText={setQuantity}
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
              style={[styles.categoryBtn, { backgroundColor: "#185BF0" }]}
              onPress={addIngredient}
            >
              <Text
                style={[fonts.btnBody, { alignSelf: "center", color: "#FFF" }]}
              >
                Legg til
              </Text>
            </TouchableOpacity>
          </View>
          {error.length > 0 && (
            <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ShoppingList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFCFC",
  },
  list: {
    gap: 8,
  },
  listItems: {
    marginBottom: 8,
    flex: 1,
    backgroundColor: "red",
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
  },
  listText: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  checkBox: {
    height: 20,
    width: 20,
    borderColor: "#E1E8F9",
    borderWidth: 1.5,
    borderRadius: 5,
  },
  checkedBox: {
    height: 20,
    width: 20,
    backgroundColor: "#185BF0",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    flexDirection: "column",
    justifyContent: "space-between",
    gap: 12,
    zIndex: 1,
    backgroundColor: "#FFF",
  },
  inputContainer: {
    backgroundColor: "#FCFCFC",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  categoryBtn: {
    backgroundColor: "#EEEEEE",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 5,
    flex: 1,
    justifyContent: "center",
  },
  categoryHeader: {
    color: "#C3C3C3",
  },
});
