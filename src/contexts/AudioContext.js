import React, { createContext, useContext, useState } from 'react';

const AudioContext = createContext();

export const useAudioContext = () => {
  return useContext(AudioContext);
};

export const AudioProvider = ({ children }) => {
  const [backgroundAudio, setBackgroundAudio] = useState(null);
  const [currentAudio, setCurrentAudio] = useState(null);

  const playBackgroundAudio = (audioSource) => {
    if (backgroundAudio) {
      backgroundAudio.stop(); // Detener el audio anterior si existe
    }

    const newAudio = new Audio(audioSource);
    newAudio.loop = true; // Hacer que el sonido se repita
    newAudio.play();

    setBackgroundAudio(newAudio);
  };

  const playCustomAudio = (audioSource) => {
    if (currentAudio) {
      currentAudio.stop(); // Detener el audio de fondo actual
    }

    const newAudio = new Audio(audioSource);
    newAudio.play();

    setCurrentAudio(newAudio);
  };

  const stopCustomAudio = () => {
    if (currentAudio) {
      currentAudio.stop();
      setCurrentAudio(null);
    }
  };

  return (
    <AudioContext.Provider value={{ playBackgroundAudio, playCustomAudio, stopCustomAudio }}>
      {children}
    </AudioContext.Provider>
  );
};
