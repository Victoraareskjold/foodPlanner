import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

/* Screens */
import DinSide from '../screens/DinSide';
import CreateAd from '../screens/CreateAd';
import AllCategories from '../screens/AllCategories';

const Stack = createNativeStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen
          options={{ headerShown: false }}
          name="DinSide"
          component={DinSide}
        />

        <Stack.Screen 
            options={{ 
                headerShown: true,
                headerTitle: 'Opprett annonse'
            }}
            name="CreateAd"
            component={CreateAd}
        />

        <Stack.Screen 
            options={{ 
                headerShown: true,
                headerTitle: 'Alle kategorier'
            }}
            name="AllCategories"
            component={AllCategories}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
