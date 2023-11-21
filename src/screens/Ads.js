import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from "../../firebase";
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';

import WorkCard from '../components/WorkCard';
import AdCard from '../components/AdCard';
import AdCardList from '../components/AdCardList';
import { categories } from '../components/Categories';
import ProfileModal from '../components/ProfileModal';

import buttons from '../../styles/buttons';
import Colors from '../../styles/Colors';
import fonts from '../../styles/fonts';
import images from '../../styles/images';
import containerStyles from '../../styles/containerStyles';

import SearchBar from '../components/SearchBar';
import CategoryButtons from '../components/CategoryButtons';

export default function Ads() {

  const navigation = useNavigation();

  const [adData, setAdData] = useState([]);

  const fetchAdsFromDatabase = async () => {
    try {
      const adsCollectionRef = collection(db, 'annonser');
      const adsSnapshot = await getDocs(adsCollectionRef);
      const adsData = adsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched all ads'); // Legg til denne linjen
      return adsData;
    } catch (error) {
      console.error('Feil ved henting av annonser:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdsFromDatabase();
        setAdData(data);
      } catch (error) {
        console.error('Feil ved oppdatering av annonser:', error);
      }
    };

    // Hent data umiddelbart når komponenten lastes
    fetchData();

    // Sett opp periodisk henting av data hvert minutt
    const intervalId = setInterval(fetchData, 60000);

    // Rydd opp i intervallet når komponenten blir avmontert
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <SafeAreaView/>

        {/* Header */}
        <View style={{paddingHorizontal: 20, marginTop: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

            <Text style={fonts.header}>Alle annonser</Text>

        </View>

        <View style={containerStyles.defaultContainer}>

            <SearchBar 
                placeholder={'Søk etter annonser'}
            />
            <CategoryButtons />

        </View>

        <View style={containerStyles.defaultContainer}>
            <FlatList
                data={adData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <AdCardList adData={item} />}
            />
        </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
    rowGap: 16,
  },
  card: {
    paddingVertical: 24,
    paddingHorizontal: 8,
    borderRadius: 5,
    width: 108,
    alignItems: 'center',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 12,
  },
  text: {
    color: '#272727',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
});
