import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GameScreen from '../screens/GameScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import { useAuth } from '../contexts/AuthContext';
import MapScreen from '../screens/MapScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="Game" component={GameScreen} />
            <Stack.Screen name="GameSetup" component={GameSetupScreen} />
            <Stack.Screen name="Map" component={MapScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
