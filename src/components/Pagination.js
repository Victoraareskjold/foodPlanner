import { StyleSheet, Animated, View } from 'react-native'
import React from 'react'
import OnboardingStyles from '../../styles/OnboardingStyles'

import colors from '../../styles/colors'

const Pagination = ({ data, activeIndex }) => {
    return (
        <View style={OnboardingStyles.dotContainer}>
            {data.map((_, idx) => {
                const color = idx === activeIndex ? colors.primary : colors.lightGrey;
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