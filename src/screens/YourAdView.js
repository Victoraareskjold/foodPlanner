import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

import { categories } from "../components/Categories";

const YourAdView = ({ route }) => {
  const { adData } = route.params;
  const [isEditing, setIsEditing] = useState(false);
  const [newOverskrift, setNewOverskrift] = useState(adData.overskrift);
  const [newBeskrivelse, setNewBeskrivelse] = useState(adData.beskrivelse);
  const [newSted, setNewSted] = useState(adData.sted);

  const category = categories.find(
    (category) => category.text === adData.kategori
  );

  const [status, setStatus] = useState(adData.status);

  const navigation = useNavigation();

  const handleUpdateAd = async () => {
    try {
      // Oppdater annonseinformasjonen i Firestore
      const adRef = doc(db, "annonser", adData.id);
      await updateDoc(adRef, {
        overskrift: newOverskrift,
        beskrivelse: newBeskrivelse,
        sted: newSted,
        status: status,
      });

      // Gå tilbake til visningsskjermen når oppdateringen er fullført
      navigation.goBack();
    } catch (error) {
      console.error("Feil ved oppdatering av annonse:", error);
    }
  };

  const handleDeleteAd = async () => {
    try {
      // Vis bekreftelsesdialog før sletting
      Alert.alert(
        "Bekreft sletting",
        "Er du sikker på at du vil slette denne annonsen?",
        [
          {
            text: "Avbryt",
            style: "cancel",
          },
          {
            text: "Slett",
            style: "destructive",
            onPress: async () => {
              const adRef = doc(db, "annonser", adData.id);
              await deleteDoc(adRef);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Feil ved sletting av annonse:", error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {adData.bildeUrl && (
        <Image
          source={{ uri: adData.bildeUrl }}
          style={{ height: 200, width: "100%" }}
        />
      )}
      <View style={styles.container}>
        <Text style={styles.label}>Overskrift</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.inputBorder]}
            value={newOverskrift}
            onChangeText={(text) => setNewOverskrift(text)}
          />
        ) : (
          <Text style={styles.text}>{newOverskrift}</Text>
        )}

        <View>
          {category && (
            <View style={styles.categoryContainer}>
              <Text style={styles.categoryText}>{category.text}</Text>
              <Image source={category.icon} style={styles.icon} />
            </View>
          )}
        </View>

        <Text style={styles.label}>Beskrivelse</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.inputBorder]}
            value={newBeskrivelse}
            onChangeText={(text) => setNewBeskrivelse(text)}
            multiline={true}
          />
        ) : (
          <Text style={styles.text}>{newBeskrivelse}</Text>
        )}

        <Text style={styles.label}>Sted</Text>
        {isEditing ? (
          <TextInput
            style={[styles.input, styles.inputBorder]}
            value={newSted}
            onChangeText={(text) => setNewSted(text)}
          />
        ) : (
          <Text style={styles.text}>{newSted}</Text>
        )}

        {isEditing ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "blue" }]}
            onPress={handleUpdateAd}
          >
            <Text style={styles.buttonText}>Lagre endringer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "blue" }]}
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.buttonText}>Rediger</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { borderColor: "red", borderWidth: 1 }]}
          onPress={handleDeleteAd}
        >
          <Text style={[styles.buttonText, { color: "red" }]}>
            Slett annonse
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
  },
  inputBorder: {
    borderColor: "blue", // Endre fargen på input-feltet når det er i redigeringsmodus
  },
  button: {
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    height: 24,
    width: 24,
    marginLeft: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default YourAdView;
