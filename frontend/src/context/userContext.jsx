import React, { createContext, useContext, useState, useEffect } from "react";

// Roles permitidos
export const ROLES = {
  ADMINISTRADOR: "ADMINISTRADOR",
  PSICOLOGO: "PSICOLOGO",
  TRABAJADOR_SOCIAL: "TRABAJADOR_SOCIAL",
  ASISTENTE: "ASISTENTE",
};

// Creamos el contexto
const UserContext = createContext();

// Hook para usar el contexto más fácilmente
export const useUser = () => useContext(UserContext);

// Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recuperar datos del localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error al recuperar datos del usuario:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (role) => {
    return user?.rol === role;
  };

  // Verificar si el usuario tiene alguno de los roles especificados
  const hasAnyRole = (roles) => {
    return roles.includes(user?.rol);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
