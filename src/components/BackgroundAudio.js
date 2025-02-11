import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { useGameContext } from "../contexts/GameContext";

const BackgroundAudio = () => {
  const { audioContext } = useGameContext(); // Obtener el estado del audio
  const [sound, setSound] = useState(null);
  const [currentAudioPath, setCurrentAudioPath] = useState(null); // Nuevo estado para el path


  useEffect(() => {
    let isMounted = true;

    const playSound = async () => {

      if (!audioContext) return; // No hay audio para reproducir

      const audioContextFullPath = audioContext instanceof Object ? audioContext.uri : audioContext; // Obtener el path del audio

      // Comparar paths en lugar de objetos
      if (currentAudioPath === audioContextFullPath) {
        return; // El audio no ha cambiado, no hay necesidad de hacer nada
      }


      try {
        // Detener y descargar el audio actual si existe
        if (sound) {
          await sound.stopAsync();
          await sound.unloadAsync();
        }

        // Cargar y reproducir el nuevo audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioContext, // Usar el nuevo audioContext
          { isLooping: true, volume: 0.5 }
        );

        if (isMounted) {
          setSound(newSound);
          setCurrentAudioPath(audioContextFullPath); // Actualizar el path actual
          await newSound.playAsync();
        }
      } catch (error) {
        console.error("Error al reproducir el audio:", error);
      }
    };

    playSound();
    console.log("🔊 Reproduciendo audio de fondo:  ", audioContext );

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioContext]); // Dependencia: audioContext

  return null; // No necesita renderizar nada
};

export default BackgroundAudio;