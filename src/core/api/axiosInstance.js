// src/core/api/axiosInstance.js

import axios from 'axios';

/**
 * ✅ CORRECCIÓN: Interceptor mejorado con manejo de errores robusto
 * Evita el error "Cannot convert object to primitive value" y bucles de redirección.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-vibeskilla.onrender.com/api';
const AUTH_STORAGE_KEY = 'killavibes_auth';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @function getStoredAuth
 * @description Obtiene datos de autenticación de localStorage
 */
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[axiosInstance] Error reading auth:', error);
    return null;
  }
};

/**
 * @function saveStoredAuth
 * @description Guarda datos de autenticación en localStorage
 */
const saveStoredAuth = (authData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('[axiosInstance] Error saving auth:', error);
  }
};

/**
 * @function clearStoredAuth
 * @description Limpia datos de autenticación de localStorage
 */
const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('[axiosInstance] Error clearing auth:', error);
  }
};

/**
 * @interceptor request
 * @description Agrega token automáticamente a cada request
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const authData = getStoredAuth();
    
    if (authData && authData.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
    
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @interceptor response
 * @description Maneja respuestas y errores globalmente
 */
axiosInstance.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url} → ${response.status}`);
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ============================================================================
    // MANEJO DE 401 - TOKEN EXPIRADO / INVÁLIDO
    // ============================================================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = getStoredAuth();
        
        if (!authData || !authData.refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken: authData.refreshToken }
        );

        if (response.data.success && response.data.data.token) {
          const newToken = response.data.data.token;
          
          const updatedAuthData = {
            ...authData,
            token: newToken
          };
          saveStoredAuth(updatedAuthData);
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        clearStoredAuth();
        
        // Redirigir solo si no estamos ya en el login para evitar bucles
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
          window.location.href = '/auth/login';
        }
        
        // Retornar error real
        const finalRefreshError = new Error('Sesión expirada');
        return Promise.reject(finalRefreshError);
      }
    }

    // ============================================================================
    // FORMATEAR ERROR FINAL (Evita "Object to Primitive" error)
    // ============================================================================
    
    // Log de error en desarrollo
    if (import.meta.env.DEV && error.response?.status !== 401) {
      console.error(
        `[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        `→ ${error.response?.status || 'Network Error'}`,
        error.response?.data?.message || error.message
      );
    }

    // ✅ REEMPLAZO PUNTUAL: Creamos una instancia de Error legítima
    const errorToReturn = new Error(error.response?.data?.message || error.message || 'Error desconocido');
    
    // Agregamos metadata útil para los componentes
    errorToReturn.statusCode = error.response?.status || 500;
    errorToReturn.data = error.response?.data || null;
    errorToReturn.success = false;

    return Promise.reject(errorToReturn);
  }
);

export default axiosInstance;