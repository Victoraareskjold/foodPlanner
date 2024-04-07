import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Touchable,
  Image,
} from "react-native";

const ChatAdCard = ({ adData }) => {
  if (!adData) return null;

  return (
    <TouchableOpacity style={styles.adCard}>
      <Image
        style={styles.imageStyling}
        source={{ uri: adData.bildeUrl }} // Ensure this is the correct path to your image URL in the adData object
      />
      <View>
        <Text style={styles.adTitle}>{adData.overskrift}</Text>
        <Text style={styles.adTitle}>{adData.sted}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  adCard: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "lightgrey",
    zIndex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adTitle: {
    fontWeight: "bold",
    // ...andre stiler for tittelen...
  },
  imageStyling: {
    height: 80,
    width: 80,
  },
});

export default ChatAdCard;
