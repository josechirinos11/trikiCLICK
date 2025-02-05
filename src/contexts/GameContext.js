// GameContext.js
import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGameContext = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [clientContext, setClientContext] = useState(null);
  const [roomContext, setRoomContext] = useState(null);
  return (
    <GameContext.Provider value={{ clientContext, setClientContext, roomContext, setRoomContext  }}>
      {children}
    </GameContext.Provider>
  );
};
