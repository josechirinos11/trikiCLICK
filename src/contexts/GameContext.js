// GameContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import{ audioFondo } from '../variables/variable';

const GameContext = createContext();



export const GameProvider = ({ children }) => {
  const [clientContext, setClientContext] = useState(null);
  const [roomContext, setRoomContext] = useState(null);
  const [audioContext, setAudioContext] = useState(null);


    useEffect(() => {
        setAudioContext(audioFondo);
        console.log("🔊 Reproduciendo audio Primera vez en contex:  ", audioContext );
      }, []);





  return (
    <GameContext.Provider value={{
       clientContext, 
       setClientContext, 
       roomContext, 
       setRoomContext, 
       audioContext, 
       setAudioContext 
       }}>
      {children}
    </GameContext.Provider>
  );
};


export const useGameContext = () => useContext(GameContext);