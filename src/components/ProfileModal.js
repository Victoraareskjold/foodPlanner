// ProfileModal.js
import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native'; 

import { getAuth, signOut } from "firebase/auth";

import { BlurView } from '@react-native-community/blur';

const ProfileModal = ({ isVisible, onClose }) => {

    const navigation = useNavigation(); // Legg til denne linjen

    const handleSignOut = async () => {
        try {
          // Logg brukeren ut fra Firebase
          const auth = getAuth();
          await signOut(auth);
      
          // Send brukeren tilbake til Onboarding
          navigation.replace('Onboarding');
        } catch (error) {
          console.log(error.message);
        }
      }; 

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>

          <TouchableOpacity 
            onPress={onClose}
            style={{padding: 12}}
          >
            <Text>Lukk</Text>
          </TouchableOpacity>
  
          <TouchableOpacity 
            onPress={handleSignOut}
            style={{padding: 12}}
          >
            <Text>Logg ut</Text>
          </TouchableOpacity>

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    position: 'absolute',
    paddingHorizontal: 20,
    paddingTop: 72,
    height: '100%',
    width: '100%',
  },
  modalContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
});

export default ProfileModal;
