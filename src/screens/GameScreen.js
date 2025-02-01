import React, { useState, useEffect } from 'react';
import { Button, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { startTrackingLocation } from '../services/location';

export default function GameScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState(null);

  useEffect(() => {
    startTrackingLocation();
    const checkGameConfig = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.replace('Login'); // Si el usuario no está autenticado, redirigir a Login
          return;
        }

        const userConfigRef = doc(db, 'gameConfigs', user.uid);
        const configSnap = await getDoc(userConfigRef);

        if (configSnap.exists()) {
          setPlayerName(configSnap.data().playerName); // Guardar el nombre del jugador
        } else {
          navigation.replace('GameSetup'); // Redirigir a configuración si no existe
        }
      } catch (error) {
        console.error('Error al obtener configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    checkGameConfig();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido, {playerName}!</Text>
      <Text>¡Disfruta tu partida!</Text>
      <Button
        title="Ver Mapa"
        onPress={() => navigation.navigate('Map', { playerName })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
