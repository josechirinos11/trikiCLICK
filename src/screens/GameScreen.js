import React, { useState, useEffect, useRef } from 'react';
import { 
  Animated, 
  View, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  ImageBackground,
  Dimensions
} from 'react-native';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { startTrackingLocation } from '../services/location';
import BotonTrikiClick from '../components/BotonTrikiClick';


export default function GameScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState(null);

  const translateX = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    startTrackingLocation();
    
    const checkGameConfig = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.replace('Login');
          return;
        }


        //Asegura que user.uid siempre sea una cadena de texto
        if (!user || !user.uid || typeof user.uid !== 'string') {
          console.error("Error: user.uid no es válido", user);
          navigation.replace('Login');
          return;
        }


     
        const userConfigRef = doc(db, 'gameConfigs', user.uid);
        const configSnap = await getDoc(userConfigRef);

        if (configSnap.exists()) {
          setPlayerName(configSnap.data().playerName);
        } else {
          navigation.replace('GameSetup');
        }
      } catch (error) {
        console.error('Error al obtener configuración:', error);
      } finally {
        setLoading(false);
      }
    };

    checkGameConfig();
  }, []);

  useEffect(() => {
    const startAnimation = () => {
      translateX.setValue(screenWidth); // Reiniciar en la posición inicial

      Animated.timing(translateX, {
        toValue: -screenWidth*20, // Mover hacia la izquierda el ancho de la pantalla
        duration: 16000, // Ajusta la duración según el efecto deseado
        useNativeDriver: true,
      }).start(() => startAnimation()); // Al terminar, vuelve a empezar
    };

    startAnimation();
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
      {/* Fondo animado de nubes */}
      <Animated.View style={[styles.backgroundWrapper, { transform: [{ translateX }] }]}>
        <ImageBackground 
          source={require('../../assets/nubesVolando.png')} 
          style={styles.background}
          resizeMode="cover"
        />
        <ImageBackground 
          source={require('../../assets/nubesVolando.png')} 
          style={styles.background} 
          resizeMode="cover"
        />
      </Animated.View>

      {/* Contenido */}
      <Text style={styles.title}>Bienvenido, {playerName}!</Text>
      <Text>¡Disfruta tu partida!</Text>
      <TouchableOpacity
        style={styles.boton}
        onPress={() => navigation.navigate('Map', { playerName })}
      >
        <Text style={styles.textoBoton}>Ver Mapa</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20, 
    overflow: 'hidden' // Para que el fondo no sobresalga
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  boton: {
    backgroundColor: '#000',
    padding: 10,
    borderRadius: 30,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#39ff14', 
  },
  textoBoton: {
    color: '#FFF',
    fontSize: 18,
    textAlign: 'center',
  },
  backgroundWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '200%', // Doble del ancho de la pantalla
    height: '100%',
    flexDirection: 'row', // Para alinear las imágenes en línea
  },
  background: {
    width: '100%',
    height: '100%',
  },
});

