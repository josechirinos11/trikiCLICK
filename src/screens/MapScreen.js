import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import ClusteredMarkers from 'react-native-maps-clustering';

export default function MapScreen() {
  const [userLocation, setUserLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const mapRef = useRef(null);
  const [jugadores, setjugadores] = useState([]);
  const [jugadoresGame, setjugadoresGame] = useState([]);

  const setUserActiveStatus = async (isActive) => {
    const user = auth.currentUser;
    if (!user) return;
    const userRef = doc(db, 'locations', user.uid);
    try {
      await updateDoc(userRef, { activo: isActive });
    } catch (error) {
      console.error("Error actualizando estado del usuario:", error);
    }
  };


  // procesar y agregar usuario si asi lo necesitamos
  const procesarJugador = (userData, setJugadores) => {
    if (!userData || typeof userData !== "object") return; // ❌ Datos inválidos
    if (!userData.uid || typeof userData.uid !== "string") return; // ❌ Sin UID, descartar
    if (userData.activo !== true) return; // ❌ No está activo, descartar

    setJugadores(prevJugadores => {
      const existe = prevJugadores.some(jugador => jugador.uid === userData.uid);

      return existe ? prevJugadores : [...prevJugadores, userData]; // 🔹 Agregar solo si no existe
    });
  };


  useEffect(() => {
    const fetchPlayerNames = async () => {
      // Si no hay jugadores, no hacemos nada
      if (jugadores.length === 0) return;
  
      // Filtrar jugadores para eliminar al que tenga el mismo playerName
      const jugadoresActualizados = await Promise.all(
        jugadores.map(async (jugador) => {
          if (!jugador.uid) return null; // Evitar errores si no tiene UID
  
          const userConfigRef = doc(db, 'gameConfigs', jugador.uid);
          const configSnap = await getDoc(userConfigRef);
  
          if (configSnap.exists()) {
            return {
              ...jugador,
              playerName: configSnap.data().playerName, // Agregar playerName
            };
          }
          return { ...jugador, playerName: "Desconocido" }; // Si no existe, nombre por defecto
        })
      );
  
      // Filtrar jugadores válidos (evitar `null`) y eliminar el jugador con playerName igual al del usuario actual
      const jugadoresSinMiNombre = jugadoresActualizados.filter(jugador => jugador !== null && jugador.playerName !== playerName);
  
      // Actualizar el estado de jugadores
      setjugadoresGame(jugadoresSinMiNombre);
    };
  
    fetchPlayerNames();
  }, [jugadores, playerName]); // Dependencias: jugadores y playerName
  
  

  useEffect(() => {
    const fetchPlayerName = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const userConfigRef = doc(db, 'gameConfigs', user.uid);
      const configSnap = await getDoc(userConfigRef);
      if (configSnap.exists()) {
        setPlayerName(configSnap.data().playerName);
      }
    };

    fetchPlayerName();

    const getUserLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const locationSubscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High },
        (location) => {
          setUserLocation(location.coords);
        }
      );
      return () => locationSubscription.remove();
    };

    getUserLocation();
    setUserActiveStatus(true);

    const unsubscribe = onSnapshot(collection(db, 'locations'), async (snapshot) => {
      console.log("📂 Datos recibidos de Firestore:", snapshot.docs.length);

      const rawUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      //console.log("👥 Usuarios crudos:", rawUsers);

      const updatedUsers = await Promise.all(snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        // console.log("👤 Procesando usuario:", userData);
        procesarJugador(userData, setjugadores);

        //   if (!userData.activo) {
        //    console.log("🚫 Usuario inactivo:", userData.id);
        //    return null;
        //   }

        const userConfigRef = doc(db, 'gameConfigs', doc.id);
        console.log("📄 userConfigRef del usuario:", userConfigRef);
        const configSnap = await getDoc(userConfigRef);
        console.log("📄 configSnap del usuario:", configSnap);


        return userData

        //   return {
        //    id: doc.id,
        //    latitude: userData.latitude,
        //    longitude: userData.longitude,
        //   playerName: configSnap.exists() ? configSnap.data().playerName : 'Desconocido',
        //  };
      }));

      console.log(`✅ Jugadores sin filtros:`, updatedUsers);

      const activePlayers = updatedUsers
        .filter(user => user !== null && user.latitude && user.longitude)
        .map(user => ({
          ...user,
          playerName: user.playerName || "Desconocido",
        }));

      console.log("🎮 Jugadores activos después del filtrado:", activePlayers);

      if (activePlayers.length === 0) {
        console.warn("⚠️ No hay jugadores activos después del filtrado.");
      }

      //setUsers(activePlayers);
      setUsers(activePlayers.filter(user => user.id !== auth.currentUser?.uid));

    });

    const fetchPlayerNames = async () => {
      //if (jugadores.length === 0) return; // Si no hay jugadores, no hacemos nada

      const jugadoresActualizados = await Promise.all(
        jugadores.map(async (jugador) => {
          if (!jugador.uid) return null; // ❌ Evitar errores si no tiene UID

          const userConfigRef = doc(db, 'gameConfigs', jugador.uid);
          const configSnap = await getDoc(userConfigRef);

          if (configSnap.exists()) {
            return {
              ...jugador,
              playerName: configSnap.data().playerName, // ✅ Agregar playerName
            };
          }
          return { ...jugador, playerName: "Desconocido" }; // 🔹 Si no existe, nombre por defecto
        })
      );

      // Filtrar jugadores válidos (evitar `null`)
      setjugadoresGame(jugadoresActualizados.filter(jugador => jugador !== null));
    };

    fetchPlayerNames()







    return () => {
      console.log('Componente desmontado, desactivando usuario');
      setUserActiveStatus(false);
      unsubscribe();
    };
  }, []);

  const centerMapOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0002,
        longitudeDelta: 0.0002,

      });
    }
  };

  console.log("🔥 Lista de jugadores activos antes del render:");
  jugadores.forEach(jugador => {
    console.log(`🎮 UID: ${jugador.uid} | Activo: ${jugador.activo}`);
  });
  // console.log(`🎮 jugadores por PlayerName y sus acciones: ${JSON.stringify(jugadoresGame, null, 2)}`);
  //console.log(`🎮 jugadores por PlayerName y sus acciones: ${jugadoresGame}`);
  //console.log(`🎮 jugador portador del celular: ${user.id}`);
  jugadoresGame.forEach(jugador => {
    console.log(`🎮 Nombre: ${jugador.playerName} `);
  });

 // console.log("📄 arreglojugadores:", jugadoresGame );

  // console.log(`🎮 jugadores por PlayerName: ${JSON.stringify(jugadoresGame.map(jugador => jugador.playerName), null, 2)}`);
  //console.log(`🎮 usuarios: ${} `);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: userLocation ? userLocation.latitude : 0,
          longitude: userLocation ? userLocation.longitude : 0,
          latitudeDelta: 0.0010,
          longitudeDelta: 0.0010,
        }}
        region={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0010,
          longitudeDelta: 0.0010,
        } : null}

      >
        {userLocation && (
          <Marker coordinate={userLocation}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText} numberOfLines={1} adjustsFontSizeToFit>
                {playerName || "Mi Ubicación"}
              </Text>
              <MaterialIcons name="place" size={20} color="blue" />
            </View>
          </Marker>
        )}

        {jugadoresGame.map((jugador) => (
          <Marker key={jugador.uid || jugador.id} coordinate={{ latitude: jugador.latitude, longitude: jugador.longitude }}>
            <View style={styles.markerContainer}>
              <Text style={styles.markerText} numberOfLines={1} adjustsFontSizeToFit>
                {jugador.playerName || jugador.id} {/* ✅ Muestra el UID si existe, si no, usa el ID */}
              </Text>
              <MaterialIcons name="place" size={20} color="red" />
            </View>
          </Marker>
        ))}

      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 2,
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
});
