import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Client } from 'colyseus.js';
import { useGameContext } from '../../contexts/GameContext';
import { audioJuegoShot } from '../../variables/variable';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

const GAME_SERVER = 'ws://192.168.1.132:2567';

export default function ShotScreen({ route, navigation }) {
    const { clientContext, setRoomContext, audioContext, setAudioContext } = useGameContext();
    const { jugadorID } = route.params;
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState({});
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
    const glViewRef = useRef(null);

    useEffect(() => {
        const connectToRoom = async () => {
            if (!clientContext) return;
            try {
                const room = await clientContext.joinOrCreate("game");
                setRoomContext(room);
            } catch (error) {
                console.error("❌ Error al unirse a la sala:", error);
            }
        };
        connectToRoom();
    }, [clientContext]);

    useEffect(() => {
        setAudioContext(audioJuegoShot);
        console.log("🔊 Reproduciendo audio de disparo:  ", audioContext);
    }, []);

    const initScene = async (gl) => {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.z = 5;

        const renderer = new THREE.WebGLRenderer({ context: gl, antialias: true });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setPixelRatio(gl.drawingBufferWidth / gl.drawingBufferHeight);
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
            gl.endFrameEXP();
        });

        // Agregar un cubo de prueba
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);
    };

    return (
        <View style={styles.container}>
            <GLView style={styles.glView} onContextCreate={initScene} />
            <Text style={styles.title}>Juego en Progreso</Text>
            <Text>Jugador ID: {jugadorID}</Text>
            <Text>Posición: X: {position.x}, Y: {position.y}, Z: {position.z}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
    glView: { width: '100%', height: '50%' },
});
