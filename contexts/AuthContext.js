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
