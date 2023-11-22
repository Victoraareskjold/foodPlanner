import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from "../../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';

import WorkCard from '../components/WorkCard';
import AdCard from '../components/AdCard';
import { categories } from '../components/Categories';
import ProfileModal from '../components/ProfileModal';
import StatusButton from '../components/StatusButton';

import buttons from '../../styles/buttons';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import images from '../../styles/images';
import containerStyles from '../../styles/containerStyles';

const AdView = ({ route }) => {

    const navigation = useNavigation();
    
    const { adData } = route.params;

    const category = categories.find((category) => category.text === adData.kategori);

    const [status, setStatus] = useState(adData.status);

    const handleStatusUpdate = async (newStatus) => {
      try {
        // Oppdater statusen i komponentens tilstand
        setStatus(newStatus);
    
        // Oppdater statusen i databasen
        const adRef = doc(db, 'annonser', adData.id); // Anta at du har en unik id for hver annonse i adData
        await updateDoc(adRef, { status: newStatus });
    
        // Gi tilbakemelding eller oppdater annen logikk etter behov
        console.log(`Status updated to "${newStatus}"`);
      } catch (error) {
        console.error('Feil ved oppdatering av status:', error);
      }
    };    

    const handleDeleteAd = async () => {
      try {
        // Vis bekreftelsesdialog før sletting
        Alert.alert(
          'Bekreft sletting',
          'Er du sikker på at du vil slette denne annonsen?',
          [
            {
              text: 'Avbryt',
              style: 'cancel',
            },
            {
              text: 'Slett',
              style: 'destructive',
              onPress: async () => {
                const adRef = doc(db, 'annonser', adData.id);
                await deleteDoc(adRef);
                navigation.goBack();
              },
            },
          ]
        );
      } catch (error) {
        console.error('Feil ved sletting av annonse:', error);
      }
    };
  
    return (
      <View style={styles.container}>
        <Image 
          source={require('../../assets/vedBilde.png')}
          style={styles.image}
        />
        <View style={styles.textContainer}>

            <Text style={{ fontSize: 24, fontWeight: '500', marginBottom: 6, }}>{adData.overskrift}</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                {category && (
                    <View style={styles.categoryContainer}>
                    <Text style={styles.categoryText}>{category.text}</Text>
                    <Image source={category.icon} style={styles.icon} />
                    </View>
                )}

                <StatusButton status={adData.status} />
            </View>

          <Text>Beskrivelse</Text>
          <Text style={{ fontSize: 16, marginBottom: 12, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}>
            {adData.beskrivelse}
          </Text>

          <Text>Sted</Text>
          <Text style={{ fontSize: 16, marginBottom: 12, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}>
            {adData.sted}
          </Text>

          <TouchableOpacity style={buttons.btn1} onPress={() => handleStatusUpdate('in progress')}>
            <Text style={[fonts.btnBody, { color: 'blue' }]}>
              Sett til "In Progress"
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[buttons.btn1, { backgroundColor: 'red' }]} onPress={handleDeleteAd}>
            <Text style={[fonts.btnBody, { color: 'white' }]}>
              Slett annonse
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    );
  };
  
  export default AdView;
  
  const styles = StyleSheet.create({
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    icon: {
        height: 24,
        width: 24,
        marginLeft: 6,
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '500',
    },

    container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    image: {
      width: '100%',
      height: 200,
    },
    textContainer: {
      marginTop: 16,
      padding: 12,
    },
  });