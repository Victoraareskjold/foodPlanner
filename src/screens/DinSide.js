import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList, ScrollView } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from "../../firebase";
import { collection, getDocs, where, query, onSnapshot } from 'firebase/firestore'; // Correct import statements
import { firestore } from '../../firebase';

import WorkCard from '../components/WorkCard';
import AdCard from '../components/AdCard';
import { categories } from '../components/Categories';
import ProfileModal from '../components/ProfileModal';
import SearchBar from '../components/SearchBar';

import buttons from '../../styles/buttons';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import images from '../../styles/images';
import containerStyles from '../../styles/containerStyles';

export default function DinSide() {

  const navigation = useNavigation();

  const firstSixCategories = categories.slice(0, 6);

  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const openProfileModal = () => {
    setProfileModalVisible(true);
  };
  const closeProfileModal = () => {
    setProfileModalVisible(false);
  };

  const WorkCard = ({ color, icon, text, onPress }) => {

    const textColor = text === 'Se alle' ? '#FFF' : '#272727'; // Endre farge basert på teksten
  
    return (
      <TouchableOpacity onPress={onPress}>
        <View style={[styles.card, { backgroundColor: color }]}>
          <Image source={icon} style={styles.icon} />
          <Text style={[styles.text, { color: textColor }]}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const [adData, setAdData] = useState([]);

  const fetchAdsFromDatabase = (userUid) => {
    const adsCollectionRef = collection(db, 'annonser');
    
    // Set up a real-time listener for changes to the 'annonser' collection
    const unsubscribe = onSnapshot(query(adsCollectionRef, where('uid', '==', userUid)), (snapshot) => {
      const adsData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched ads');
      setAdData(adsData);
    });
  
    // Clean up the listener when the component is unmounted
    return unsubscribe;
  };
  
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      const unsubscribe = fetchAdsFromDatabase(user.uid);
  
      return () => {
        // Clean up the listener when the component is unmounted
        unsubscribe();
      };
    }
  }, [auth.currentUser]);

  return (
    <ScrollView style={styles.container}>
      <SafeAreaView/>

        {/* Header */}
        <View style={{paddingHorizontal: 20, marginTop: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>

          <Text style={fonts.header}>Din side</Text>

          {/* Bell & user */}
          <View style={{flexDirection: 'row'}}>
            <TouchableOpacity>
              <Image 
                source={require('../../assets/noti.png')}
                style={images.icon48}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={openProfileModal}>
              <Image 
                source={require('../../assets/user-1.png')}
                style={[images.icon48, {marginLeft: 8}]}
              />
            </TouchableOpacity>

            {/* Profilmodal */}
            <ProfileModal isVisible={isProfileModalVisible} onClose={closeProfileModal} />
          </View>
        </View>

        {/* Hva trenger du hjelp med? */}
        <View style={containerStyles.defaultContainer}>

          <Text style={fonts.subHeader}>Hva trenger du hjelp med?</Text>

          {/* Searchbar */}
          <View style={{ marginTop: 12 }}>
            <SearchBar placeholder={'Søk etter kategorier'} />
          </View>

          {/* cards */}
          <View style={styles.cardGrid}>
            {firstSixCategories.map((category) => (
              <WorkCard
                key={category.id}
                color={category.color}
                icon={category.icon}
                text={category.text}
                onPress={() => {
                  if (category.id === 6) {
                    // Behandling for det siste kortet
                    // For eksempel, navigasjon til en annen skjerm
                    navigation.navigate('AllCategories');
                  } else {
                    // Behandling for de andre kortene
                    navigation.navigate('CreateAd', { category: category.text });
                  }
                }}
              />
            ))}
          </View>

        </View>

        {/* Pågående arbeid */}
        <View style={containerStyles.defaultContainer}>

          <Text style={fonts.subHeader}>Pågående arbeid</Text>

          <View style={{ marginTop: 16 }}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={adData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <AdCard adData={item} navigation={navigation} />
            )}
          />
        </View>

        </View>

    </ScrollView>
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
    rowGap: 12,
  },
  card: {
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 5,
    width: 108,
    alignItems: 'center',
  },
  icon: {
    width: 32,
    height: 32,
    marginBottom: 12,
  },
  text: {
    color: '#272727',
    fontSize: 16,
    fontWeight: '500',
    alignSelf: 'center',
  },
});
