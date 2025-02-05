// App.js
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import BackgroundAudio from "./src/components/BackgroundAudio";

export default function App() {
  return (
    <AuthProvider>
        <RootNavigator />
    </AuthProvider>
  );
}
