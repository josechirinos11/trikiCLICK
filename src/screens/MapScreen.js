import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import ClusteredMarkers from 'react-native-maps-clustering';
import { useNavigation } from '@react-navigation/native';

export default function MapScreen({ navigation }) {
  const [userLocation, setUserLocation] = useState(null);
  const [users, setUsers] = useState([]);
  const [playerName, setPlayerName] = useState('');
  const mapRef = useRef(null);
  const [jugadores, setjugadores] = useState([]);
  const [jugadoresGame, setjugadoresGame] = useState([]);
  const [solicitudPendiente, setSolicitudPendiente] = useState(null);
  const [esperandoRespuesta, setEsperandoRespuesta] = useState(false);
  const [jugadorSegundoAlias, setJugadorSegundoAlias] = useState('');
  const [juagdorSegundoData, setJuagdorSegundoData] = useState(null);


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
     // console.log("📂 Datos recibidos de Firestore:", snapshot.docs.length);

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
        //7console.log("📄 userConfigRef del usuario:", userConfigRef);
        const configSnap = await getDoc(userConfigRef);
       // console.log("📄 configSnap del usuario:", configSnap);


        return userData

        //   return {
        //    id: doc.id,
        //    latitude: userData.latitude,
        //    longitude: userData.longitude,
        //   playerName: configSnap.exists() ? configSnap.data().playerName : 'Desconocido',
        //  };
      }));

     // console.log(`✅ Jugadores sin filtros:`, updatedUsers);

      const activePlayers = updatedUsers
        .filter(user => user !== null && user.latitude && user.longitude)
        .map(user => ({
          ...user,
          playerName: user.playerName || "Desconocido",
        }));

     // console.log("🎮 Jugadores activos después del filtrado:", activePlayers);

      if (activePlayers.length === 0) {
     //   console.warn("⚠️ No hay jugadores activos después del filtrado.");
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



  // escucha de solicitudes de juego
  useEffect((jugadores) => {
    const user = auth.currentUser;
    if (!user) return;
  
    const solicitudesRef = collection(db, "gameRequests");
  
    const unsubscribe = onSnapshot(solicitudesRef, async (snapshot) => {
      let solicitudEncontrada = false;
  
      // Procesar las solicitudes de juego
      for (const doc of snapshot.docs) {
        const data = doc.data();
       // console.log("📥 Datos que se reciben de la base de datos gameRequests:  ", data);
  
        // Si la solicitud está dirigida al usuario actual y está en estado "pending"
        if (data.to === user.uid && data.status === "pending") {
          if (!solicitudPendiente || solicitudPendiente.from !== data.from) {
            console.log(`📥 Nueva solicitud de juego de ${data.alias}`);
            setSolicitudPendiente(data); // Guardamos solo si es una nueva solicitud
          }
          solicitudEncontrada = true;
        }
  
        // Si la solicitud es del usuario actual y está en estado "pending"
        if (data.from === user.uid && data.status === "pending") {
          setEsperandoRespuesta(true); // El usuario está esperando una respuesta
          solicitudEncontrada = true;
        }
  
        // Si la solicitud ya no está en estado "pending", significa que fue aceptada o rechazada
        if (data.status !== "pending" && (data.to === user.uid || data.from === user.uid)) {
        //  console.log(`🎮 jugador activo : ${jugadores} `);

        //  const jugador = jugadores.find(jugador => jugador.uid === data.from); // 🎮
         
          setEsperandoRespuesta(false); // El usuario ya no está esperando una respuesta
          navigation.navigate("LobbyScreen", { 
            jugadorID: data.from,
          });
  
          if (solicitudPendiente) {
            // Eliminar la solicitud de la base de datos
            const solicitudRef = doc(db, "gameRequests", `${solicitudPendiente.from}_${solicitudPendiente.to}`);
            try {
              await deleteDoc(solicitudRef); // Eliminamos la solicitud de la base de datos
              setSolicitudPendiente(null); // Limpiamos la solicitud pendiente
              setEsperandoRespuesta(false); // Actualizamos el estado
            } catch (error) {
              console.error("❌ Error al eliminar la solicitud:", error);
            }
          }
        }
      }
  
      // Si no se encontró ninguna solicitud activa, ponemos el estado de esperandoRespuesta a false
      if (!solicitudEncontrada) {
        setEsperandoRespuesta(false); // La solicitud fue eliminada o rechazada
      }
    });
  
    return () => unsubscribe(); // Limpiar el suscriptor cuando el componente se desmonte
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




  // crea una solicitud de juego en Firestore entre el usuario y otro jugador
  const enviarSolicitudJuego = async (jugador, playerName) => {
    const user = auth.currentUser; // optenemos informacion del usuario athenticado

    if (!user) return;

    const solicitudRef = doc(db, "gameRequests", `${user.uid}_${jugador.uid}`);
    try {
      await setDoc(solicitudRef, {
        alias: playerName,
        from: user.uid,
        to: jugador.uid,
        status: "pending",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("❌ Error al enviar solicitud:", error);
    }

  };

  // Aceptar solicitud y navegar a la partida
  const aceptarSolicitudJuego = async () => {
    const user = auth.currentUser; // optenemos informacion del usuario athenticado
    console.log("✅ aceptando solicitud de :  ", solicitudPendiente.alias);
    const solicitudRef = doc(db, "gameRequests", `${solicitudPendiente.from}_${solicitudPendiente.to}`);

    try {
      await updateDoc(solicitudRef, { status: "accepted" });

     // console.log("✅ Partida aceptada, iniciando juego...");
     // navigation.navigate("Game", { jugador1: solicitudPendiente.from, jugador2: solicitudPendiente.to });

      navigation.navigate("LobbyScreen", { 
        jugadorID: user.uid, 
      
      });

    } catch (error) {
      console.error("❌ Error al aceptar la partida:", error);
    }
  };


  // Rechazar solicitud
  const rechazarSolicitudJuego = async () => {
    if (!solicitudPendiente) return;
    const solicitudRef = doc(db, "gameRequests", `${solicitudPendiente.from}_${solicitudPendiente.to}`);
    try {
      await deleteDoc(solicitudRef);
      setSolicitudPendiente(null);
      setEsperandoRespuesta(false)
    } catch (error) {
      console.error("❌ Error al rechazar la partida:", error);
    }
  };






  jugadoresGame.forEach(jugador => {
    console.log(`🎮 Nombre: ${jugador.playerName} `);
  });


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
          <Marker
            key={jugador.uid || jugador.id}
            coordinate={{ latitude: jugador.latitude, longitude: jugador.longitude }}
            onPress={() => enviarSolicitudJuego(jugador, playerName)} // 📌 Llamar a la función al tocar el marcador
          >
            <View style={styles.markerContainer}>
              <Text style={styles.markerText} numberOfLines={1} adjustsFontSizeToFit>
                {jugador.playerName || jugador.id}
              </Text>
              <MaterialIcons name="place" size={20} color="red" />
            </View>
          </Marker>
        ))}


      </MapView>

      <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>

      {/* Modal para mostrar solicitud entrante */}
      <Modal visible={!!solicitudPendiente} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>📥 {solicitudPendiente?.alias} te ha enviado una solicitud de juego.</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.acceptButton} onPress={aceptarSolicitudJuego}>
                <Text style={styles.buttonText}>Aceptar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={rechazarSolicitudJuego}>
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal para el jugador que envió la solicitud */}
      <Modal visible={esperandoRespuesta} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>⏳ Esperando respuesta del jugador...</Text>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </View>
      </Modal>





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
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  acceptButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginHorizontal: 10 },
  rejectButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginHorizontal: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
});
