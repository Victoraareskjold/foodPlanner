import { StyleSheet, Animated, View } from 'react-native'
import React from 'react'
import OnboardingStyles from '../../styles/OnboardingStyles'

import Colors from '../../styles/Colors'

const Pagination = ({ data, activeIndex }) => {
    return (
        <View style={OnboardingStyles.dotContainer}>
            {data.map((_, idx) => {
                const color = idx === activeIndex ? Colors.primary : Colors.lightGrey;
                return (
                    <View 
                        key={idx.toString()} 
                        style={[OnboardingStyles.dot, { backgroundColor: color }]}
                    />
                );
            })}
        </View>
    );
}


export default Pagination

const styles = StyleSheet.create({})