// App.js
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import BackgroundAudio from "./src/components/BackgroundAudio";
import { GameProvider } from './src/contexts/GameContext';
import { AudioProvider } from './src/contexts/AudioContext'; // Importa el contexto de audio



export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
     
         
      <BackgroundAudio />
        <RootNavigator />
     
      </GameProvider>
    </AuthProvider>
  );
}
