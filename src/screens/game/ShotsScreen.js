import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { Client } from 'colyseus.js';
import { useGameContext } from '../../contexts/GameContext';
import { audioJuegoShot } from '../../variables/variable';
import { GLView } from 'expo-gl';
import * as THREE from 'three';
//import { Renderer } from 'expo-three';
//import initThree from './utils/initThree';




const GAME_SERVER = 'ws://192.168.1.132:2567';

export default function ShotScreen({ route, navigation }) {

    const { clientContext, setClientContext, roomContext, setRoomContext, audioContext, setAudioContext } = useGameContext();
    const { jugadorID } = route.params;
    const [room, setRoom] = useState(null);
    const [players, setPlayers] = useState({});
    const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

    const [scene, setScene] = useState(null); // Escena de Three.js
    const [camera, setCamera] = useState(null); // Cámara de Three.js
    const [renderer, setRenderer] = useState(null); // Renderizador de Three.js
    const glViewRef = useRef(null); // Referencia al GLView de Expo



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
        if (!scene) return;
        // Agregar objetos aquí solo si scene está listo
    }, [scene]);


    //actualizar escena de disparos
    useEffect(() => {
        if (roomContext && scene) {
            const onPlayerShoot = (data) => {
                console.log(`Jugador ${data.shooterId} disparó desde ${JSON.stringify(data.position)}`);
    
                // Crear el proyectil (por ejemplo, una esfera)
                const shotGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const shotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const shot = new THREE.Mesh(shotGeometry, shotMaterial);
                shot.position.set(data.position.x, data.position.y, data.position.z);
                scene.add(shot);
    
                // Mover el proyectil
                const moveShot = (shot) => {
                    const animateShot = () => {
                        shot.position.x += 0.1;
                        if (shot.position.x > 10) {
                            scene.remove(shot);
                            return;
                        }
                        requestAnimationFrame(animateShot);
                    };
                    animateShot();
                };
    
                moveShot(shot);
            };
    
            // Capturamos la función de cancelación (unsubscribe)
            const unsubscribePlayerShoot = roomContext.onMessage("player_shoot", onPlayerShoot);
    
            return () => {
                // Al desmontar el efecto, llamamos a la función de cancelación
                unsubscribePlayerShoot();
            };
        }
    }, [roomContext, scene]);
    

    //actualizar las posiciones de los jugadores en el mundo 3D
    useEffect(() => {
        if (roomContext) {
            const onPlayerPositionUpdate = (data) => {
                // Actualizas las posiciones de los jugadores en Three.js
                for (const sessionId in data) {
                    const player = data[sessionId];
    
                    // Crear o actualizar el objeto 3D para cada jugador
                    let playerObject = scene.getObjectByName(sessionId);
    
                    if (!playerObject) {
                        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
                        const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
                        playerObject = new THREE.Mesh(geometry, material);
                        playerObject.name = sessionId;
                        scene.add(playerObject);
                    }
    
                    // Actualiza la posición
                    playerObject.position.set(player.position.x, player.position.y, player.position.z);
                }
            };

            const unsubscribePositions = roomContext.onMessage("update_positions", onPlayerPositionUpdate);

            return () => {
                unsubscribePositions();
            };
        }
    }, [roomContext, scene]);



    // inicializamos three.js
    useEffect(() => {
        // Inicializar Three.js cuando el componente se monta
        const initThree = async (gl) => {
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
            camera.position.z = 5;

            const renderer = new Renderer({ gl });
            renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);


            setScene(scene);
            setCamera(camera);
            setRenderer(renderer);

            // Agregar objetos 3D a la escena (por ejemplo, un cubo)
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
            const cube = new THREE.Mesh(geometry, material);
            scene.add(cube);

            // Animación de la escena
            const renderScene = () => {
                requestAnimationFrame(renderScene);
                renderer.render(scene, camera);
                gl.endFrameEXP();
            };
            renderScene();
        };

        initThree();

        return () => {
            // Limpiar recursos cuando el componente se desmonte
            if (renderer) {
                renderer.dispose();
            }
        };
    }, []);


    useEffect(() => {
        if (!roomContext) return; // Evita errores si roomContext es undefined
        if (roomContext) {
            const onUpdate = (data) => setPlayers(data);
           
            const unsubscribeUpdate = roomContext.onMessage("update", onUpdate);


            // maneja el evento del disparo
            const onPlayerShoot = (data) => {
                console.log(`Jugador ${data.shooterId} disparó desde ${JSON.stringify(data.position)}`);

                // Crear el proyectil (por ejemplo, una esfera)
                const shotGeometry = new THREE.SphereGeometry(0.1, 16, 16);
                const shotMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
                const shot = new THREE.Mesh(shotGeometry, shotMaterial);
                shot.position.set(data.position.x, data.position.y, data.position.z);
                scene.add(shot);

                // Mover el proyectil
                const moveShot = (shot) => {
                    const animateShot = () => {
                        shot.position.x += 0.1;
                        if (shot.position.x > 10) {
                            scene.remove(shot);
                            return;
                        }
                        requestAnimationFrame(animateShot);
                    };
                    animateShot();
                };

                moveShot(shot);
            };

            // Capturamos la función de cancelación (unsubscribe)
            const unsubscribePlayerShoot = roomContext.onMessage("player_shoot", onPlayerShoot)

            return () => {
                unsubscribeUpdate();
                unsubscribePlayerShoot();
            };
        }
    }, [roomContext]);


    useEffect(() => {
        setAudioContext(audioJuegoShot);
        console.log("🔊 Reproduciendo audio de disparo:  ", audioContext);
    }, []);



    const movePlayer = (direction) => {
        let newPos = { ...position };
        if (direction === 'left') newPos.x -= 1;
        if (direction === 'right') newPos.x += 1;
        if (direction === 'up') newPos.y += 1;
        if (direction === 'down') newPos.y -= 1;

        setPosition(newPos);
        console.log("🚶 Moviendo jugador a:", newPos);
        if (roomContext) {
            roomContext.send('move', newPos);
        } else {
            console.error("❌ No se puede enviar movimiento, no estás en una sala.");
        }

    };

    const shoot = () => {
        if (roomContext) {
            // Suponiendo que la posición de la mira es donde está el jugador apuntando
            const shotData = {
                playerId: jugadorID,
                muzzlePosition: position // O usa una posición de mira específica si tienes una
            };
            roomContext.send("shoot", shotData);
        }
    };

    const initScene = async (gl) => {
        const { scene, camera, renderer } = await initThree(gl);
        setScene(scene);
        setCamera(camera);
        setRenderer(renderer);
    };


    return (
        <View style={styles.container}>
            <GLView style={styles.glView} onContextCreate={initScene} />

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
    controls: { flexDirection: 'row', marginTop: 20 },
    glView: {
        width: '100%',
        height: '50%',
    },
});