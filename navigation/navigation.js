import { createStaticNavigation, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import RestaurantScreen from '../screens/MovieScreen';
import MovieScreen from '../screens/MovieScreen';

export default function Navigation(){
    return(
        <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Movie" component={MovieScreen} />
        </Stack.Navigator>
        </NavigationContainer>
    )
}
