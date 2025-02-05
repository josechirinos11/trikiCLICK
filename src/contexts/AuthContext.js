import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../services/firebase'; // Importa la configuración de Firebase

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Estado del usuario
  const [loading, setLoading] = useState(true); // Indica si la app está cargando

  const [clientContext, setClientContext] = useState(null);
  const [roomContext, setRoomContext] = useState(null);

  useEffect(() => {
    // Escucha cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // Detiene el loading una vez que detecta el usuario
    });

    return unsubscribe; // Limpia el listener al desmontar el componente
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message); // Manejo básico de errores
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout}}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
