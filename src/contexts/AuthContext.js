import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db  } from '../services/firebase'; // Importa la configuración de Firebase
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Estado del usuario
  const [loading, setLoading] = useState(true); // Indica si la app está cargando
  const [playerName, setPlayerName] = useState(null); // Nombre del jugador desde Firestore


  // cambio a import { db } from '../services/firebase';
  //const db = getFirestore();

  useEffect(() => {
    // Escucha cambios en la autenticación
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Obtener el playerName desde Firestore
        const userDocRef = doc(db, 'gameConfigs', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setPlayerName(userDocSnap.data().playerName);
        } else {
          setPlayerName(null);
        }
      } else {
        setPlayerName(null);
      }

      setLoading(false); // Detiene el loading una vez que detecta el usuario
      console.log('Usuario activo', playerName, '  su ID:  ', user.uid);
     
    });

    return unsubscribe; // Limpia el listener al desmontar el componente
  }, [db]);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert(error.message); // Manejo básico de errores
    }
  };

  const logout = async () => {
    await signOut(auth);
    setPlayerName(null);
  };

  return (
    <AuthContext.Provider value={{ user, playerName, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
