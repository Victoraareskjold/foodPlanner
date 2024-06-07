import { Text, View } from "react-native";
import { useEffect } from "react";
import { useNavigation } from "@react-navigation/native";

import { auth } from "../../firebase";

import containerStyles from "../../styles/containerStyles";
import HeaderComponent from "../components/HeaderComponent";

export default function DinSide() {
  useEffect(() => {
    if (!auth.currentUser) {
      navigation.navigate("Login");
    }
  }, []);

  const navigation = useNavigation();

  return (
    <View style={containerStyles.defaultContainer}>
      <HeaderComponent headerText="Hjem" leftButton={false} />
      <View>
        <Text>Tomt enn så lenge..</Text>
      </View>
    </View>
  );
}
