import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import React from "react";

import { categories } from "./Categories";
import colors from "../../styles/colors";
import { Auth, db } from "firebase/auth";

const AdCardList = (props) => {
  const { adData, navigation, userUID } = props;

  const category = categories.find(
    (category) => category.text === adData.kategori
  );

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate("AdView", { adData: adData })}
    >
      <Image
        source={require("../../assets/vedBilde.png")}
        style={styles.image}
      />
      <View style={styles.textContainer}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingVertical: 0,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "500" }}>
            {adData.overskrift}
          </Text>
          {category && (
            <Image
              source={category.icon}
              style={[styles.icon, { marginLeft: 8 }]}
            />
          )}
        </View>
        {/* <Text 
        style={{ fontSize: 16, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}
        numberOfLines={2}
      >{adData.beskrivelse}</Text> */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "400",
            color: "rgba(0, 0, 0, 0.76)",
          }}
        >
          {adData.sted}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default AdCardList;

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 124,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  icon: {
    height: 24,
    width: 24,
  },
  cardContainer: {
    borderRadius: 5,
    width: "100%",
    backgroundColor: colors.grey,
    marginBottom: 20,
  },
  textContainer: {
    padding: 16,
  },
});
