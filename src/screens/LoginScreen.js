import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Animated, ImageBackground, Image } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Animaciones
  const scale = useState(new Animated.Value(1))[0];  // Para el zoom (escala)
  const translateY = useState(new Animated.Value(0))[0];  // Para el movimiento vertical
  const logoOpacity = useState(new Animated.Value(0))[0];  // Para la animación de opacidad del logo
  const logoTranslateY = useState(new Animated.Value(20))[0];  // Movimiento vertical del logo
  const rotate = useState(new Animated.Value(0))[0]; // Animación de rotación


  useEffect(() => {
  // Animación de rotación


    // Animación del logo (fade-in y desplazamiento)
    const animateLogo = () => {
      Animated.sequence([
        Animated.timing(logoOpacity, {
          toValue: 1, // Aparece el logo
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0, // Se desplaza el logo a su posición original
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 20, // Desplaza el logo hacia abajo
          duration: 1500,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Comienza las animaciones en bucle
    const animationLoop = () => {
   
      animateLogo()  // Llamamos a la animación de movimiento hacia arriba y abajo
      setTimeout(animationLoop, 3500); // Repite cada 6 segundos
    };

    animationLoop();
    animateLogo();  // Iniciar la animación del logo
   

  }, [scale, translateY, logoOpacity, logoTranslateY]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    try {
      // Autenticación con Firebase
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('¡Éxito!', 'Inicio de sesión exitoso.');
    } catch (error) {
      // Mostrar mensaje de error
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../../assets/fondo.webp')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        {/* Formulario con animaciones aplicadas */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Inicia Sesión</Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Button title={loading ? 'Cargando...' : 'Iniciar Sesión'} onPress={handleLogin} disabled={loading} />

          <Text style={styles.loginText} onPress={() => navigation.navigate('Register')}>
            ¿No tienes cuenta? Regístrate
          </Text>
        </View>

        {/* Logo animado */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,  // Animación de opacidad
              transform: [{ translateY: logoTranslateY }],  // Animación de movimiento
            }
          ]}
        >
          <Image
            source={require('../../assets/logoTrikiclick.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
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
  formContainer: {
    width: '100%',
    maxWidth: 400, // Opcional: limita el ancho de la forma
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fondo semitransparente para el formulario
    borderRadius: 10,
    alignItems: 'center',
    zIndex: 1,  // Asegura que el formulario esté por encima del fondo
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  loginText: {
    marginTop: 30,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  logo: {
    width: 100,  // Tamaño pequeño para el logo
    height: 100,  // Tamaño pequeño para el logo
  },
});
