import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, FlatList, Alert } from 'react-native';
import { Client } from 'colyseus.js';
import useGameContext from './GameScreen';
import { useNavigation } from '@react-navigation/native';
//const LOBBY_SERVER = 'wss://trikiclickbackend.onrender.com';
const LOBBY_SERVER = 'ws://192.168.1.132:2567'; // Usa ws:// para WebSocket

export default function Lobby({ route, navigation }) {
  const { clientContext, setClientContext, roomContext, setRoomContext } = useGameContext();
  const { jugadorID } = route.params;
  const [room, setRoom] = useState(null);
  const [players, setPlayers] = useState({});
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [creator, setCreator] = useState(null);
  const [isInRoom, setIsInRoom] = useState(false);
  //console.log("id del jugador >>>>>>>   :    ", jugadorID);

  


  const clientRef = useRef(null);

  useEffect(() => {
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
      roomInstance.onMessage('players', (playersData) => {
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
      roomInstance.onMessage('chat', msg => setChatMessages(prev => [...prev, msg]));

      // ✅ Recibir señal para empezar el juego
      roomInstance.onMessage('start_game', () => {
        if (navigation) {
            navigation.navigate('Shots', { jugadorID });
        } else {
            console.error("🚨 navigation no está definido en onMessage('start_game')");
        }
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
      <Text style={styles.subtitle}>Creador de la sala: {creator || "Esperando..."}</Text>
      <FlatList
        data={Array.from(new Map(Object.values(players).map(player => [player.playerName, player])).values())}
        keyExtractor={item => item.playerName} // Usar playerName como clave única
        renderItem={({ item }) => <Text>{item.playerName} {item.ready ? '✅' : '❌'}</Text>}
      />


      <Button title={isReady ? "Listo" : "Esperando..."} onPress={toggleReady} disabled={!room} />
     
      <TextInput value={message} onChangeText={setMessage} placeholder="Escribe un mensaje" style={styles.input} />
      <Button title="Enviar" onPress={sendMessage} disabled={!room} />
      <FlatList data={chatMessages} renderItem={({ item }) => <Text>{item.sender}: {item.text}</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 18, fontStyle: 'italic', marginBottom: 10 },
  input: { borderWidth: 1, padding: 10, width: '80%', marginVertical: 10, borderRadius: 5 }
});