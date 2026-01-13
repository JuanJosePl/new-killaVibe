// src/modules/customer/api/customerOrders.api.js

import customerApiClient from '../utils/customerApiClient';

/**
 * @description API para Orders (CRUD de órdenes)
 * 
 * ✅ Customer puede: Crear, listar propias, ver detalles, tracking, cancelar, devolver
 * ❌ Customer NO puede: Ver todas las órdenes, actualizar estado, reembolsos (admin only)
 * 
 * Endpoints:
 * - POST /api/orders
 * - GET /api/orders
 * - GET /api/orders/:id
 * - GET /api/orders/:id/tracking
 * - PUT /api/orders/:id/cancel
 * - POST /api/orders/:id/return
 */

/**
 * Crear orden desde carrito
 * 
 * @param {Object} orderData
 * @param {Object} orderData.shippingAddress - Dirección envío (requerida)
 * @param {string} orderData.shippingAddress.firstName
 * @param {string} orderData.shippingAddress.lastName
 * @param {string} orderData.shippingAddress.street
 * @param {string} orderData.shippingAddress.city
 * @param {string} orderData.shippingAddress.state
 * @param {string} orderData.shippingAddress.zipCode
 * @param {string} orderData.shippingAddress.country
 * @param {string} orderData.shippingAddress.phone
 * @param {Object} orderData.billingAddress - Dirección facturación (opcional)
 * @param {string} orderData.paymentMethod - 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'cash_on_delivery'
 * @param {string} orderData.customerNotes - Notas del cliente (opcional, max 500)
 * 
 * @returns {Promise<Object>} Order creada
 * 
 * @throws {400} Carrito vacío o stock insuficiente
 */
export const createOrder = async (orderData) => {
  const response = await customerApiClient.post('/orders', orderData);
  return response.data;
};

/**
 * Obtener órdenes del usuario con filtros
 * 
 * @param {Object} filters
 * @param {number} filters.page - Página (default: 1)
 * @param {number} filters.limit - Límite (default: 10)
 * @param {string} filters.status - Filtrar por estado ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned')
 * @param {string} filters.sortBy - Campo ordenamiento ('createdAt', 'totalAmount', 'status')
 * @param {string} filters.sortOrder - Orden ('asc', 'desc')
 * 
 * @returns {Promise<Object>} { orders, pagination }
 * 
 * Response:
 * {
 *   orders: [...],
 *   pagination: {
 *     current: 1,
 *     pages: 5,
 *     total: 50,
 *     limit: 10
 *   }
 * }
 */
export const getUserOrders = async (filters = {}) => {
  try {
    // Intenta cambiar la ruta si el backend usa prefijos de rol
    const response = await customerApiClient.get('/orders', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error detectado en getUserOrders:", error);
    throw error;
  }
};

/**
 * Obtener orden por ID
 * 
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Order completa
 * 
 * @throws {404} Orden no encontrada
 * @throws {403} No pertenece al usuario
 */
export const getOrderById = async (orderId) => {
  const response = await customerApiClient.get(`/orders/${orderId}`);
  return response.data;
};

/**
 * Obtener tracking de orden
 * 
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Tracking info
 * 
 * Response:
 * {
 *   orderNumber: 'ORDER-ABC123',
 *   currentStatus: 'shipped',
 *   trackingNumber: 'TRACK123456',
 *   timeline: [
 *     {
 *       status: 'pending',
 *       label: 'Orden creada',
 *       date: '2024-01-01T10:00:00Z',
 *       completed: true
 *     },
 *     ...
 *   ]
 * }
 */
export const getOrderTracking = async (orderId) => {
  const response = await customerApiClient.get(`/orders/${orderId}/tracking`);
  return response.data;
};

/**
 * Cancelar orden
 * 
 * Reglas:
 * - Solo si status = 'pending' | 'confirmed'
 * - No si paymentStatus = 'paid'
 * 
 * @param {string} orderId - ID de la orden
 * @returns {Promise<Object>} Order cancelada
 * 
 * @throws {400} No se puede cancelar en este estado
 */
export const cancelOrder = async (orderId) => {
  const response = await customerApiClient.put(`/orders/${orderId}/cancel`);
  return response.data;
};

/**
 * Solicitar devolución de orden
 * 
 * Reglas:
 * - Solo si status = 'delivered'
 * - Máximo 30 días desde entrega
 * 
 * @param {string} orderId - ID de la orden
 * @param {string} reason - Razón de la devolución (min 10, max 500 chars)
 * @returns {Promise<Object>} Order actualizada
 * 
 * @throws {400} No se puede devolver / Período expirado
 */
export const requestReturn = async (orderId, reason) => {
  const response = await customerApiClient.post(`/orders/${orderId}/return`, {
    reason,
  });
  return response.data;
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderTracking,
  cancelOrder,
  requestReturn,
};