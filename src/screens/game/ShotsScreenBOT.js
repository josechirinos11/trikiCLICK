import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import * as THREE from 'three';

export default function ShotsScreenBOT() {
    const [playerPosition, setPlayerPosition] = useState({ x: 0, y: -2, z: 0 });
    const [botPosition, setBotPosition] = useState({ x: 0, y: 2, z: 0 });
    const glViewRef = useRef(null);
    let scene, camera, renderer;
    const bullets = [];
    const botBullets = [];

    const initScene = async (gl) => {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ context: gl, antialias: true });
        renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.setPixelRatio(gl.drawingBufferWidth / gl.drawingBufferHeight);
        renderer.setAnimationLoop(() => {
            updateBot();
            updateBullets();
            renderer.render(scene, camera);
            gl.endFrameEXP();
        });

        // Crear jugador
        const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const playerMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
        const player = new THREE.Mesh(playerGeometry, playerMaterial);
        player.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
        player.name = 'player';
        scene.add(player);

        // Crear BOT
        const botGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const botMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bot = new THREE.Mesh(botGeometry, botMaterial);
        bot.position.set(botPosition.x, botPosition.y, botPosition.z);
        bot.name = 'bot';
        scene.add(bot);
    };

    const updateBot = () => {
        const bot = scene.getObjectByName('bot');
        if (bot) {
            bot.position.x += (Math.random() - 0.5) * 0.05;
            bot.position.y += (Math.random() - 0.5) * 0.05;
            if (Math.random() < 0.02) shootBot();
        }
    };

    const movePlayer = (direction) => {
        let newPos = { ...playerPosition };
        if (direction === 'left') newPos.x -= 0.2;
        if (direction === 'right') newPos.x += 0.2;
        if (direction === 'up') newPos.y += 0.2;
        if (direction === 'down') newPos.y -= 0.2;
        setPlayerPosition(newPos);
        
        const player = scene.getObjectByName('player');
        if (player) {
            player.position.set(newPos.x, newPos.y, newPos.z);
        }
    };

    const shoot = () => {
        const player = scene.getObjectByName('player');
        if (player) {
            const bulletGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.set(player.position.x, player.position.y, player.position.z);
            bullet.userData = { direction: 0.1 };
            scene.add(bullet);
            bullets.push(bullet);
        }
    };

    const shootBot = () => {
        const bot = scene.getObjectByName('bot');
        if (bot) {
            const bulletGeometry = new THREE.SphereGeometry(0.1, 16, 16);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
            const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
            bullet.position.set(bot.position.x, bot.position.y, bot.position.z);
            bullet.userData = { direction: -0.1 };
            scene.add(bullet);
            botBullets.push(bullet);
        }
    };

    const updateBullets = () => {
        bullets.forEach((bullet, index) => {
            bullet.position.y += bullet.userData.direction;
            if (bullet.position.y > 5) {
                scene.remove(bullet);
                bullets.splice(index, 1);
            }
        });

        botBullets.forEach((bullet, index) => {
            bullet.position.y += bullet.userData.direction;
            if (bullet.position.y < -5) {
                scene.remove(bullet);
                botBullets.splice(index, 1);
            }
        });
    };

    return (
        <View style={styles.container}>
            <GLView style={styles.glView} onContextCreate={initScene} />
            <View style={styles.controls}>
                <Button title="⬅️" onPress={() => movePlayer('left')} />
                <Button title="➡️" onPress={() => movePlayer('right')} />
                <Button title="⬆️" onPress={() => movePlayer('up')} />
                <Button title="⬇️" onPress={() => movePlayer('down')} />
                <Button title="🔥 Disparar" onPress={shoot} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    glView: { width: '100%', height: '50%' },
    controls: { flexDirection: 'row', marginTop: 20 },
});
