import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { auth, db } from '../services/firebase'; // Asegúrate de importar Firestore
import { doc, setDoc } from 'firebase/firestore';

export default function GameSetupScreen({ navigation }) {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('normal');
  const [loading, setLoading] = useState(false);

  const handleSaveConfig = async () => {
    if (!playerName) {
      Alert.alert('Error', 'Por favor, ingresa tu nombre.');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      const userConfigRef = doc(db, 'gameConfigs', user.uid);
      await setDoc(userConfigRef, { playerName, difficulty });

      Alert.alert('Configuración guardada', '¡Ya puedes jugar!');
      navigation.replace('Game'); // Redirige al juego
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurar Juego</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu Nombre"
        value={playerName}
        onChangeText={setPlayerName}
      />

      <Button title={loading ? 'Guardando...' : 'Guardar y Jugar'} onPress={handleSaveConfig} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
});
