// src/schemas/contactSchema.js

import * as Yup from 'yup';

/**
 * @constant contactSchema
 * @description Schema de validación para formulario de contacto
 * 
 * IMPORTANTE: Debe estar 100% sincronizado con:
 * Backend: src/modules/contact/contact.validation.js (Joi)
 * 
 * VALIDACIONES DEL BACKEND:
 * - name: min 2, max 100, required
 * - email: email válido, required
 * - phone: pattern /^[0-9\s\-\+()]*$/, optional
 * - subject: min 5, max 200, required
 * - message: min 10, max 2000, required
 */

export const contactSchema = Yup.object({
  /**
   * Nombre del remitente
   * Reglas: 2-100 caracteres, obligatorio
   */
  name: Yup.string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .required('El nombre es requerido'),

  /**
   * Email del remitente
   * Reglas: email válido, obligatorio
   */
  email: Yup.string()
    .trim()
    .email('Email inválido')
    .required('El email es requerido'),

  /**
   * Teléfono del remitente
   * Reglas: formato específico, opcional
   */
  phone: Yup.string()
    .trim()
    .matches(
      /^[0-9\s\-\+()]*$/,
      'Teléfono inválido. Solo números, espacios, +, -, ()'
    )
    .notRequired(),

  /**
   * Asunto del mensaje
   * Reglas: 5-200 caracteres, obligatorio
   */
  subject: Yup.string()
    .trim()
    .min(5, 'El asunto debe tener al menos 5 caracteres')
    .max(200, 'El asunto no puede tener más de 200 caracteres')
    .required('El asunto es requerido'),

  /**
   * Mensaje
   * Reglas: 10-2000 caracteres, obligatorio
   */
  message: Yup.string()
    .trim()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(2000, 'El mensaje no puede tener más de 2000 caracteres')
    .required('El mensaje es requerido')
});

/**
 * @constant contactInitialValues
 * @description Valores iniciales del formulario de contacto
 */
export const contactInitialValues = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: ''
};

/**
 * @function validateContactField
 * @description Valida un campo individual del formulario
 * @param {string} fieldName - Nombre del campo
 * @param {any} value - Valor del campo
 * @returns {Promise<string|null>} Error message o null si es válido
 * 
 * @example
 * const error = await validateContactField('name', 'J');
 * // error = "El nombre debe tener al menos 2 caracteres"
 */
export const validateContactField = async (fieldName, value) => {
  try {
    await contactSchema.validateAt(fieldName, { [fieldName]: value });
    return null;
  } catch (error) {
    return error.message;
  }
};

/**
 * @function validateContactForm
 * @description Valida todo el formulario de contacto
 * @param {Object} formData - Datos del formulario
 * @returns {Promise<Object>} { isValid: boolean, errors: Object }
 * 
 * @example
 * const validation = await validateContactForm(formData);
 * if (!validation.isValid) {
 *   console.error(validation.errors);
 * }
 */
export const validateContactForm = async (formData) => {
  try {
    await contactSchema.validate(formData, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

export default contactSchema;