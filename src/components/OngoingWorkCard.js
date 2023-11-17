import { StyleSheet, Text, View, FlatList } from 'react-native'
import React from 'react'

const OngoingWorkCard = ({ jobAds }) => {
  return (
    <View>
      <FlatList
        data={jobAds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View>
            <Text>{item.title}</Text>
            <Text>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default OngoingWorkCard;

const styles = StyleSheet.create({})