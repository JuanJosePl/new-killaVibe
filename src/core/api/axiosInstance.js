// src/core/api/axiosInstance.js

import axios from 'axios';

/**
 * @constant BASE_URL
 * @description URL base del backend
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://backend-vibeskilla.onrender.com/api';

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
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * @interceptor request
 * @description Intercepta requests para agregar token automáticamente
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('killavibes-token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
        const refreshToken = localStorage.getItem('killavibes-refresh-token');
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Intentar refrescar el token
        const { data } = await axios.post(
          `${BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );

        if (data.success && data.data.token) {
          const newToken = data.data.token;
          localStorage.setItem('killavibes-token', newToken);
          
          // Reintentar request original con nuevo token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Si falla el refresh, logout
        localStorage.removeItem('killavibes-token');
        localStorage.removeItem('killavibes-refresh-token');
        localStorage.removeItem('killavibes-user');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    // Si es otro error, formatear y rechazar
    const formattedError = {
      message: error.response?.data?.message || error.message || 'Error desconocido',
      statusCode: error.response?.status || 500,
      errors: error.response?.data?.errors || [],
      success: false,
    };

    return Promise.reject(formattedError);
  }
);

export default axiosInstance;