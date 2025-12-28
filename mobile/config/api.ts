import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Obtener la URL base del API
const getApiUrl = () => {
  // Si estamos en desarrollo
  if (__DEV__) {
    // En web, intentar obtener el host del window.location
    if (Platform.OS === 'web') {
      // Si estamos en localhost en el navegador, usar localhost para el API
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        return 'http://localhost:3000';
      }
      // Si estamos accediendo por IP, usar esa misma IP para el API
      if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return `http://${window.location.hostname}:3000`;
      }
    }

    // Para dispositivos móviles/emuladores
    // Obtener la IP del servidor Expo (normalmente es la IP de tu computadora)
    const expoHost = Constants.expoConfig?.hostUri?.split(':')[0];

    if (expoHost) {
      return `http://${expoHost}:3000`;
    }

    // Fallback a una IP fija (cambiar según sea necesario)
    return 'http://192.168.100.139:3000';
  }

  // En producción, usar la URL del servidor real
  return 'https://tu-dominio.com'; // Cambiar por la URL de producción cuando esté disponible
};

export const API_URL = getApiUrl();

// Configuración adicional
export const API_CONFIG = {
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
  },
};

// Log de la URL para debugging (solo en desarrollo)
if (__DEV__) {
  console.log('API_URL configurada:', API_URL);
}
