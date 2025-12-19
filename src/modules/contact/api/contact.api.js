// src/api/contact.js

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module ContactAPI
 * @description Servicios de API para el módulo Contact
 * 
 * ENDPOINTS DEL BACKEND:
 * POST   /api/contact                          → Enviar mensaje (público)
 * GET    /api/contact/admin/messages           → Listar mensajes (admin)
 * PUT    /api/contact/admin/messages/:id/read  → Marcar como leído (admin)
 * POST   /api/contact/admin/messages/:id/reply → Responder mensaje (admin)
 * DELETE /api/contact/admin/messages/:id       → Eliminar mensaje (admin)
 * 
 * VALIDACIONES DEL BACKEND (src/modules/contact/contact.validation.js):
 * - name: min 2, max 100, required
 * - email: email válido, required
 * - phone: pattern /^[0-9\s\-\+()]*$/, optional
 * - subject: min 5, max 200, required
 * - message: min 10, max 2000, required
 * 
 * RATE LIMITING:
 * - General: 60 req/15min
 * - Anti-spam service: 3 mensajes/hora por email
 */

/**
 * @function sendContactMessage
 * @description Enviar mensaje de contacto (público)
 * @param {Object} contactData - Datos del formulario
 * @param {string} contactData.name - Nombre (2-100 caracteres)
 * @param {string} contactData.email - Email válido
 * @param {string} [contactData.phone] - Teléfono (opcional)
 * @param {string} contactData.subject - Asunto (5-200 caracteres)
 * @param {string} contactData.message - Mensaje (10-2000 caracteres)
 * @returns {Promise<Object>} { success, message, data: { id } }
 * 
 * @example
 * const result = await sendContactMessage({
 *   name: "Juan Pérez",
 *   email: "juan@example.com",
 *   phone: "+57 300 123 4567",
 *   subject: "Consulta sobre producto",
 *   message: "Hola, quisiera información sobre..."
 * });
 */
export const sendContactMessage = async (contactData) => {
  try {
    const response = await axiosInstance.post('/contact', contactData);
    return response;
  } catch (error) {
    console.error('Error en sendContactMessage:', error);
    throw error;
  }
};

/**
 * @function getContactMessages
 * @description Obtener mensajes de contacto con filtros (Admin)
 * @param {Object} [params] - Parámetros de consulta
 * @param {number} [params.page=1] - Página actual
 * @param {number} [params.limit=20] - Resultados por página
 * @param {string} [params.status] - Filtrar por estado: 'new' | 'read' | 'replied' | 'archived'
 * @param {string} [params.search] - Buscar en nombre, email, subject
 * @param {string} [params.sortBy='createdAt'] - Campo para ordenar
 * @param {string} [params.sortOrder='desc'] - Orden: 'asc' | 'desc'
 * @returns {Promise<Object>} { success, data: messages[], pagination }
 * 
 * @example
 * const result = await getContactMessages({
 *   page: 1,
 *   limit: 20,
 *   status: 'new',
 *   search: 'juan',
 *   sortBy: 'createdAt',
 *   sortOrder: 'desc'
 * });
 */
export const getContactMessages = async (params = {}) => {
  try {
    const response = await axiosInstance.get('/contact/admin/messages', {
      params
    });
    return response;
  } catch (error) {
    console.error('Error en getContactMessages:', error);
    throw error;
  }
};

/**
 * @function markMessageAsRead
 * @description Marcar mensaje como leído (Admin)
 * @param {string} messageId - ID del mensaje
 * @returns {Promise<Object>} { success, message }
 * 
 * @example
 * await markMessageAsRead('673a1b2c3d4e5f6789012345');
 */
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await axiosInstance.put(
      `/contact/admin/messages/${messageId}/read`
    );
    return response;
  } catch (error) {
    console.error('Error en markMessageAsRead:', error);
    throw error;
  }
};

/**
 * @function replyToMessage
 * @description Responder mensaje de contacto (Admin)
 * @param {string} messageId - ID del mensaje
 * @param {string} reply - Respuesta del administrador (10-2000 caracteres)
 * @returns {Promise<Object>} { success, message }
 * 
 * @example
 * await replyToMessage('673a1b2c3d4e5f6789012345', 'Gracias por tu mensaje...');
 */
export const replyToMessage = async (messageId, reply) => {
  try {
    const response = await axiosInstance.post(
      `/contact/admin/messages/${messageId}/reply`,
      { reply }
    );
    return response;
  } catch (error) {
    console.error('Error en replyToMessage:', error);
    throw error;
  }
};

/**
 * @function deleteContactMessage
 * @description Eliminar mensaje de contacto (Admin)
 * @param {string} messageId - ID del mensaje
 * @returns {Promise<Object>} { success, message }
 * 
 * @example
 * await deleteContactMessage('673a1b2c3d4e5f6789012345');
 */
export const deleteContactMessage = async (messageId) => {
  try {
    const response = await axiosInstance.delete(
      `/contact/admin/messages/${messageId}`
    );
    return response;
  } catch (error) {
    console.error('Error en deleteContactMessage:', error);
    throw error;
  }
};

export default {
  sendContactMessage,
  getContactMessages,
  markMessageAsRead,
  replyToMessage,
  deleteContactMessage
};