
//    instalacion de paquetes web


//      npx expo install react-dom react-native-web @expo/metro-runtime


// App.js
import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// src/contexts/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Almacena el usuario autenticado

  const login = (email, password) => {
    // Aquí podrías conectar con tu servicio de autenticación
    setUser({ email }); // Simulamos el login exitoso
  };

  const logout = () => {
    setUser(null); // Elimina la sesión
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++





// src/navigation/RootNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from '../screens/LoginScreen';
import GameScreen from '../screens/GameScreen';
import { useAuth } from '../contexts/AuthContext';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth(); // Accede al estado de autenticación

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <Stack.Screen name="Game" component={GameScreen} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


//**************************************************************************************************************************** */

// src/screens/GameScreen.js
import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function GameScreen() {
  const { logout } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>¡Bienvenido al juego!</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}

//**************************************************************************************************************************** */

//**************************************************************************************************************************** */
// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, TextInput, Button, Alert, Text } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu correo y contraseña');
      return;
    }
    // Llamada al método de login del contexto
    login(email, password);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text>Inicia sesión para jugar</Text>
      
      <TextInput
        style={{ width: '100%', height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 }}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      
      <TextInput
        style={{ width: '100%', height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 20, paddingHorizontal: 10 }}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      
      <Button title="Iniciar sesión" onPress={handleLogin} />
    </View>
  );
}
