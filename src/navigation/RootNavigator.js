import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import GameScreen from '../screens/GameScreen';
import GameSetupScreen from '../screens/GameSetupScreen';
import { useAuth } from '../contexts/AuthContext';
import MapScreen from '../screens/MapScreen';
import LobbyScreen from '../screens/LobbyScreen';
import ShotsScreen from '../screens/game/ShotsScreen';
import SalaScreen from '../screens/SalaScreen';

const Stack = createNativeStackNavigator();

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
            <Stack.Screen name="Lobby" component={LobbyScreen} />
            <Stack.Screen name="Shots" component={ShotsScreen} />
            <Stack.Screen name="Sala" component={SalaScreen} />
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
