import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

/* Screens */
import DinSide from '../screens/DinSide';
import CreateAd from '../screens/CreateAd';
import AllCategories from '../screens/AllCategories';

import Onboarding from '../screens/onboarding/Onboarding';
import SetupName from '../screens/onboarding/SetupName';
import CreateUser from '../screens/onboarding/CreateUser';

/* Tab bottom */
/* const Tab = createBottomTabNavigator();

function TabGroup() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        tabBarStyle: {},
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name === "HomeStackGroup") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "KvitteringStackGroup") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "ShareStackGroup") {
            iconName = focused ? "person-add" : "person-add-outline";
          } else if (route.name === "Innstillinger") {
            iconName = focused ? "settings-sharp" : "settings-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2984FF",
      })}
    >
      <Tab.Screen name="HomeStackGroup" component={HomeStackGroup} options={{ tabBarLabel: "Hjem" }} />
      <Tab.Screen name="KvitteringStackGroup" component={KvitteringStackGroup} options={{ tabBarLabel: "Kvitteringer" }} />
      <Tab.Screen name="ShareStackGroup" component={ShareStackGroup} options={{ tabBarLabel: "Del kvittering" }} />
      <Tab.Screen name="Innstillinger" component={SettingsStackGroup} />
    </Tab.Navigator>
  );
} */

/* LoginStack view receipt */
const LoginStack = createNativeStackNavigator();

function LoginStackGroup() {
  return (
    <LoginStack.Navigator>
      
      <LoginStack.Screen
        options={{ headerShown: false }}
        name="Onboarding"
        component={Onboarding}
      />

      <LoginStack.Screen 
        options={{ headerShown: false }}
        name="SetupName" 
        component={SetupName} 
      />

      <LoginStack.Screen 
        options={{ headerShown: false }}
        name="CreateUser"
        component={CreateUser}
      />

      <LoginStack.Screen 
        options={{ headerShown: false }}
        name="DinSideStack"
        component={DinSideStackGroup}  // Correct reference to DinSideStackGroup
      />

    </LoginStack.Navigator>
  );
}

const DinSideStack = createNativeStackNavigator();

function DinSideStackGroup() {
  return (
    <DinSideStack.Navigator>
      <DinSideStack.Screen
        options={{ headerShown: false }}
        name="DinSide"
        component={DinSide}
      />

      <DinSideStack.Screen 
          options={{ 
              headerShown: true,
              headerTitle: 'Opprett annonse'
          }}
          name="CreateAd"
          component={CreateAd}
      />

      <DinSideStack.Screen 
          options={{ 
              headerShown: true,
              headerTitle: 'Alle kategorier'
          }}
          name="AllCategories"
          component={AllCategories}
      />

    </DinSideStack.Navigator>
  );
}

/* Main Navigation Container */
export default function Navigation() {
  return (
    <NavigationContainer>
        <LoginStackGroup />
    </NavigationContainer>
  );
}