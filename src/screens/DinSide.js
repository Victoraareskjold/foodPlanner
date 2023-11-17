import { StyleSheet, Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

import WorkCard from '../components/WorkCard';
import OngoingWorkCard from '../components/OngoingWorkCard';
import { categories } from '../components/Categories';

import buttons from '../../styles/buttons';
import colors from '../../styles/colors';
import fonts from '../../styles/fonts';
import images from '../../styles/images';
import containerStyles from '../../styles/containerStyles';

export default function DinSide() {

  const navigation = useNavigation();

  const firstSixCategories = categories.slice(0, 6);

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

            <TouchableOpacity>
              <Image 
                source={require('../../assets/user-1.png')}
                style={[images.icon48, {marginLeft: 8}]}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hva trenger du hjelp med? */}
        <View style={containerStyles.headerContainer}>

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

          {/* Se alle btn */}
          {/* <TouchableOpacity style={buttons.btn1}>
            <Text style={[fonts.btnBody, {color: '#218CC9'}]}>Se alle kategorier</Text>
          </TouchableOpacity> */}

        </View>

        {/* Pågående arbeid */}
        <View style={containerStyles.headerContainer}>

          <Text style={fonts.subHeader}>Pågående arbeid</Text>

          <View>
            <OngoingWorkCard/>
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
});
