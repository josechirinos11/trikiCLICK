// App.js
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import BackgroundAudio from "./src/components/BackgroundAudio";
import { GameProvider } from './src/contexts/GameContext';

export default function App() {
  return (
    <AuthProvider>
       <GameProvider>
        <RootNavigator />
        </GameProvider>
    </AuthProvider>
  );
}
