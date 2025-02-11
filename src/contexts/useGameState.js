// useGameState.js
import { useState } from 'react';

export const useGameState = () => {
  const [clientContext, setClientContext] = useState(null);
  const [roomContext, setRoomContext] = useState(null);

  return {
    clientContext,
    setClientContext,
    roomContext,
    setRoomContext,
  };
};


//////////////////////////////////////////////////////////////////////////////////////////////

/* 


import React, { createContext, useContext, useMemo } from 'react';
import { useGameState } from './useGameState';

const GameContext = createContext();

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext debe usarse dentro de un GameProvider");
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const gameState = useGameState();

  // Memoiza el valor del contexto para evitar rerenders innecesarios
  const contextValue = useMemo(() => gameState, [gameState]);

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
};



*/
