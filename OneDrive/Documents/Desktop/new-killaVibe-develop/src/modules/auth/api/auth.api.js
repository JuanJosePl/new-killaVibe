// src/modules/auth/api/auth.api.js

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module authAPI
 * @description API calls para el módulo de autenticación
 * 
 * IMPORTANTE: Todas las funciones retornan el formato exacto del backend:
 * - { success, message?, data?, errors? }
 * 
 * Los errores son manejados por el interceptor de axiosInstance
 */

export const authAPI = {
  /**
   * @function register
   * @description Registrar nuevo usuario
   * 
   * @param {Object} userData
   * @param {string} userData.email - Email único
   * @param {string} userData.password - Contraseña (min 6 chars)
   * @param {string} userData.firstName - Nombre (max 50 chars, letters only)
   * @param {string} userData.lastName - Apellido (max 50 chars, letters only)
   * @param {string} [userData.phone] - Teléfono opcional (7-20 chars)
   * 
   * @returns {Promise<Object>} { success, message, data: { token, refreshToken, user } }
   * @throws {Object} { success: false, message, statusCode, errors? }
   * 
   * @example
   * const response = await authAPI.register({
   *   email: 'user@example.com',
   *   password: 'SecurePass123',
   *   firstName: 'John',
   *   lastName: 'Doe',
   *   phone: '+57 300 123 4567'
   * });
   */
  register: async (userData) => {
    return await axiosInstance.post('/auth/register', userData);
  },

  /**
   * @function login
   * @description Autenticar usuario
   * 
   * @param {Object} credentials
   * @param {string} credentials.email - Email del usuario
   * @param {string} credentials.password - Contraseña
   * 
   * @returns {Promise<Object>} { success, message, data: { token, refreshToken, user } }
   * @throws {Object} { success: false, message: 'Email o contraseña incorrectos', statusCode: 401 }
   * @throws {Object} { success: false, message: 'Cuenta bloqueada...', statusCode: 403 }
   * 
   * @example
   * const response = await authAPI.login({
   *   email: 'user@example.com',
   *   password: 'SecurePass123'
   * });
   */
  login: async (credentials) => {
    return await axiosInstance.post('/auth/login', credentials);
  },

  /**
   * @function getProfile
   * @description Obtener perfil del usuario autenticado
   * 
   * @requires Authorization header (automático vía interceptor)
   * 
   * @returns {Promise<Object>} { success, data: { user } }
   * @throws {Object} { success: false, message: 'Usuario no autenticado', statusCode: 401 }
   * 
   * @example
   * const response = await authAPI.getProfile();
   * // { success: true, data: { user: { _id, email, profile, role, ... } } }
   */
  getProfile: async () => {
    return await axiosInstance.get('/auth/profile');
  },

  /**
   * @function updateProfile
   * @description Actualizar perfil del usuario autenticado
   * 
   * @param {Object} updateData
   * @param {string} [updateData.firstName] - Nombre
   * @param {string} [updateData.lastName] - Apellido
   * @param {string} [updateData.phone] - Teléfono (null para remover)
   * 
   * @requires Authorization header (automático)
   * 
   * @returns {Promise<Object>} { success, message, data: { user } }
   * @throws {Object} { success: false, message, statusCode: 400 | 401 | 404 }
   * 
   * @example
   * const response = await authAPI.updateProfile({
   *   firstName: 'Jane',
   *   phone: '+57 301 234 5678'
   * });
   */
  updateProfile: async (updateData) => {
    return await axiosInstance.put('/auth/profile', updateData);
  },

  /**
   * @function refreshToken
   * @description Refrescar token de acceso usando refresh token
   * 
   * @param {string} refreshToken - Refresh token válido
   * 
   * @returns {Promise<Object>} { success, message, data: { token } }
   * @throws {Object} { success: false, message: 'Refresh token inválido', statusCode: 401 }
   * 
   * @example
   * const response = await authAPI.refreshToken(refreshToken);
   * // { success: true, data: { token: 'nuevo_access_token' } }
   */
  refreshToken: async (refreshToken) => {
    return await axiosInstance.post('/auth/refresh-token', { refreshToken });
  },

  /**
   * @function logout
   * @description Logout del usuario (notificación al servidor)
   * 
   * @requires Authorization header (automático)
   * 
   * @returns {Promise<Object>} { success, message }
   * 
   * @example
   * await authAPI.logout();
   * // { success: true, message: 'Logout exitoso' }
   */
  logout: async () => {
    return await axiosInstance.post('/auth/logout');
  },
};