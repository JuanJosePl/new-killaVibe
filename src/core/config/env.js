// src/core/config/env.js

/**
 * @description Configuración centralizada de variables de entorno
 * 
 * IMPORTANTE: Crear archivo .env en la raíz del proyecto con:
 * 
 * VITE_API_URL=https://backend-vibeskilla.onrender.com/api
 * VITE_APP_NAME=KillaVibes
 * VITE_APP_VERSION=1.0.0
 */

const env = {
  /**
   * URL base del backend API
   * @type {string}
   */
  API_URL: import.meta.env.VITE_API_URL || 'https://backend-vibeskilla.onrender.com/api',

  /**
   * Nombre de la aplicación
   * @type {string}
   */
  APP_NAME: import.meta.env.VITE_APP_NAME || 'KillaVibes',

  /**
   * Versión de la aplicación
   * @type {string}
   */
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',

  /**
   * Modo de desarrollo
   * @type {boolean}
   */
  IS_DEV: import.meta.env.DEV,

  /**
   * Modo de producción
   * @type {boolean}
   */
  IS_PROD: import.meta.env.PROD,

  /**
   * Timeout por defecto para requests HTTP (en ms)
   * @type {number}
   */
  API_TIMEOUT: 10000,

  /**
   * Máximo de intentos de reintento
   * @type {number}
   */
  MAX_RETRY_ATTEMPTS: 3,
};

/**
 * @function validateEnv
 * @description Valida que las variables de entorno requeridas existan
 * @throws {Error} Si falta alguna variable requerida
 */
export const validateEnv = () => {
  const required = ['API_URL'];
  
  const missing = required.filter(key => !env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno requeridas: ${missing.join(', ')}\n` +
      'Por favor, crea un archivo .env con las variables necesarias.'
    );
  }
};

// Validar en desarrollo
if (env.IS_DEV) {
  try {
    validateEnv();
    console.log('[ENV] Variables de entorno cargadas correctamente ✓');
  } catch (error) {
    console.error('[ENV] Error:', error.message);
  }
}

export default env;