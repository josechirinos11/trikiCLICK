import React, { useState, useEffect } from 'react';
import { Button, View, Text, ActivityIndicator, StyleSheet, TextInput, FlatList, Alert } from 'react-native';

import { Client } from 'colyseus.js';
import { useGameContext } from '../contexts/GameContext';
import { useNavigation } from '@react-navigation/native';
//const LOBBY_SERVER = 'wss://trikiclickbackend.onrender.com';
const LOBBY_SERVER = 'ws://192.168.1.132:2567'; // Usa ws:// para WebSocket

export default function SalaScreen({ navigation, route  }) {

    const { clientContext, setClientContext, roomContext, setRoomContext } = useGameContext();
    const { jugadorID } = route.params || {}; // Evita error si params es undefined

      const [room, setRoom] = useState(null);
      const [players, setPlayers] = useState({});
      const [chatMessages, setChatMessages] = useState([]);
      const [message, setMessage] = useState('');
      const [isReady, setIsReady] = useState(false);
      const [creator, setCreator] = useState(null);
      const [isInRoom, setIsInRoom] = useState(false);



  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState(null);

  const updateClient = () => {
    setClientContext({ name: 'Nuevo Jugador', id: '456' });
  };

  const updateRoom = () => {
    setRoomContext({ roomId: '789', status: 'active' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <div>
      <h1>Cliente: {clientContext ? clientContext.name : 'Sin datos'}</h1>
      <h2>Sala: {roomContext ? roomContext.roomId : 'Sin sala'}</h2>
      <button onClick={updateClient}>Actualizar Cliente</button>
      <button onClick={updateRoom}>Actualizar Sala</button>
    </div>
  );
};


const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
});
