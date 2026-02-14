// src/modules/auth/types/auth.types.js

/**
 * @description Tipos, constantes y enums para el módulo de autenticación
 * 
 * IMPORTANTE: Estos valores deben coincidir EXACTAMENTE con el backend
 * (roles.js, auth.model.js)
 */

// ========== ROLES ==========

/**
 * @enum ROLES
 * @description Roles disponibles en el sistema
 * 
 * Coincide con: backend/src/core/constants/roles.js
 */
export const ROLES = {
  CUSTOMER: 'customer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

/**
 * @function getRoleLabel
 * @description Retorna etiqueta amigable del rol
 * 
 * @param {string} role - Rol del usuario
 * @returns {string} Etiqueta del rol
 */
export const getRoleLabel = (role) => {
  const labels = {
    [ROLES.CUSTOMER]: 'Cliente',
    [ROLES.MODERATOR]: 'Moderador',
    [ROLES.ADMIN]: 'Administrador',
  };
  
  return labels[role] || 'Desconocido';
};

/**
 * @function isAdmin
 * @description Verifica si un rol es admin
 * 
 * @param {string} role
 * @returns {boolean}
 */
export const isAdmin = (role) => {
  return role === ROLES.ADMIN;
};

/**
 * @function isModerator
 * @description Verifica si un rol es moderator o admin
 * 
 * @param {string} role
 * @returns {boolean}
 */
export const isModerator = (role) => {
  return [ROLES.ADMIN, ROLES.MODERATOR].includes(role);
};

// ========== STORAGE KEYS ==========

/**
 * @constant STORAGE_KEYS
 * @description Keys usadas en localStorage
 */
export const STORAGE_KEYS = {
  TOKEN: 'killavibes-token',
  REFRESH_TOKEN: 'killavibes-refresh-token',
  USER: 'killavibes-user',
};

// ========== CÓDIGOS DE ERROR ==========

/**
 * @enum ERROR_CODES
 * @description Códigos de error comunes del backend
 */
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
};

/**
 * @constant ERROR_MESSAGES
 * @description Mensajes de error predefinidos
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.UNAUTHORIZED]: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
  [ERROR_CODES.FORBIDDEN]: 'No tienes permisos para realizar esta acción.',
  [ERROR_CODES.NOT_FOUND]: 'El recurso solicitado no existe.',
  [ERROR_CODES.CONFLICT]: 'El recurso ya existe en el sistema.',
  [ERROR_CODES.UNPROCESSABLE]: 'Los datos proporcionados no son válidos.',
  [ERROR_CODES.TOO_MANY_REQUESTS]: 'Demasiadas solicitudes. Intenta más tarde.',
  [ERROR_CODES.INTERNAL_SERVER]: 'Error interno del servidor. Intenta más tarde.',
};

// ========== ESTRUCTURA DE USUARIO ==========

/**
 * @typedef {Object} UserProfile
 * @property {string} firstName - Nombre del usuario
 * @property {string} lastName - Apellido del usuario
 * @property {string|null} phone - Teléfono del usuario
 * @property {string|null} avatar - Avatar del usuario
 */

/**
 * @typedef {Object} User
 * @property {string} _id - ID del usuario (ObjectId)
 * @property {string} email - Email del usuario
 * @property {UserProfile} profile - Perfil del usuario
 * @property {string} role - Rol del usuario (customer|moderator|admin)
 * @property {boolean} isActive - Si el usuario está activo
 * @property {boolean} emailVerified - Si el email está verificado
 * @property {string} fullName - Nombre completo (virtual)
 * @property {Date|null} lastLogin - Último login
 * @property {Date} createdAt - Fecha de creación
 * @property {Date} updatedAt - Fecha de actualización
 */

/**
 * @typedef {Object} AuthResponse
 * @property {boolean} success - Si la operación fue exitosa
 * @property {string} [message] - Mensaje de la operación
 * @property {Object} [data] - Datos de la respuesta
 * @property {string} [data.token] - Access token JWT
 * @property {string} [data.refreshToken] - Refresh token JWT
 * @property {User} [data.user] - Usuario autenticado
 * @property {Array} [errors] - Errores de validación
 */

// ========== VALIDACIÓN DE CONTRASEÑA ==========

/**
 * @constant PASSWORD_RULES
 * @description Reglas de contraseña
 */
export const PASSWORD_RULES = {
  MIN_LENGTH: 6,
  REQUIRE_UPPERCASE: false, // Recomendado, no obligatorio
  REQUIRE_LOWERCASE: false, // Recomendado, no obligatorio
  REQUIRE_NUMBER: false, // Recomendado, no obligatorio
  REQUIRE_SPECIAL: false, // Recomendado, no obligatorio
};

// ========== RUTAS DE REDIRECCIÓN ==========

/**
 * @constant REDIRECT_PATHS
 * @description Rutas de redirección según contexto
 */
export const REDIRECT_PATHS = {
  AFTER_LOGIN: {
    [ROLES.CUSTOMER]: '/',
    [ROLES.MODERATOR]: '/admin',
    [ROLES.ADMIN]: '/admin',
  },
  AFTER_LOGOUT: '/auth/login',
  UNAUTHORIZED: '/auth/login',
  FORBIDDEN: '/',
};

/**
 * @function getRedirectPath
 * @description Retorna la ruta de redirección según rol
 * 
 * @param {string} role - Rol del usuario
 * @returns {string} Ruta de redirección
 */
export const getRedirectPath = (role) => {
  return REDIRECT_PATHS.AFTER_LOGIN[role] || REDIRECT_PATHS.AFTER_LOGIN[ROLES.CUSTOMER];
};