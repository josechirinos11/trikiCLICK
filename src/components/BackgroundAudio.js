import { useEffect, useState } from "react";
import { Audio } from "expo-av";

const BackgroundAudio = () => {
  const [sound, setSound] = useState(null);

  useEffect(() => {
    let isMounted = true;
    
    const playSound = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../audio/fondoAudio.mp3"), // Cambia la ruta por tu archivo de audio
          { isLooping: true, volume: 0.1 }
        );

        if (isMounted) {
          setSound(sound);
          await sound.playAsync();
        }
      } catch (error) {
        console.error("Error al reproducir el audio:", error);
      }
    };

    playSound();

    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  return null; // No necesita renderizar nada
};

export default BackgroundAudio;
