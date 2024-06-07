import React, { useState, useEffect } from "react";
import { Text, Touchable } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";

import Ionicons from "react-native-vector-icons/Ionicons";

/* Screens */
import Home from "../screens/Home";

import ShoppingList from "../screens/ShoppingList";

import Recipes from "../screens/Recipes";
import CreateRecipe from "../screens/CreateRecipe";
import SelectCategory from "../screens/SelectCategory";

import Onboarding from "../screens/onboarding/Onboarding";

import Login from "../screens/onboarding/Login";
import SetupName from "../screens/onboarding/SetupName";
import SignUp from "../screens/onboarding/SignUp";

import WeeklyMenu from "../screens/WeeklyMenu";
import AddMeal from "../screens/AddMeal";

import Profile from "../screens/Profile";

import RecipeCategoryScreen from "../screens/RecipeCategoryScreen";
import { TouchableOpacity } from "react-native-web";

/* Tab bottom */
const Tab = createBottomTabNavigator();

function TabGroup() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
        tabBarStyle: {},
        tabBarIcon: ({ color, focused, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "RecipeStackGroup") {
            iconName = focused ? "receipt" : "receipt-outline";
          } else if (route.name === "ShoppingListStackGroup") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "WeeklyMenuStackGroup") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "ProfileStackGroup") {
            iconName = focused ? "person" : "person-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2984FF",
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={Home}
        options={{ tabBarLabel: "Hjem" }}
      />
      <Tab.Screen
        name="RecipeStackGroup"
        component={RecipeStackGroup}
        options={{ tabBarLabel: "Oppskrifter" }}
      />
      <Tab.Screen
        name="WeeklyMenuStackGroup"
        component={WeeklyMenuStackGroup}
        options={{ tabBarLabel: "Ukes meny" }}
      />
      <Tab.Screen
        name="ShoppingListStackGroup"
        component={ShoppingListStackGroup}
        options={{ tabBarLabel: "Handleliste" }}
      />
      <Tab.Screen
        name="ProfileStackGroup"
        component={ProfileStackGroup}
        options={{ tabBarLabel: "Din profil" }}
      />
    </Tab.Navigator>
  );
}

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
        name="Login"
        component={Login}
      />
      <LoginStack.Screen
        options={{ headerShown: false }}
        name="SetupName"
        component={SetupName}
      />
      <LoginStack.Screen
        options={{ headerShown: false }}
        name="SignUp"
        component={SignUp}
      />

      <LoginStack.Screen
        options={{ headerShown: false }}
        name="HomeStack"
        component={HomeStackGroup}
      />
    </LoginStack.Navigator>
  );
}

const HomeStack = createNativeStackNavigator();

function HomeStackGroup() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        options={{ headerShown: false }}
        name="HomeStack"
        component={TabGroup}
      />
    </HomeStack.Navigator>
  );
}

const ShoppingListStack = createNativeStackNavigator();

function ShoppingListStackGroup() {
  return (
    <ShoppingListStack.Navigator>
      <ShoppingListStack.Screen
        options={{ headerShown: false }}
        name="ShoppingList"
        component={ShoppingList}
      />
    </ShoppingListStack.Navigator>
  );
}

const RecipeStack = createNativeStackNavigator();

function RecipeStackGroup() {
  return (
    <RecipeStack.Navigator>
      <RecipeStack.Screen
        options={{ headerShown: false }}
        name="Recipes"
        component={Recipes}
      />
      <RecipeStack.Screen
        options={{ headerShown: false }}
        name="CreateRecipe"
        component={CreateRecipe}
      />
      <RecipeStack.Screen
        options={{ headerShown: false }}
        name="SelectCategory"
        component={SelectCategory}
      />
      <RecipeStack.Screen
        name="RecipeCategoryScreen"
        component={RecipeCategoryScreen}
        options={{ headerShown: false }}
      />
    </RecipeStack.Navigator>
  );
}

const WeeklyMenuStack = createNativeStackNavigator();

function WeeklyMenuStackGroup() {
  return (
    <WeeklyMenuStack.Navigator>
      <WeeklyMenuStack.Screen
        options={{ headerShown: false }}
        name="WeeklyMenu"
        component={WeeklyMenu}
      />
      <WeeklyMenuStack.Screen
        options={{
          headerShown: false,
        }}
        name="AddMeal"
        component={AddMeal}
      />
    </WeeklyMenuStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();

function ProfileStackGroup() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        options={{ headerShown: false }}
        name="Profile"
        component={Profile}
      />
    </ProfileStack.Navigator>
  );
}

/* Main Navigation Container */
export default function Navigation() {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsUserLoggedIn(!!user);
    });

    return () => unsubscribe(); // Rengjøringsfunksjon for å avbryte lytteren
  }, []);

  return (
    <NavigationContainer>
      {isUserLoggedIn ? <HomeStackGroup /> : <LoginStackGroup />}
    </NavigationContainer>
  );
}
