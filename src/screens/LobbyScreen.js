import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Alert, TouchableOpacity } from 'react-native';
import { Client } from 'colyseus.js';
import { useGameContext } from '../contexts/GameContext';
import { useNavigation } from '@react-navigation/native';
import { collection, onSnapshot, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
//const LOBBY_SERVER = 'wss://trikiclickbackend.onrender.com';
const LOBBY_SERVER = 'ws://192.168.1.132:2567'; // Usa ws:// para WebSocket

export default function LobbyScreen({ navigation, route }) {
  const { clientContext, setClientContext, roomContext, setRoomContext } = useGameContext();
  const { jugadorID, jugadorName, jugadoresGame } = route.params || {}; // Evita error si params es undefined
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState({});
  const [playersDB, setPlayersDB] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [creator, setCreator] = useState(null);
  const [creatorDB, setCreatorDB] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  //console.log("id del jugador >>>>>>>   :    ", jugadorID);

  //const navigation = useNavigation();

  // funcion para traer los nombres de los jugadores
  const fetchPlayerNames = async (playersData) => {
    if (!playersData) return;

    try {
      const updatedPlayers = { ...playersDB }; // Mantener jugadores ya obtenidos

      for (const playerID of Object.keys(playersData)) {
        const playerFirestoreID = playersData[playerID].playerName; // ID en Firestore

        const docRef = doc(db, 'gameConfigs', playerFirestoreID); // Buscar con playerName
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const playerData = docSnap.data();
          console.log(`Jugador encontrado en Firestore: ${playerData.playerName}`);

          updatedPlayers[playerID] = { playerName: playerData.playerName, ready: false };

          // Si este jugador es el mismo que se unió primero (jugadorID), entonces es el creador
          if (playerFirestoreID === jugadorID) {
            setCreatorDB(playerData.playerName);
          }
        } else {
          console.log(`No se encontró en Firestore el jugador con ID: ${playerFirestoreID}`);
        }
      }

      setPlayersDB(updatedPlayers);
      

    } catch (error) {
      console.error("Error obteniendo los jugadores desde Firestore:", error);
    }
  };




  const clientRef = useRef(null);

  useEffect(() => {

    console.log("📥 jugadorName:", jugadorName);

        console.log("📥 jugadoresGame:", jugadoresGame);
        console.log("📥 jugadorID:", jugadorID);


    if (room) return;
    console.log("id del jugador dentro del useffect >>>>>>>   :    ", jugadorID);

    // clientRef.current = new Client(LOBBY_SERVER);
    const client = new Client(LOBBY_SERVER);
    setClientContext(client);

    client.joinOrCreate('game', { playerName: jugadorID }).then(roomInstance => {
      console.log("✅ Conectado a la sala correctamente");
      console.log(`🎮 jugador activo desde cliente : ${jugadorID} `)
      setRoom(roomInstance);
      setRoomContext(roomInstance);
      setIsInRoom(true);

      // ✅ Removemos listeners duplicados
      // roomInstance.removeAllListeners('players');
      // roomInstance.removeAllListeners('chat');

      // ✅ Recibir lista de jugadores
      roomInstance.onMessage('players', async (playersData) => {
        // traer nombre de los jugadores
        fetchPlayerNames(playersData);

        console.log("📥 LISTADO de Jugadores recibidos del servidor:", playersData);
        setPlayers({ ...playersData });
        setCreator((prevCreator) => {
          const firstPlayer = Object.values(playersData)[0]?.playerName || null;
          return firstPlayer; // Siempre actualiza el creador correctamente
        });
        console.log("Creador de la sala:", creator);
      });

      // ✅ Ahora sí recibimos `update_ready`
      roomInstance.onMessage('update_ready', (data) => {
        console.log("📥 Jugadores actualizados:", data);
        setPlayers(data);
      });

      // ✅ Recibir mensajes de chat
      // Cuando recibes un mensaje de chat, agregas el playerName al mensaje.
      roomInstance.onMessage('chat', msg => {
        jugadorName, jugadoresGame
        console.log("📥 jugadorName:", jugadorName);

        console.log("📥 jugadoresGame:", jugadoresGame);
        const player = playersDB[msg.sender]; // Busca al jugador usando el ID del jugador en playersDB
        console.log("📥 Mensaje de chat:", player);
        const playerName = player //? player.playerName : msg.sender; // Si el jugador no está en playersDB, usa el sender como fallback
  
  
        setChatMessages(prev => [
          ...prev,
          {
            sender: playerName, // Nombre del jugador
            text: msg.text, // Texto del mensaje
         
          }
        ]);
      });

 

      // ✅ Recibir señal para empezar el juego
      roomInstance.onMessage('start_game', () => {
        navigation.navigate('Shots', { 
          jugadorID: jugadorID,
          room: room,  // Pasa la referencia de la sala
          players: players // Pasa la lista de jugadores
        });
      });
      

      roomInstance.onMessage('heartbeat', () => console.log("💓 Latido recibido"));

      roomInstance.onError((code, message) => {
        console.error(`❌ Error en la sala: Código ${code} - Mensaje: ${message}`);
        Alert.alert("Error en la sala", `Código: ${code}, Mensaje: ${message || 'No especificado'}`);
      });
    }).catch(err => {
      console.error("❌ Error al unirse a la sala:", err);
      Alert.alert("Error", "No se pudo conectar a la sala. Por favor, inténtalo de nuevo más tarde.");
    });

    return () => {
      if (room) {
        room.leave();
        setIsInRoom(false);
      }
    };
  }, [room, jugadorID]);

  const toggleReady = () => {
    if (room) {
      const newReadyState = !isReady;
      setIsReady(newReadyState);
      console.log(`📤 Enviando "player_ready" - Nombre: ${jugadorID}, Ready: ${newReadyState}`);
      room.send("player_ready", { playerName: jugadorID, ready: newReadyState });
    } else {
      console.error("❌ No se pudo enviar el mensaje, la sala no está disponible.");
    }
  };

  const sendMessage = () => {
    if (room && message.trim()) {
      room.send('message', { text: message });
      console.log(`📤 Enviando mensaje: ${message}`);
      setMessage('');
    } else {
      Alert.alert("Error", "El mensaje no puede estar vacío.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Salón de Juegos</Text>

      <Text style={styles.subtitle}>TU eres: {creatorDB || "Esperando..."}</Text>
      <FlatList
        data={Object.keys(players).map(playerID => ({
          id: playerID,
          playerName: playersDB[playerID]?.playerName || playerID, // Si no se encuentra en Firestore, muestra el ID
          ready: players[playerID]?.ready || false
        }))}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <Text>{item.playerName} {item.ready ? '✅' : '❌'}</Text>}
      />

      <TouchableOpacity
        style={[
          styles.button,
          isReady ? styles.ready : styles.waiting, // Cambiar estilos según isReady
        ]}
        onPress={toggleReady}
        disabled={!room}
      >
        <Text style={styles.buttonText}>
          {isReady ? "Listo" : "Listo"}
        </Text>
      </TouchableOpacity>


      <TextInput value={message} onChangeText={setMessage} placeholder="Escribe un mensaje" style={styles.input} />
      <Button title="Enviar" onPress={sendMessage} disabled={!room} />
      <FlatList
    data={chatMessages}
    renderItem={({ item }) => (
      <Text>{item.sender} : {item.text}</Text> // Muestra nombre, estado y mensaje
    )}
  />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 70 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontStyle: 'italic', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, width: '80%', marginVertical: 10, borderRadius: 5 },
  button: {
    width: 100, // Ancho del botón
    height: 100, // Alto del botón
    borderRadius: 50, // Hacerlo completamente redondo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5, // Borde de 5 para el efecto fluorescente
    margin: 10,
  },
  waiting: {
    backgroundColor: '#FF0000', // Fondo rojo cuando está esperando
    borderColor: '#FF6347', // Borde rojo
  },
  ready: {
    backgroundColor: 'green', // Fondo verde cuando está listo
    borderColor: 'lime', // Borde verde fluorescente
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});