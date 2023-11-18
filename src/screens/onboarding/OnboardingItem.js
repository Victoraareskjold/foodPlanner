import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'
import OnboardingStyles from '../../../styles/OnboardingStyles'

const OnboardingItem = ({item}) => {
  return (
    <View style={OnboardingStyles.sectionContainer}>

        <View style={OnboardingStyles.contentContainer}>
            <Image 
                source={item.image} 
                resizeMode='contain' 
                style={OnboardingStyles.heroImage}
            />
            {/* <Lottie style={OnboardingStyles.heroImage} autoPlay loop source={require('../../../assets/animations/milhøvennlig.json')}/> */}

            <Text style={[OnboardingStyles.subHeader, {marginBottom: 12}]}>{item.title}</Text>
            <Text style={OnboardingStyles.body}>{item.description}</Text>
        </View>

    </View>
  )
}

export default OnboardingItem

const styles = StyleSheet.create({})