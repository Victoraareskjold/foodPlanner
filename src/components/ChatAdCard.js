import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Touchable,
} from "react-native";

const ChatAdCard = ({ adData }) => {
  if (!adData) return null;

  return (
    <View style={styles.adCard}>
      <Text style={styles.adTitle}>{adData.overskrift}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  adCard: {
    padding: 10,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    zIndex: 1,
  },
  adTitle: {
    fontWeight: "bold",
    // ...andre stiler for tittelen...
  },
  // ...andre stiler...
});

export default ChatAdCard;
