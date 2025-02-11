import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const ListadoJugadores = ({ jugadores, onRegresar, onConectar, setBot }) => {
    const [search, setSearch] = useState('');
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Filtrar jugadores según búsqueda
    const filteredPlayers = jugadores.filter(player =>
        player.playerName.toLowerCase().includes(search.toLowerCase())
    );

    // Función para elegir un jugador aleatorio
    const elegirJugadorAleatorio = () => {
        if (filteredPlayers.length === 0) return; // Si no hay jugadores filtrados, no hace nada
        const indiceAleatorio = Math.floor(Math.random() * filteredPlayers.length);
        const jugadorAleatorio = filteredPlayers[indiceAleatorio];
        setSelectedPlayer(jugadorAleatorio); // Establece al jugador seleccionado aleatoriamente
    };

    const elegirJugadorBot = () => {

setBot(true);
setSelectedPlayer(null); // Restablecer el jugador seleccionado
    }


    return (
        <View style={styles.container}>
            {/* Botones de Regresar y Conectar */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={onRegresar}>
                    <Text style={styles.buttonText}>Regresar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, selectedPlayer ? styles.activeButton : {}]}
                    onPress={() => {
                        if (selectedPlayer) {
                            // Llamar a onConectar pasando los dos parámetros
                            onConectar(selectedPlayer, selectedPlayer.playerName);
                        }
                    }}
                    disabled={!selectedPlayer}
                >
                    <Text style={styles.buttonText}>Conectar</Text>
                </TouchableOpacity>
            </View>

            {/* Barra de Búsqueda o Randow*/}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Buscar jugador..."
                    value={search}
                    onChangeText={setSearch}
                    placeholderTextColor="#39ff14" // Color del placeholder
                    onFocus={() => setSelectedPlayer(null)}
                />

                <TouchableOpacity style={styles.searchButton} onPress={elegirJugadorAleatorio}>
                    <Text style={styles.searchButtonText}>Randow</Text>
                </TouchableOpacity>
            </View>

            {/* Lista de Jugadores */}
            <FlatList
                data={filteredPlayers}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[
                            styles.playerItem,
                            selectedPlayer === item && styles.selectedPlayer
                        ]}
                        onPress={() => setSelectedPlayer(item)}
                    >
                        <Text style={styles.playerText}>{item.playerName}</Text>
                    </TouchableOpacity>
                )}
            />

<TouchableOpacity style={styles.buttonBot} onPress={elegirJugadorBot}>
                    <Text style={styles.searchButtonText}>Usar BOT</Text>
                </TouchableOpacity>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#121212',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    button: {
        backgroundColor: '#444',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginHorizontal: 20,
    },
    activeButton: {
        backgroundColor: '#39ff14', // Verde neón cuando está activo
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    searchBar: {
        flex: 1,  // Hace que el TextInput ocupe todo el espacio disponible
        backgroundColor: '#222',
        padding: 10,
        borderRadius: 8,
        color: '#39ff14', // Color del texto ingresado

    },
    playerItem: {
        padding: 15,
        backgroundColor: '#333',
        marginVertical: 5,
        borderRadius: 8,
    },
    selectedPlayer: {
        backgroundColor: '#39ff14', // Verde neón cuando se selecciona
    },
    playerText: {
        color: '#fff',
        fontSize: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center', // Para centrar verticalmente el texto en el button y el input
        width: '100%',
        marginBottom: 15,
    },
    searchButton: {
        backgroundColor: '#444', // Botón verde
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10, // Espacio entre el input y el botón
        borderWidth: 2,
        borderColor: '#39ff14', // Borde fluorescente (verde neón)
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30, // Bordes redondeados
    },

    searchButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonBot: {
        backgroundColor: '#444', // Botón verde
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginLeft: 10, // Espacio entre el input y el botón
        borderWidth: 2,
        borderColor: '#39ff14', // Borde fluorescente (verde neón)
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30, // Bordes redondeados
        alignItems: 'center',
    },
});

export default ListadoJugadores;
