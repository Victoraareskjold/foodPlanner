import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useState, useRef } from 'react'
import React from 'react'
import OnboardingAssets from '../screens/onboarding/OnboardingAssets'
import OnboardingItem from '../screens/onboarding/OnboardingItem'
import Pagination from './Pagination'

const Slider = () => {

    const [currentIndex, setCurrentIndex] = useState(0);

    const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });

    const onViewRef = useRef(({ viewableItems }) => {
        setCurrentIndex(viewableItems[0].index);
    });

    const sliderRef = React.useRef(null);

    const data = OnboardingAssets;

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (currentIndex < data.length - 1) {
                sliderRef.current.scrollToIndex({ index: currentIndex + 1 });
                setCurrentIndex(currentIndex + 1);
            } else {
                sliderRef.current.scrollToIndex({ index: 0 });
                setCurrentIndex(0);
            }
        }, 8000);  // Tid i millisekunder. For øyeblikket vil det scrolle hvert 10. sekund.

        return () => clearTimeout(timer);  // Rens opp timeren ved unmount for å forhindre minnelekkasjer.
    }, [currentIndex]);


  return (
    <View>
        <FlatList 
            ref={sliderRef}
            style={{ width: '100%' }}
            data={data}
            renderItem={({item}) => <OnboardingItem item={item}/>}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment='center'
            onViewableItemsChanged={onViewRef.current}
            viewabilityConfig={viewConfigRef.current}
        />

        <Pagination data={data} activeIndex={currentIndex} />
    </View>
  )
}

export default Slider

const styles = StyleSheet.create({})