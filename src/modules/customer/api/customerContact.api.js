// src/modules/customer/api/customerContact.api.js

import customerApiClient from "../utils/customerApiClient";

/**
 * ============================================
 * 📧 CUSTOMER CONTACT API
 * ============================================
 *
 * Acoplado 100% con:
 * - Backend: contact.service.js
 * - Endpoints: contact.routes.js
 * - Validación: contact.validation.js
 *
 * Endpoints disponibles:
 * - POST /api/contact - Enviar mensaje de contacto
 */

/**
 * Enviar mensaje de contacto
 *
 * @param {Object} contactData
 * @param {string} contactData.name - Nombre (2-100 chars)
 * @param {string} contactData.email - Email válido
 * @param {string} contactData.phone - Teléfono opcional (7-20 chars)
 * @param {string} contactData.subject - Asunto (5-200 chars)
 * @param {string} contactData.message - Mensaje (10-2000 chars)
 *
 * @returns {Promise<Object>} { success, message, data: { id } }
 *
 * @throws {400} Validación fallida
 * @throws {429} Demasiados mensajes (anti-spam: 3 max por hora)
 * @throws {500} Error del servidor
 */
export const sendContactMessage = async (contactData) => {
  try {
    const response = await customerApiClient.post("/contact", contactData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validar datos de contacto en el cliente (antes de enviar)
 * Mismas reglas que contact.validation.js del backend
 *
 * @param {Object} data - Datos a validar
 * @returns {Object} { isValid: boolean, errors: {} }
 */
export const validateContactData = (data) => {
  const errors = {};

  // Nombre: 2-100 caracteres
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
  } else if (data.name.trim().length > 100) {
    errors.name = "El nombre no puede tener más de 100 caracteres";
  }

  // Email: validación RFC 5322 simplificada
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email.trim())) {
    errors.email = "Email inválido";
  }

  // Teléfono: opcional, pattern específico
  if (data.phone && data.phone.trim()) {
    const phoneRegex = /^[0-9\s\-\+()]*$/;
    if (!phoneRegex.test(data.phone.trim())) {
      errors.phone = "Teléfono inválido (solo números y símbolos permitidos)";
    } else if (data.phone.trim().length < 7 || data.phone.trim().length > 20) {
      errors.phone = "El teléfono debe tener entre 7 y 20 caracteres";
    }
  }

  // Asunto: 5-200 caracteres
  if (!data.subject || data.subject.trim().length < 5) {
    errors.subject = "El asunto debe tener al menos 5 caracteres";
  } else if (data.subject.trim().length > 200) {
    errors.subject = "El asunto no puede tener más de 200 caracteres";
  }

  // Mensaje: 10-2000 caracteres
  if (!data.message || data.message.trim().length < 10) {
    errors.message = "El mensaje debe tener al menos 10 caracteres";
  } else if (data.message.trim().length > 2000) {
    errors.message = "El mensaje no puede tener más de 2000 caracteres";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  sendContactMessage,
  validateContactData,
};
