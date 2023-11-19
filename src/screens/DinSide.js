import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image, FlatList } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import { auth, db } from "../../firebase";
import { collection, getDocs } from 'firebase/firestore';
import { firestore } from '../../firebase';

import WorkCard from '../components/WorkCard';
import AdCard from '../components/AdCard';
import { categories } from '../components/Categories';
import ProfileModal from '../components/ProfileModal';

import buttons from '../../styles/buttons';
import Colors from '../../styles/Colors';
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

  const fetchAdsFromDatabase = async () => {
    try {
      const adsCollectionRef = collection(db, 'annonser');
      const adsSnapshot = await getDocs(adsCollectionRef);
      const adsData = adsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched ads data:', adsData); // Legg til denne linjen
      return adsData;
    } catch (error) {
      console.error('Error fetching ads data:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAdsFromDatabase();
        console.log('Set ads data:', data); // Legg til denne linjen
        setAdData(data);
      } catch (error) {
        console.error('Error setting ads data:', error);
      }
    };
  
    fetchData();
  }, []);

  return (
    <View style={styles.container}>
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

          <View>
            <FlatList
              data={adData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => <AdCard adData={item} />}
            />
          </View>

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
