// modules/orders/api/orders.api.js
//
// Capa de infraestructura HTTP para el módulo Orders.
// Responsabilidades:
//   - Solo comunicarse con el backend
//   - No valida reglas de negocio
//   - No transforma a entidades (eso es el repository)
//   - No maneja estado de UI
//
// Contrato de endpoints (desde order.routes.js + order.controller.js):
//   POST   /api/orders
//   GET    /api/orders
//   GET    /api/orders/:id
//   GET    /api/orders/:id/tracking
//   PUT    /api/orders/:id/cancel
//   POST   /api/orders/:id/return

import apiClient from '@/core/api/apiClient'; // cliente Axios configurado con baseURL + interceptors

const BASE = '/orders';

/**
 * Crear orden desde el carrito.
 * El backend valida stock, consume carrito, genera snapshot.
 * El frontend SOLO envía dirección + método de pago.
 *
 * @param {Object} payload
 * @param {Object} payload.shippingAddress
 * @param {Object} [payload.billingAddress]
 * @param {string} payload.paymentMethod
 * @param {string} [payload.customerNotes]
 * @returns {Promise<Object>} raw order
 */
export async function apiCreateOrder(payload) {
  const { data } = await apiClient.post(BASE, payload);
  return data.data; // { success, data: order }
}

/**
 * Obtener órdenes del usuario autenticado.
 *
 * @param {Object} params
 * @param {number} [params.page=1]
 * @param {number} [params.limit=10]
 * @param {string} [params.status]
 * @param {string} [params.sortBy='createdAt']
 * @param {string} [params.sortOrder='desc']
 * @returns {Promise<{ orders: Object[], pagination: Object }>}
 */
export async function apiFetchUserOrders(params = {}) {
  const { data } = await apiClient.get(BASE, { params });
  // Response: { success, data: orders[], pagination }
  return {
    orders:     data.data     ?? [],
    pagination: data.pagination ?? null,
  };
}

/**
 * Obtener orden por ID (solo del usuario autenticado).
 *
 * @param {string} orderId
 * @returns {Promise<Object>} raw order
 */
export async function apiFetchOrderById(orderId) {
  const { data } = await apiClient.get(`${BASE}/${orderId}`);
  return data.data;
}

/**
 * Obtener tracking de una orden.
 *
 * @param {string} orderId
 * @returns {Promise<{ orderNumber, currentStatus, trackingNumber, timeline }>}
 */
export async function apiFetchOrderTracking(orderId) {
  const { data } = await apiClient.get(`${BASE}/${orderId}/tracking`);
  return data.data;
}

/**
 * Cancelar una orden.
 * Reglas aplicadas por backend: solo pending/confirmed, no paid.
 *
 * @param {string} orderId
 * @returns {Promise<Object>} raw order cancelada
 */
export async function apiCancelOrder(orderId) {
  const { data } = await apiClient.put(`${BASE}/${orderId}/cancel`);
  return data.data;
}

/**
 * Solicitar devolución de una orden.
 * Reglas aplicadas por backend: status = delivered, < 30 días.
 *
 * @param {string} orderId
 * @param {string} reason - Mínimo 10 caracteres
 * @returns {Promise<Object>} raw order actualizada
 */
export async function apiRequestReturn(orderId, reason) {
  const { data } = await apiClient.post(`${BASE}/${orderId}/return`, { reason });
  return data.data;
}

export default {
  apiCreateOrder,
  apiFetchUserOrders,
  apiFetchOrderById,
  apiFetchOrderTracking,
  apiCancelOrder,
  apiRequestReturn,
};