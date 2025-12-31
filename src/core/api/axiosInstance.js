// src/core/api/axiosInstance.js

import axios from 'axios';

/**
 * ✅ CORRECCIÓN: Interceptor mejorado con mejor manejo de errores
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
    
    // ✅ Log solo en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('[axiosInstance] Request error:', error);
    return Promise.reject(error);
  }
);

/**
 * @interceptor response
 * @description Maneja respuestas y errores globalmente
 * ✅ CORRECCIÓN: Mejor estructura de errores
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // ✅ Log solo en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url} → ${response.status}`);
    }
    
    // Retornar data directamente
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ============================================================================
    // MANEJO DE 401 - TOKEN EXPIRADO
    // ============================================================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = getStoredAuth();
        
        if (!authData || !authData.refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[axiosInstance] Intentando refrescar token...');

        // Intentar refrescar el token
        const response = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken: authData.refreshToken }
        );

        if (response.data.success && response.data.data.token) {
          const newToken = response.data.data.token;
          
          // Actualizar el token en localStorage
          const updatedAuthData = {
            ...authData,
            token: newToken
          };
          saveStoredAuth(updatedAuthData);
          
          console.log('[axiosInstance] Token refrescado exitosamente');
          
          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('[axiosInstance] Token refresh failed:', refreshError);
        clearStoredAuth();
        
        // Redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // ============================================================================
    // FORMATEAR ERROR - ✅ CORRECCIÓN
    // ============================================================================
    
    // ✅ Mantener la estructura original de axios
    const formattedError = {
      ...error,
      message: error.response?.data?.message || error.message || 'Error desconocido',
      statusCode: error.response?.status || 500,
      success: false,
    };

    // ✅ Log solo en desarrollo (excepto 401)
    if (import.meta.env.DEV && error.response?.status !== 401) {
      console.error(
        `[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`,
        `→ ${error.response?.status || 'Network Error'}`,
        error.response?.data?.message || error.message
      );
    }

    return Promise.reject({
  message: error.response?.data?.message || error.message || 'Error desconocido',
  statusCode: error.response?.status || 500,
  success: false,
  data: error.response?.data || null,
})});

export default axiosInstance;