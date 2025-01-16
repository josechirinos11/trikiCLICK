// src/screens/GameScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function GameScreen() {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>¡Bienvenido al juego!</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
