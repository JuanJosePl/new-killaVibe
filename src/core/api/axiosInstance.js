// src/core/api/axiosInstance.js

import axios from 'axios';

/**
 * @constant BASE_URL
 * @description URL base del backend
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://ecommerce-1o8n.onrender.com/';

/**
 * @constant AUTH_STORAGE_KEY
 * @description Clave para localStorage (debe coincidir con AuthProvider)
 */
const AUTH_STORAGE_KEY = 'killavibes_auth';

/**
 * @constant axiosInstance
 * @description Instancia de Axios configurada con:
 * - Base URL del backend
 * - Timeout de 10 segundos
 * - Headers comunes
 * - Interceptor de request (token)
 * - Interceptor de response (errores, refresh token)
 */
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
 * @returns {Object|null} { user, token, refreshToken } o null
 */
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error reading auth from localStorage:', error);
    return null;
  }
};

/**
 * @function saveStoredAuth
 * @description Guarda datos de autenticación en localStorage
 * @param {Object} authData - { user, token, refreshToken }
 */
const saveStoredAuth = (authData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('Error saving auth to localStorage:', error);
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
    console.error('Error clearing auth from localStorage:', error);
  }
};

/**
 * @interceptor request
 * @description Intercepta requests para agregar token automáticamente
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const authData = getStoredAuth();
    
    if (authData && authData.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * @interceptor response
 * @description Intercepta responses para:
 * - Manejar errores globalmente
 * - Refrescar token expirado automáticamente (401)
 * - Logout en caso de token inválido
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, retornar data directamente
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 (token expirado) y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = getStoredAuth();
        
        if (!authData || !authData.refreshToken) {
          throw new Error('No refresh token available');
        }

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
          
          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, logout
        console.error('Token refresh failed:', refreshError);
        clearStoredAuth();
        
        // Redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Si es otro error, formatear y rechazar
    const formattedError = {
      message: error.response?.data?.message || error.message || 'Error desconocido',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
      success: false,
      response: error.response
    };

    return Promise.reject(formattedError);
  }
);

export default axiosInstance;