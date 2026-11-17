import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

// fetch original del navegador (se guarda en window para sobrevivir recargas en caliente de Vite)
if (!window.__nativeFetch) window.__nativeFetch = window.fetch.bind(window);
const nativeFetch = window.__nativeFetch;

const getUrl = (input) =>
  typeof input === "string" ? input : input instanceof Request ? input.url : String(input);

// El Provider registra aquí cómo renovar el token y cómo cerrar la sesión
const authHandlers = {
  refresh: async () => null,
  expire: () => {},
};

/**
 * Interceptor global de fetch (se instala al cargar el módulo, antes de que
 * cualquier pantalla haga peticiones). Si una petición al backend que lleva
 * "Authorization" recibe 401 (token vencido), renueva el token con el refresh
 * token y la reintenta una vez. Si no se puede renovar, cierra la sesión.
 */
window.fetch = async (input, init = {}) => {
  const res = await nativeFetch(input, init);
  if (res.status !== 401) return res;

  const url = getUrl(input);
  if (!url.startsWith(API_BASE) || url.includes("/api/auth/")) return res;

  const headers = new Headers(
    init.headers || (input instanceof Request ? input.headers : undefined)
  );
  if (!headers.has("Authorization")) return res;

  const nuevo = await authHandlers.refresh();
  if (!nuevo) {
    authHandlers.expire();
    return res;
  }

  headers.set("Authorization", `Bearer ${nuevo}`);
  return nativeFetch(input, { ...init, headers });
};

// Roles permitidos
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
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

  const login = (userData, tokenData, refreshTokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenData);
    if (refreshTokenData) {
      localStorage.setItem("refreshToken", refreshTokenData);
    } else {
      localStorage.removeItem("refreshToken");
    }
  };

  // Actualizar campos del usuario en sesión (ej. foto de perfil) sin volver a iniciar sesión
  const updateUser = (changes) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...changes };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  }, []);

  // Una sola renovación a la vez, aunque varias peticiones fallen juntas
  const refreshPromise = useRef(null);

  const refreshAccessToken = useCallback(() => {
    if (!refreshPromise.current) {
      refreshPromise.current = (async () => {
        const storedRefresh = localStorage.getItem("refreshToken");
        if (!storedRefresh) return null;
        try {
          const res = await nativeFetch(`${API_BASE}/api/auth/refresh-token`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: storedRefresh }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.token) return null;
          localStorage.setItem("token", data.token);
          setToken(data.token);
          return data.token;
        } catch {
          return null;
        }
      })().finally(() => {
        refreshPromise.current = null;
      });
    }
    return refreshPromise.current;
  }, []);

  // Cerrar sesión por expiración, avisando una sola vez aunque fallen varias peticiones
  const expiredNotified = useRef(false);
  const expireSession = useCallback(() => {
    if (!localStorage.getItem("token")) return;
    logout();
    if (!expiredNotified.current) {
      expiredNotified.current = true;
      toast.error("Tu sesión expiró. Inicia sesión nuevamente.");
      setTimeout(() => (expiredNotified.current = false), 3000);
    }
  }, [logout]);

  // Conectar el interceptor global de fetch con esta sesión
  authHandlers.refresh = refreshAccessToken;
  authHandlers.expire = expireSession;

  /**
   * fetch con el token de sesión actual. La renovación la hace el interceptor;
   * si aun así responde 401, la sesión ya expiró.
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) {
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }
    return res;
  }, []);

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
        updateUser,
        authFetch,
        logout,
        hasRole,
        hasAnyRole
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
