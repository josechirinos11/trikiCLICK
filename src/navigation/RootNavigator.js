import React from 'react';
import { View, Button, TouchableOpacity, Text } from 'react-native';

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
import ShotsScreenBOT from '../screens/game/ShotsScreenBOT';

const Stack = createNativeStackNavigator();
const mostrar = false;

export default function RootNavigator() {
  const { user } = useAuth() || {};


  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ headerShown: mostrar }}

            />
            <Stack.Screen
              name="GameSetup"
              component={GameSetupScreen}
              options={{
                title: 'Configuración de Juego',
                headerShown: true,
                headerStyle: {
                  backgroundColor: '#000',
                },
                headerTintColor: '#FFF',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: 'bold',
                  textAlign: 'center',
                },
                animation: 'slide_from_right',
                gestureEnabled: true,
                headerRight: () => (
                  <TouchableOpacity
                    onPress={() => alert('Información')}
                    style={{
                      backgroundColor: '#000', // Fondo negro
                      borderWidth: 2,
                      borderColor: '#39ff14', // Borde verde neón
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      borderRadius: 5,
                      marginRight: 10,
                    }}
                  >
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Reset</Text>
                  </TouchableOpacity>
                ),
              }}
            />

            <Stack.Screen
              name="Map"
              component={MapScreen}
              options={{ headerShown: mostrar }}

            />
            <Stack.Screen
              name="Lobby"
              component={LobbyScreen}
              options={{ headerShown: mostrar }}

            />
            <Stack.Screen
              name="Shots"
              component={ShotsScreen}
              options={{ headerShown: mostrar }}
            />
            <Stack.Screen
              name="ShotsBOT"
              component={ShotsScreenBOT}
              options={{ headerShown: mostrar }}
            />

            <Stack.Screen
              name="Sala"
              component={SalaScreen}
              options={{ headerShown: mostrar }}

            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{
                headerShown: false,  // Ocultar el header si no lo necesitas
                animation: 'slide_from_right', // Animación para la transición
                gestureEnabled: true, // Permite la navegación con gestos
              }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{
                headerShown: false,  // Ocultar el header si no lo necesitas
                animation: 'slide_from_left',  // Animación para la transición (aparece desvanecida)
                gestureEnabled: true,  // Permite la navegación con gestos
              }}
            />

          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
