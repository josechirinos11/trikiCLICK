import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Client } from 'colyseus.js';
import { useGameContext } from '../../contexts/GameContext';
const GAME_SERVER = 'https://trikiclickbackend.onrender.com';

export default function ShotScreen({ route, navigation }) {
    const { clientContext, setClientContext, roomContext, setRoomContext } = useGameContext();
    const { jugadorID } = route.params;
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState({});
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

    useEffect(() => {
        if (!roomContext) {
          console.error("❌ No estás en una sala.");
          return;
        }
    
        roomContext.onMessage('update', setPlayers);
      }, [roomContext]);

    const movePlayer = (direction) => {
        let newPos = { ...position };
        if (direction === 'left') newPos.x -= 1;
        if (direction === 'right') newPos.x += 1;
        if (direction === 'up') newPos.y += 1;
        if (direction === 'down') newPos.y -= 1;

        setPosition(newPos);
        room?.send('move', newPos);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Juego en Progreso</Text>
            <Text>Jugador ID: {jugadorID}</Text>
            <Text>Posición: X: {position.x}, Y: {position.y}, Z: {position.z}</Text>
            <View style={styles.controls}>
                <Button title="Izquierda" onPress={() => movePlayer('left')} />
                <Button title="Derecha" onPress={() => movePlayer('right')} />
                <Button title="Arriba" onPress={() => movePlayer('up')} />
                <Button title="Abajo" onPress={() => movePlayer('down')} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    controls: { flexDirection: 'row', marginTop: 20 }
});