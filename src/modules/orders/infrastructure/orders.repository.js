// modules/orders/infrastructure/orders.repository.js
//
// Capa de repositorio: único punto de conexión entre API ↔ Dominio.
// Responsabilidades:
//   - Llamar a orders.api.js
//   - Mapear respuestas crudas a OrderEntity
//   - Mapear errores HTTP a errores de dominio tipados
//   - Manejar autenticación faltante
//   - NO contiene lógica de negocio
//   - NO conoce React

import { OrderEntity } from '../domain/order.entity.js';
import { mapApiErrorToDomain, OrderUnauthorizedError } from '../domain/order.errors.js';
import {
  apiCreateOrder,
  apiFetchUserOrders,
  apiFetchOrderById,
  apiFetchOrderTracking,
  apiCancelOrder,
  apiRequestReturn,
} from '../api/orders.api.js';

/**
 * Mapear raw object a OrderEntity de forma segura.
 * @param {Object} raw
 * @returns {OrderEntity}
 */
function toEntity(raw) {
  return new OrderEntity(raw);
}

/**
 * Mapear array de raw orders a OrderEntity[].
 * @param {Object[]} raws
 * @returns {OrderEntity[]}
 */
function toEntityList(raws) {
  return (raws ?? []).map(toEntity);
}

/**
 * Wrapper que mapea errores HTTP a errores de dominio.
 * Si el error es 401/403, lanza OrderUnauthorizedError.
 * @param {Function} fn
 * @returns {Promise<any>}
 */
async function withDomainErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      throw new OrderUnauthorizedError();
    }
    throw mapApiErrorToDomain(err);
  }
}

// =========================================
// REPOSITORIO
// =========================================

/**
 * Crear orden desde carrito.
 *
 * @param {Object} payload - { shippingAddress, billingAddress?, paymentMethod, customerNotes? }
 * @returns {Promise<OrderEntity>}
 */
export async function createOrder(payload) {
  return withDomainErrors(async () => {
    const raw = await apiCreateOrder(payload);
    return toEntity(raw);
  });
}

/**
 * Obtener órdenes del usuario.
 *
 * @param {Object} filters
 * @returns {Promise<{ orders: OrderEntity[], pagination: Object }>}
 */
export async function fetchUserOrders(filters = {}) {
  return withDomainErrors(async () => {
    const { orders, pagination } = await apiFetchUserOrders(filters);
    return {
      orders: toEntityList(orders),
      pagination,
    };
  });
}

/**
 * Obtener orden por ID.
 *
 * @param {string} orderId
 * @returns {Promise<OrderEntity>}
 */
export async function fetchOrderById(orderId) {
  return withDomainErrors(async () => {
    const raw = await apiFetchOrderById(orderId);
    return toEntity(raw);
  });
}

/**
 * Obtener tracking de una orden.
 * El backend ya construye el timeline — solo se reenvía.
 *
 * @param {string} orderId
 * @returns {Promise<{ orderNumber, currentStatus, trackingNumber, timeline }>}
 */
export async function fetchOrderTracking(orderId) {
  return withDomainErrors(async () => {
    // Tracking no se convierte a OrderEntity, es un DTO específico del backend
    return apiFetchOrderTracking(orderId);
  });
}

/**
 * Cancelar una orden.
 *
 * @param {string} orderId
 * @returns {Promise<OrderEntity>}
 */
export async function cancelOrder(orderId) {
  return withDomainErrors(async () => {
    const raw = await apiCancelOrder(orderId);
    return toEntity(raw);
  });
}

/**
 * Solicitar devolución de una orden.
 *
 * @param {string} orderId
 * @param {string} reason
 * @returns {Promise<OrderEntity>}
 */
export async function requestReturn(orderId, reason) {
  return withDomainErrors(async () => {
    const raw = await apiRequestReturn(orderId, reason);
    return toEntity(raw);
  });
}

export default {
  createOrder,
  fetchUserOrders,
  fetchOrderById,
  fetchOrderTracking,
  cancelOrder,
  requestReturn,
};