import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const BotonTrikiClick = ({ texto = 'Usar BOT', accion }) => {
    const [presionado, setPresionado] = useState(false); // Estado para saber si el botón está presionado

    const manejarPresionado = () => {
        setPresionado(!presionado);  // Cambiar el estado al contrario de lo que estaba
        if (accion) {
            accion(); // Llamar a la función pasada como prop
        }
    };

    return (
        <TouchableOpacity 
            style={[
                styles.buttonBot, 
                { 
                    backgroundColor: presionado ? '#39ff14' : '#444', // Cambiar el color de fondo
                    borderColor: presionado ? '#444' : '#39ff14', // Cambiar el borde
                }
            ]}
            onPress={manejarPresionado}
        >
            <Text style={[styles.searchButtonText, { color: presionado ? '#000' : 'white' }]}>
                {texto}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    buttonBot: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 30, // Bordes redondeados
        marginLeft: 10, // Espacio entre el input y el botón
        borderWidth: 2,
        alignItems: 'center',
    },
    searchButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    }
});

export default BotonTrikiClick;
