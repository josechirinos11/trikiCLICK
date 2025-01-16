// src/navigation/RootNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import GameScreen from '../screens/GameScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth(); // Accede al estado de autenticación

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Game" component={GameScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
