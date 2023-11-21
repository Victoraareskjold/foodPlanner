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

const AdView = ({ route }) => {
    
    const { adData } = route.params;

    const category = categories.find((category) => category.text === adData.kategori);
  
    return (
      <View style={styles.container}>
        <Image 
          source={require('../../assets/vedBilde.png')}
          style={styles.image}
        />
        <View style={styles.textContainer}>

            <Text style={{ fontSize: 24, fontWeight: '500', marginBottom: 6, }}>{adData.overskrift}</Text>

            <View>
                {category && (
                    <View style={styles.categoryContainer}>
                    <Text style={styles.categoryText}>{category.text}</Text>
                    <Image source={category.icon} style={styles.icon} />
                    </View>
                )}
            </View>

          <Text style={{ fontSize: 16, fontWeight: '400', color: 'rgba(0, 0, 0, 0.76)' }}>
            {adData.beskrivelse}
          </Text>
          {/* Legg til andre elementer du vil vise fra adData */}
        </View>
      </View>
    );
  };
  
  export default AdView;
  
  const styles = StyleSheet.create({
    categoryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
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