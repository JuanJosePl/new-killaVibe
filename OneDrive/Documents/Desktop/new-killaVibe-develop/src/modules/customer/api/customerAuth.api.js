// src/modules/customer/api/customerAuth.api.js

import customerApiClient from '../utils/customerApiClient';

/**
 * @module customerAuth.api
 * @description API layer para funcionalidades de autenticación del customer
 * 
 * Responsabilidades:
 * - Endpoints de perfil
 * - Cambio de contraseña
 * - Logout
 * - Eliminación de cuenta
 * 
 * Contrato Backend:
 * - GET    /api/auth/profile
 * - PUT    /api/auth/profile
 * - POST   /api/auth/change-password
 * - POST   /api/auth/logout
 * - DELETE /api/auth/account
 */

/**
 * Obtener perfil del usuario autenticado
 * 
 * @returns {Promise<Object>} User profile
 * @throws {401} No autenticado
 * @throws {404} Usuario no encontrado
 * 
 * @example
 * const profile = await customerAuthApi.getProfile();
 * // {
 * //   _id: '...',
 * //   email: 'user@example.com',
 * //   profile: { firstName, lastName, phone, avatar },
 * //   role: 'customer',
 * //   isActive: true,
 * //   emailVerified: false,
 * //   lastLogin: '...',
 * //   createdAt: '...'
 * // }
 */
export const getProfile = async () => {
  return customerApiClient.get('/auth/profile');
};

/**
 * Actualizar perfil del usuario autenticado
 * 
 * Campos actualizables:
 * - firstName (string, 2-50 chars)
 * - lastName (string, 2-50 chars)
 * - phone (string, 7-20 chars, opcional)
 * 
 * @param {Object} data - Datos a actualizar
 * @param {string} [data.firstName] - Nombre
 * @param {string} [data.lastName] - Apellido
 * @param {string} [data.phone] - Teléfono
 * @returns {Promise<Object>} User profile actualizado
 * @throws {400} Validación fallida
 * @throws {401} No autenticado
 * 
 * @example
 * const updated = await customerAuthApi.updateProfile({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+57 300 123 4567'
 * });
 */
export const updateProfile = async (data) => {
  return customerApiClient.put('/auth/profile', data);
};

/**
 * Cambiar contraseña del usuario autenticado
 * 
 * Validaciones:
 * - currentPassword requerido
 * - newPassword mínimo 6 caracteres
 * - confirmPassword debe coincidir con newPassword
 * 
 * @param {Object} data - Datos de cambio de contraseña
 * @param {string} data.currentPassword - Contraseña actual
 * @param {string} data.newPassword - Nueva contraseña
 * @param {string} data.confirmPassword - Confirmación de nueva contraseña
 * @returns {Promise<Object>} Success message
 * @throws {401} Contraseña actual incorrecta
 * @throws {400} Validación fallida
 * 
 * @example
 * await customerAuthApi.changePassword({
 *   currentPassword: 'OldPass123!',
 *   newPassword: 'NewPass456!',
 *   confirmPassword: 'NewPass456!'
 * });
 */
export const changePassword = async (data) => {
  return customerApiClient.post('/auth/change-password', data);
};

/**
 * Cerrar sesión del usuario autenticado
 * 
 * Nota: El token se invalida en el cliente (localStorage)
 * El backend solo registra el evento de logout
 * 
 * @returns {Promise<Object>} Success message
 * @throws {401} No autenticado
 * 
 * @example
 * await customerAuthApi.logout();
 * // { success: true, message: 'Logout exitoso' }
 */
export const logout = async () => {
  return customerApiClient.post('/auth/logout');
};

/**
 * Eliminar cuenta del usuario autenticado (soft delete)
 * 
 * ⚠️ IMPORTANTE: Esta acción desactiva la cuenta (isActive = false)
 * Los datos NO se eliminan físicamente de la BD
 * 
 * ⚠️ REQUIERE IMPLEMENTACIÓN EN BACKEND
 * Actualmente la ruta DELETE /auth/account NO existe
 * 
 * @returns {Promise<Object>} Success message
 * @throws {401} No autenticado
 * @throws {404} Usuario no encontrado
 * 
 * @example
 * await customerAuthApi.deleteAccount();
 * // { success: true, message: 'Cuenta desactivada exitosamente' }
 */
export const deleteAccount = async () => {
  return customerApiClient.delete('/auth/account');
};

/**
 * Verificar si un email está disponible (útil para registro)
 * 
 * Nota: Este endpoint es público (no requiere autenticación)
 * Útil para validaciones en tiempo real
 * 
 * @param {string} email - Email a verificar
 * @returns {Promise<Object>} { available: boolean }
 * 
 * @example
 * const { available } = await customerAuthApi.checkEmailAvailability('test@example.com');
 * // { available: false }
 */
export const checkEmailAvailability = async (email) => {
  return customerApiClient.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
};

/**
 * Solicitar verificación de email
 * 
 * ⚠️ REQUIERE IMPLEMENTACIÓN EN BACKEND
 * 
 * @returns {Promise<Object>} Success message
 * @throws {401} No autenticado
 * 
 * @example
 * await customerAuthApi.requestEmailVerification();
 * // { success: true, message: 'Email de verificación enviado' }
 */
export const requestEmailVerification = async () => {
  return customerApiClient.post('/auth/request-email-verification');
};

/**
 * Verificar email con token
 * 
 * ⚠️ REQUIERE IMPLEMENTACIÓN EN BACKEND
 * 
 * @param {string} token - Token de verificación
 * @returns {Promise<Object>} Success message
 * 
 * @example
 * await customerAuthApi.verifyEmail('token123abc');
 * // { success: true, message: 'Email verificado exitosamente' }
 */
export const verifyEmail = async (token) => {
  return customerApiClient.post('/auth/verify-email', { token });
};