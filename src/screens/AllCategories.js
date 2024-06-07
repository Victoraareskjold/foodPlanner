import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";

import WorkCard from "../components/WorkCard";

import containerStyles from "../../styles/containerStyles";
import placeholderStyles from "../../styles/placeholderStyles";
import buttons from "../../styles/buttons";
import fonts from "../../styles/fonts";
import { categories } from "../components/Categories";
import colors from "../../styles/colors";

export default function CreateAd({ route }) {
  const navigation = useNavigation();

  const WorkCard = ({ color, icon, text, onPress }) => {
    const textColor = text === "Se alle" ? "#FFF" : "#272727"; // Endre farge basert på teksten

    return (
      <TouchableOpacity onPress={onPress}>
        <View style={styles.card}>
          <Image source={icon} style={styles.icon} />
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredCategories = categories.filter(
    (category) => category.id !== 6 && category.id !== 12
  );

  return (
    <View style={{ backgroundColor: "#FFF", flex: 1 }}>
      <SafeAreaView />
      <ScrollView>
        <View style={containerStyles.defaultContainer}>
          {/* cards */}
          <View style={styles.cardGrid}>
            {filteredCategories.map((category) => (
              <WorkCard
                key={category.id}
                color={{ backgroundColor: colors.darkGrey }}
                /* icon={category.icon} */
                text={category.text}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.lightGrey,
    flexDirection: "row",
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  /*   icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  }, */
  text: {
    color: "#272727",
    fontSize: 16,
    fontWeight: "500",
    alignSelf: "center",
  },
});
