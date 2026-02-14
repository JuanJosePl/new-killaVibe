// src/modules/auth/schemas/auth.schema.js

import * as Yup from 'yup';

/**
 * @description Esquemas de validación para formularios de autenticación
 * 
 * IMPORTANTE: Estos esquemas DEBEN coincidir EXACTAMENTE con las validaciones
 * del backend (auth.validation.js) para evitar errores de validación tardíos.
 */

// ========== PATRONES DE VALIDACIÓN ==========

const PATTERNS = {
  // Solo letras (incluyendo acentos y espacios)
  LETTERS_ONLY: /^[a-zA-ZáéíóúñÁÉÍÓÚÑ'\s-]+$/,
  
  // Teléfono internacional (7-20 caracteres, números y símbolos permitidos)
  PHONE: /^[0-9\s\-\+()]{7,20}$/,
};

// ========== MENSAJES DE ERROR ==========

const MESSAGES = {
  EMAIL_REQUIRED: 'El email es requerido',
  EMAIL_INVALID: 'Email inválido',
  EMAIL_MAX: 'Email muy largo (máx. 100 caracteres)',
  
  PASSWORD_REQUIRED: 'La contraseña es requerida',
  PASSWORD_MIN: 'La contraseña debe tener al menos 6 caracteres',
  
  FIRSTNAME_REQUIRED: 'El nombre es requerido',
  FIRSTNAME_MAX: 'El nombre no puede exceder 50 caracteres',
  FIRSTNAME_INVALID: 'El nombre solo puede contener letras',
  
  LASTNAME_REQUIRED: 'El apellido es requerido',
  LASTNAME_MAX: 'El apellido no puede exceder 50 caracteres',
  LASTNAME_INVALID: 'El apellido solo puede contener letras',
  
  PHONE_INVALID: 'Teléfono inválido (7-20 caracteres, solo números y símbolos permitidos)',
};

// ========== ESQUEMA: REGISTRO ==========

/**
 * @schema registerSchema
 * @description Validación para formulario de registro
 * 
 * Coincide EXACTAMENTE con:
 * - backend: auth.validation.js > registerValidation
 * - modelo: auth.model.js > userSchema
 */
export const registerSchema = Yup.object({
  email: Yup.string()
    .required(MESSAGES.EMAIL_REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .max(100, MESSAGES.EMAIL_MAX)
    .lowercase()
    .trim(),

  password: Yup.string()
    .required(MESSAGES.PASSWORD_REQUIRED)
    .min(6, MESSAGES.PASSWORD_MIN),

  firstName: Yup.string()
    .required(MESSAGES.FIRSTNAME_REQUIRED)
    .max(50, MESSAGES.FIRSTNAME_MAX)
    .matches(PATTERNS.LETTERS_ONLY, MESSAGES.FIRSTNAME_INVALID)
    .trim(),

  lastName: Yup.string()
    .required(MESSAGES.LASTNAME_REQUIRED)
    .max(50, MESSAGES.LASTNAME_MAX)
    .matches(PATTERNS.LETTERS_ONLY, MESSAGES.LASTNAME_INVALID)
    .trim(),

  phone: Yup.string()
    .nullable()
    .notRequired()
    .matches(PATTERNS.PHONE, {
      message: MESSAGES.PHONE_INVALID,
      excludeEmptyString: true,
    })
    .trim(),
});

// ========== ESQUEMA: LOGIN ==========

/**
 * @schema loginSchema
 * @description Validación para formulario de login
 * 
 * Coincide EXACTAMENTE con:
 * - backend: auth.validation.js > loginValidation
 */
export const loginSchema = Yup.object({
  email: Yup.string()
    .required(MESSAGES.EMAIL_REQUIRED)
    .email(MESSAGES.EMAIL_INVALID)
    .lowercase()
    .trim(),

  password: Yup.string()
    .required(MESSAGES.PASSWORD_REQUIRED),
});

// ========== ESQUEMA: ACTUALIZAR PERFIL ==========

/**
 * @schema updateProfileSchema
 * @description Validación para actualizar perfil
 * 
 * Coincide EXACTAMENTE con:
 * - backend: auth.validation.js > updateProfileValidation
 * 
 * NOTA: Al menos un campo debe estar presente
 */
export const updateProfileSchema = Yup.object({
  firstName: Yup.string()
    .max(50, MESSAGES.FIRSTNAME_MAX)
    .matches(PATTERNS.LETTERS_ONLY, MESSAGES.FIRSTNAME_INVALID)
    .trim(),

  lastName: Yup.string()
    .max(50, MESSAGES.LASTNAME_MAX)
    .matches(PATTERNS.LETTERS_ONLY, MESSAGES.LASTNAME_INVALID)
    .trim(),

  phone: Yup.string()
    .nullable()
    .matches(PATTERNS.PHONE, {
      message: MESSAGES.PHONE_INVALID,
      excludeEmptyString: true,
    })
    .trim(),
}).test(
  'at-least-one',
  'Debes proporcionar al menos un campo para actualizar',
  (value) => {
    return Object.values(value).some(v => v !== undefined && v !== null && v !== '');
  }
);

// ========== UTILIDADES DE VALIDACIÓN ==========

/**
 * @function validatePasswordStrength
 * @description Calcula la fortaleza de una contraseña
 * 
 * @param {string} password
 * @returns {Object} { score: 0-100, feedback: string[] }
 */
export const validatePasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: [] };

  let score = 0;
  const feedback = [];

  // Longitud mínima (25 puntos)
  if (password.length >= 6) {
    score += 25;
    feedback.push('✓ Longitud mínima');
  } else {
    feedback.push('✗ Mínimo 6 caracteres');
  }

  // Mayúsculas y minúsculas (25 puntos)
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) {
    score += 25;
    feedback.push('✓ Mayúsculas y minúsculas');
  } else {
    feedback.push('✗ Usa mayúsculas y minúsculas');
  }

  // Números (25 puntos)
  if (password.match(/\d/)) {
    score += 25;
    feedback.push('✓ Contiene números');
  } else {
    feedback.push('✗ Añade números');
  }

  // Caracteres especiales (25 puntos)
  if (password.match(/[^a-zA-Z\d]/)) {
    score += 25;
    feedback.push('✓ Caracteres especiales');
  } else {
    feedback.push('✗ Añade símbolos (@, !, #, etc.)');
  }

  return { score, feedback };
};

/**
 * @function getPasswordStrengthColor
 * @description Retorna el color según la fortaleza
 * 
 * @param {number} score - Score de fortaleza (0-100)
 * @returns {string} Clase de Tailwind CSS
 */
export const getPasswordStrengthColor = (score) => {
  if (score < 50) return 'bg-red-500';
  if (score < 75) return 'bg-yellow-500';
  return 'bg-green-500';
};

/**
 * @function getPasswordStrengthLabel
 * @description Retorna la etiqueta según la fortaleza
 * 
 * @param {number} score - Score de fortaleza (0-100)
 * @returns {string} Etiqueta
 */
export const getPasswordStrengthLabel = (score) => {
  if (score < 50) return 'Débil';
  if (score < 75) return 'Media';
  return 'Fuerte';
};