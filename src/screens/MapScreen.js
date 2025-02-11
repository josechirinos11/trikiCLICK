import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, ActivityIndicator, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';

import ListadoJugadores from '../components/ListadoJugadores'
//import ShotsScreenBOT from './game/ShotsScreenBOT';

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
  const [jugadorSeleccionado, setJugadorSeleccionado] = useState(null);


  const [jugadorBot, setJugadorBot] = useState(false);


  const [modalListadoJugadorVisible, setModalListadoJugadorVisible] = useState(false);

  const jugadoresPrueba = ['Jugador1', 'Jugador2', 'Jugador3', 'Jugador4'];


  const setUserActiveStatus = async (isActive) => {
    const user = auth.currentUser;
    if (!user) return;

            //Asegura que user.uid siempre sea una cadena de texto
            if (!user || !user.uid || typeof user.uid !== 'string') {
              console.error("Error: user.uid no es válido", user);
              navigation.replace('Login');
              return;
            }
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

  // procesar y agregar usuario si asi lo necesitamos
  useEffect(() => {

    centerMapOnUser();

    const fetchPlayerNames = async () => {
      // Si no hay jugadores, no hacemos nada
      if (jugadores.length === 0 || !playerName) return; // Si aún no hay jugadores o playerName, no hacemos nada

      // Filtrar jugadores para eliminar al que tenga el mismo playerName
      const jugadoresActualizados = await Promise.all(
        jugadores.map(async (jugador) => {
          if (!jugador.uid) return null; // Evitar errores si no tiene UID

                  //Asegura que jugador.uid siempre sea una cadena de texto
        if (!jugador || !jugador.uid || typeof jugador.uid !== 'string') {
          console.error("Error: user.uid no es válido", jugador);
          navigation.replace('Login');
          return;
        }

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

      centerMapOnUser();
      // Actualizar el estado de jugadores
      setjugadoresGame(jugadoresSinMiNombre);
    };

    fetchPlayerNames();





  }, [jugadores, playerName]); // Dependencias: jugadores y playerName


  // centrar en el mapa la ubicación del usuario
  useEffect(() => {
    centerMapOnUser();

    // traigo el alias del jugador
    const fetchPlayerName = async () => {
      const user = auth.currentUser;
      if (!user) return;
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
      }
    };

    fetchPlayerName();
    getUserLocation();
    setUserActiveStatus(true);

    // escuchamos cambios en locations y devolver los jugadores activos
    const unsubscribe = onSnapshot(collection(db, 'locations'), async (snapshot) => {
      const rawUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const updatedUsers = await Promise.all(snapshot.docs.map(async (doc) => {
        const userData = doc.data();
        procesarJugador(userData, setjugadores);
                //Asegura que user.uid siempre sea una cadena de texto
                if (!doc || !doc.id || typeof doc.id !== 'string') {
                  console.error("Error: user.uid no es válido", doc);
                  navigation.replace('Login');
                  return;
                }
        const userConfigRef = doc(db, 'gameConfigs', doc.id);
        const configSnap = await getDoc(userConfigRef);
        return userData
      }));
      const activePlayers = updatedUsers
        .filter(user => user !== null && user.latitude && user.longitude)
        .map(user => ({
          ...user,
          playerName: user.playerName || "Desconocido",
        }));
      setUsers(activePlayers.filter(user => user.id !== auth.currentUser?.uid));
    });

    //Retornamos los jugadores activos
    const fetchPlayerNames = async () => {
      const jugadoresActualizados = await Promise.all(
        jugadores.map(async (jugador) => {
          if (!jugador.uid) return null; // ❌ Evitar errores si no tiene UID

                            //Asegura que jugador.uid siempre sea una cadena de texto
        if (!jugador || !jugador.uid || typeof jugador.uid !== 'string') {
          console.error("Error: user.uid no es válido", jugador);
          navigation.replace('Login');
          return;
        }


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
      setjugadoresGame(jugadoresActualizados.filter(jugador => jugador !== null));
    };
    fetchPlayerNames()


    return () => {
      console.log('Componente desmontado, desactivando usuario');
      rechazarSolicitudJuego();

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
      for (const doc of snapshot.docs) {
        const data = doc.data();

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
          setEsperandoRespuesta(false); // El usuario ya no está esperando una respuesta
          console.log(`🎮 AAAAAAYYYYYYUUUUUUUUDAAAAAAAAAAAAAAA `);
          if (navigation) {
            navigation.navigate('Lobby', { jugadorID: user.uid, jugadorName: playerName, jugadoresGame: jugadoresGame });

          } else {
            console.error("🚨 navigation no está definido en MapScreen");
          };

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


  // escucha de solicitudes de juego en BOT
  useEffect(() => {
    const crearSolicitud = async () => {
      const user = auth.currentUser;
      if (!user) return;

              //Asegura que user.uid siempre sea una cadena de texto
              if (!user || !user.uid || typeof user.uid !== 'string') {
                console.error("Error: user.uid no es válido", user);
                navigation.replace('Login');
                return;
              }
              

      const solicitudRef = doc(db, "gameRequests", `${user.uid}_BOT`);
          try {
        await setDoc(solicitudRef, {
          alias: playerName,
          from: user.uid,
          to: "Jugador BOT",
          status: "accepted", // Aceptada automáticamente
          timestamp: new Date(),
        });
        console.log("✅ Solicitud enviada");
      } catch (error) {
        console.error("❌ Error al enviar solicitud:", error);
      }
    };

// si es bot crear solicitud
    const crearSolicitudBOT = () => {

      const user = auth.currentUser;
      if (!user) return;

      navigation.replace('ShotsBOT');


    }

    if (jugadorBot) {
      // Lógica para jugar contra bot (sin solicitud en Firestore)
      console.log("🎮 Jugando contra bot...");
     // crearSolicitud(); // Crea la solicitud si no es contra bot
      // Iniciar juego contra bot
      crearSolicitudBOT();
    }
  }, [jugadorBot]); // El efecto se ejecuta cuando cambia jugadorBot



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

  const centerMapOnUser = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        latitudeDelta: 0.0002,
        longitudeDelta: 0.0002,

      });
      // 🔥 Forzar re-render del mapa asegurando que la lista de jugadores se actualice
      setjugadoresGame([...jugadoresGame]);
    }
  };




  // crea una solicitud de juego en Firestore entre el usuario y otro jugador
  const enviarSolicitudJuego = async (jugador, playerName) => {

if (jugadorBot) {
      console.log("🎮 Jugando contra bot...");
      return;
    }



    const user = auth.currentUser; // optenemos informacion del usuario athenticado
    if (!user) return;


            //Asegura que user.uid siempre sea una cadena de texto
            if (!user || !user.uid || typeof user.uid !== 'string') {
              console.error("Error: user.uid no es válido", user);
              navigation.replace('Login');
              return;
            }
                                        //Asegura que jugador.uid siempre sea una cadena de texto
        if (!jugador || !jugador.uid || typeof jugador.uid !== 'string') {
          console.error("Error: user.uid no es válido", jugador);
          navigation.replace('Login');
          return;
        }

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
      console.log(`🎮 AAAAAAYYYYYYUUUUUUUUDAAAAAAAAAAAAAAA boton `);
      if (navigation) {
        
    console.log("📥 jugadorName:", playerName);

    console.log("📥 jugadoresGame:", jugadoresGame);
    console.log("📥 jugadorID:", user.uid)
        navigation.navigate('Lobby', { jugadorID: user.uid, jugadorName: playerName, jugadoresGame: jugadoresGame });
      } else {
        console.error("🚨 navigation no está definido en MapScreen");
      };

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

  // Mostrar jugadores en consola
  jugadoresGame.forEach(jugador => {
    console.log(`🎮 Nombre: ${jugador.playerName} `);
  });



  const showListPlayer = () => {
    setModalListadoJugadorVisible(true);

  }


  return (
    <View style={styles.container}>
      {userLocation ? (
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

                <MaterialIcons name="emoji-people" size={20} color="blue" />
              </View>
            </Marker>
          )}

          {jugadoresGame.map((jugador) => (
            <Marker
              key={jugador.uid || jugador.id}
              coordinate={{ latitude: jugador.latitude, longitude: jugador.longitude }}
              onPress={() => setJugadorSeleccionado(jugador)}

            >


              <View style={styles.markerContainer}>

                <Text style={styles.markerText} numberOfLines={1} adjustsFontSizeToFit>
                  {jugador.playerName || jugador.id}
                </Text>

                <MaterialIcons name="emoji-people" size={20} color="red" />
              </View>
            </Marker>
          ))}


        </MapView>
      ) : (
        <ActivityIndicator size="large" color="#007AFF" />
      )}

      <TouchableOpacity style={styles.locationButton} onPress={centerMapOnUser}>
        <MaterialIcons name="my-location" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.showListPlayerStyles} onPress={showListPlayer}>
        <Text style={styles.buttonText}>Mostrar Jugadores en listado</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.showConfig} onPress={() => navigation.navigate('GameSetup')}>
        <Text style={styles.buttonText}>Configuracion</Text>
      </TouchableOpacity>

      {/* Modal para mostrar solicitud entrante */}
      <Modal visible={!!solicitudPendiente} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, styles.modalTextColor]}>📥 {solicitudPendiente?.alias} te ha enviado una solicitud de juego.</Text>

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


      {/* Modal para jugar */}
      <Modal visible={!!jugadorSeleccionado} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setJugadorSeleccionado(null)} // Cerrar al tocar fuera
        >
          <View style={styles.modalContent}>
            {jugadorSeleccionado && (
              <>
                <Text style={styles.buttonText}>¿Jugar con {jugadorSeleccionado.playerName}?</Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.botonJugarEstilo}
                    onPress={() => {
                      if (jugadorSeleccionado) {
                        enviarSolicitudJuego(jugadorSeleccionado, playerName);
                        setJugadorSeleccionado(null); // Cierra el modal después de enviar la solicitud
                      }
                    }}
                  >
                    <Text style={styles.buttonText}>Jugar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.botonJugarEstilo}
                    onPress={() => setJugadorSeleccionado(null)} // Cierra el modal sin enviar solicitud
                  >
                    <Text style={styles.buttonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>






      {/* Modal para el jugador que envió la solicitud */}
      <Modal visible={esperandoRespuesta} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={[styles.modalText, styles.modalTextColor]}>⏳ Esperando respuesta del jugador...</Text>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </View>
      </Modal>

      {/* Modal Listado de jugadores */}
      <Modal visible={modalListadoJugadorVisible} transparent animationType="fade">
        <View style={styles.modalContainerListado}>
          <View style={styles.modalContentListado}>
            <ListadoJugadores
              jugadores={jugadoresGame}
              onRegresar={() => setModalListadoJugadorVisible(false)}
              onConectar={enviarSolicitudJuego}
              setBot={setJugadorBot}
            />
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
    alignItems: "center",
    justifyContent: "center",
  },
  markerTextContainer: {
    backgroundColor: "white",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 4, // Espacio entre texto e ícono
    minWidth: 60, // Para que el nombre no se corte
    alignItems: "center",
    justifyContent: "center",
    elevation: 3, // Sombra en Android
    shadowColor: "#000", // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  markerText: {

    fontSize: 10,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  locationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#000', // Fondo negro
    borderWidth: 2,
    borderColor: '#39ff14', // Borde fluorescente (verde neón)
    padding: 12,
    borderRadius: 50,
    elevation: 5,
  },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: {
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',

  },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  acceptButton: { backgroundColor: 'green', padding: 10, borderRadius: 5, marginHorizontal: 10 },
  rejectButton: { backgroundColor: 'red', padding: 10, borderRadius: 5, marginHorizontal: 10 },

  showConfig: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#000', // Fondo negro
    borderWidth: 2,
    borderColor: '#39ff14', // Borde fluorescente (verde neón)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Bordes redondeados
  },


  showListPlayerStyles: {
    position: 'absolute',
    alignSelf: 'center',
    top: 45,
    backgroundColor: '#000', // Fondo negro
    borderWidth: 2,
    borderColor: '#39ff14', // Borde fluorescente (verde neón)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Bordes redondeados
  },
  botonJugarEstilo: {

    alignSelf: 'center',
    top: 45,
    backgroundColor: '#000', // Fondo negro
    borderWidth: 2,
    borderColor: '#39ff14', // Borde fluorescente (verde neón)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Bordes redondeados
  },
  buttonText: {
    color: '#fff', // Texto blanco
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: "row", // Poner los botones en línea horizontal
    justifyContent: "space-between", // Espaciado entre botones
    marginTop: 10,
    width: "80%",
  },
  modalContainerListado: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fondo oscuro semitransparente
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentListado: {
    width: '90%',
    height: '90%',
    backgroundColor: '#121212',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#39ff14', // Borde fluorescente (verde neón)
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30, // Bordes redondeados
  },
  modalTextColor: {
    color: '#39ff14', // Color verde fluorescente
  },

  modalText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  playButton: {
    backgroundColor: 'blue',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    marginTop: 4, // Espacio debajo del nombre
    alignItems: 'center',
  },
  playButtonText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },

});














