import { StyleSheet, Text, View, SafeAreaView, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

import WorkCard from '../components/WorkCard';

import containerStyles from '../../styles/containerStyles';
import placeholderStyles from '../../styles/placeholderStyles';
import buttons from '../../styles/buttons';
import fonts from '../../styles/fonts';
import { categories } from '../components/Categories';

export default function CreateAd({ route }) {

  const navigation = useNavigation();

  return (
      <View style={{ backgroundColor: '#FFF', flex: 1 }}>
        <SafeAreaView/>
          <ScrollView>

            <View style={containerStyles.headerContainer}>

              {/* cards */}
              <View style={styles.cardGrid}>
                {categories.map((category) => (
                  <WorkCard
                    key={category.id}
                    color={category.color}
                    icon={category.icon}
                    text={category.text}
                />
                ))}
              </View>

            </View>

          </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({})