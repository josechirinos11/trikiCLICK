import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ImageBackground } from 'react-native';
import { auth, db } from '../services/firebase'; // Asegúrate de importar Firestore
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext'; // Importa el contexto de autenticación

export default function GameSetupScreen({ navigation }) {
  const [playerName, setPlayerName] = useState('');
  const [difficulty, setDifficulty] = useState('normal');
  const [loading, setLoading] = useState(false);

  const { logout } = useAuth(); // Extrae la función logout del contexto

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

  const handleLogout = async () => {
    await logout(); // Llama la función logout del contexto
    Alert.alert('Sesión cerrada', 'Has cerrado sesión con éxito.');
   // navigation.replace('Login'); // Redirige a la pantalla de Login o a donde quieras
    
  };

  return (
        <ImageBackground 
          source={require('../../assets/nubes.png')} 
          style={styles.background}
          resizeMode="cover"
        >
    <View style={styles.container}>
        <View style={styles.formContainer}>
      <Text style={styles.title}>Configurar Juego</Text>

      <TextInput
        style={styles.input}
        placeholder="Tu Nombre"
        value={playerName}
        onChangeText={setPlayerName}
      />

      {/* Contenedor para los botones */}
      <View style={styles.buttonContainer}>
        <Button 
          title={loading ? 'Guardando...' : 'Guardar y Jugar'} 
          onPress={handleSaveConfig} 
          disabled={loading} 
        />

        <View style={styles.logoutButtonContainer}>
          <Button 
            title="Log Out" 
            onPress={handleLogout} 
          />
        </View>
      </View>
      </View>
    </View>
       </ImageBackground>
  );
}

const styles = StyleSheet.create({
 
  container: {
    flex: 1,  // Asegura que el contenedor ocupe todo el espacio disponible
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'transparent', // Asegura que el fondo sea transparente para que se vea la imagen de fondo
  },
  formContainer: {
    width: '100%',
    maxWidth: 400, // Opcional: limita el ancho de la forma
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente para el formulario
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1,  // Asegura que el formulario esté por encima del fondo
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 15, paddingHorizontal: 10 },
  
  // Estilo del contenedor de los botones
  buttonContainer: {
    width: '100%', // Ocupa el ancho completo
    justifyContent: 'space-between', // Asegura que los botones estén bien distribuidos
    marginTop: 20,
  },

  // Estilo específico para los botones
  logoutButtonContainer: {
    marginTop: 10, // Separa el botón de logout del principal
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});
