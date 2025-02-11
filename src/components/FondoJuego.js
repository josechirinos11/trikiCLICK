import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Animated, Easing, ImageBackground, Image } from 'react-native';

const FondoJuego = () => {
  const animatedBackground = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedBackground, {
        toValue: -Dimensions.get('window').width,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fondo con la ruta corregida */}
      <ImageBackground 
        source={require('../../assets/fondo.webp')} 
        style={styles.backgroundImage} 
        resizeMode="cover"
      >
        {/* Logo con la ruta corregida */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/logoTrikiclick.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          {/* Aquí va el contenido del formulario de inicio de sesión */}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FondoJuego;
