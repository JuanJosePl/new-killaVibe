// src/modules/customer/utils/customerApiClient.js

import axios from 'axios';
import { customerErrorNormalizer } from './customerErrorNormalizer';

/**
 * @description Cliente HTTP SINCRONIZADO con AuthContext
 * 
 * ✅ CORRECCIONES:
 * - Usa la MISMA clave de localStorage que AuthContext ('killavibes_auth')
 * - Mantiene la misma estructura de datos
 * - No duplica lógica de refresh token (lo maneja axiosInstance)
 * - Puede coexistir con axiosInstance sin conflictos
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-vibeskilla.onrender.com/api';
const AUTH_STORAGE_KEY = 'killavibes_auth'; // ✅ MISMA KEY QUE AuthContext

// ============================================
// HELPERS DE STORAGE
// ============================================
const getStoredAuth = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('[customerApiClient] Error reading auth:', error);
    return null;
  }
};

const saveStoredAuth = (authData) => {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
  } catch (error) {
    console.error('[customerApiClient] Error saving auth:', error);
  }
};

const clearStoredAuth = () => {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    console.error('[customerApiClient] Error clearing auth:', error);
  }
};

// ============================================
// CREAR INSTANCIA
// ============================================
const customerApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================
customerApiClient.interceptors.request.use(
  (config) => {
    // ✅ Obtener token de la misma estructura que AuthContext
    const authData = getStoredAuth();
    
    if (authData && authData.token) {
      config.headers.Authorization = `Bearer ${authData.token}`;
    }

    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Customer API] ${config.method.toUpperCase()} ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================
customerApiClient.interceptors.response.use(
  (response) => {
    // Log en desarrollo
    if (import.meta.env.DEV) {
      console.log(`[Customer API] Response ${response.config.url} → ${response.status}`);
    }

    // Retornar data directamente (igual que axiosInstance)
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // ============================================
    // MANEJO DE 401 - TOKEN EXPIRADO
    // ============================================
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const authData = getStoredAuth();
        
        if (!authData || !authData.refreshToken) {
          throw new Error('No refresh token available');
        }

        console.log('[customerApiClient] Intentando refrescar token...');

        // ✅ Intentar refrescar el token
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: authData.refreshToken }
        );

        if (response.data.success && response.data.data.token) {
          const newToken = response.data.data.token;
          
          // ✅ Actualizar token manteniendo la MISMA ESTRUCTURA
          const updatedAuthData = {
            ...authData,
            token: newToken
          };
          saveStoredAuth(updatedAuthData);
          
          console.log('[customerApiClient] Token refrescado exitosamente');
          
          // Reintentar request original
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return customerApiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('[customerApiClient] Token refresh failed:', refreshError);
        clearStoredAuth();
        
        // Redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // ============================================
    // NORMALIZAR ERROR
    // ============================================
    const normalizedError = customerErrorNormalizer(error);

    // Log en desarrollo (excepto 401 ya loggeado)
    if (import.meta.env.DEV && error.response?.status !== 401) {
      console.error('[Customer API] Error:', normalizedError);
    }

    return Promise.reject(normalizedError);
  }
);

// ============================================
// HELPERS PÚBLICOS
// ============================================

/**
 * Configurar headers personalizados para un request
 */
export const setCustomHeaders = (headers) => {
  Object.assign(customerApiClient.defaults.headers, headers);
};

/**
 * Limpiar headers personalizados
 */
export const clearCustomHeaders = (keys) => {
  keys.forEach((key) => {
    delete customerApiClient.defaults.headers[key];
  });
};

export default customerApiClient;