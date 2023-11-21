import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from "../../firebase";
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
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

  const fetchAdsFromDatabase = () => {
    try {
      const adsCollectionRef = collection(db, 'annonser');
      const unsubscribe = onSnapshot(adsCollectionRef, (snapshot) => {
        const adsData = snapshot.docs
          .filter(doc => doc.data().status === 'not started')
          .filter(doc => selectedCategory === '' || doc.data().kategori === selectedCategory) // Legg til denne linjen
          .map((doc) => ({ id: doc.id, ...doc.data() }));
  
        console.log('Fetched all ads');
        setAdData(adsData);
      });
  
      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching ads data:', error);
      throw error;
    }
  };  

  useEffect(() => {
    const fetchAdsFromDatabase = () => {
      try {
        const adsCollectionRef = collection(db, 'annonser');
        
        // Sett opp en sanntidslytter for endringer i 'annonser'-samlingen
        const unsubscribe = onSnapshot(adsCollectionRef, (snapshot) => {
          const adsData = snapshot.docs
            .filter(doc => doc.data().status === 'not started')
            .map((doc) => ({ id: doc.id, ...doc.data() }));
    
          console.log('Fetched all ads');
          setAdData(adsData);
        });
    
        // Rydd opp i lytteren når komponenten blir avmontert
        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching ads data:', error);
        throw error;
      }
    };
  
    const unsubscribe = fetchAdsFromDatabase();
  
    // Rydd opp i lytteren når komponenten blir avmontert
    return () => unsubscribe();
  }, []);    

  const [selectedCategory, setSelectedCategory] = useState('');

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
  };  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const adsCollectionRef = collection(db, 'annonser');
        const snapshot = await getDocs(adsCollectionRef);
        const adsData = snapshot.docs
          .filter(doc => doc.data().status === 'Ikke startet')
          .filter(doc => selectedCategory === '' || doc.data().kategori === selectedCategory)
          .map((doc) => ({ id: doc.id, ...doc.data() }));
  
        console.log('Fetched all ads');
        setAdData(adsData);
      } catch (error) {
        console.error('Error fetching ads data:', error);
        throw error;
      }
    };
  
    fetchData();
  }, [selectedCategory]);  

  return (
    <View style={styles.container}>
      <SafeAreaView/>

        {/* Header */}
        <View style={{paddingHorizontal: 20, marginTop: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

            <Text style={fonts.header}>Alle annonser</Text>

        </View>

        <View style={containerStyles.defaultContainer}>

            <SearchBar placeholder={'Søk etter annonser'} />
            <CategoryButtons onSelectCategory={handleSelectCategory} />

        </View>

        <View style={containerStyles.defaultContainer}>
            <FlatList
                ListEmptyComponent={<Text style={{ alignSelf: 'center', marginTop: 20 }}>Ingen annonser</Text>}
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
