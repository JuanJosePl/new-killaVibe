// modules/orders/application/orders.service.js
//
// Capa de aplicación: orquesta repositorio + reglas de dominio.
// Responsabilidades:
//   - Coordinar flujos de casos de uso
//   - Aplicar validadores antes de llamar al repositorio
//   - Preparar datos para la capa de presentación
//   - NO conoce React, Zustand, ni componentes
//   - NO contiene lógica HTTP directa

import * as repository from '../infrastructure/orders.repository.js';
import { canCancelOrder, canReturnOrder, validateReturnReason } from '../domain/order.rules.js';
import { validateCreateOrder, sanitizeOrderFilters } from '../domain/order.validators.js';
import { OrderCancelNotAllowedError, OrderReturnNotAllowedError, OrderValidationError } from '../domain/order.errors.js';
import { ORDER_STATUS } from '../domain/order.model.js';

/**
 * Crear orden desde el carrito del usuario.
 * Valida el payload antes de enviarlo al backend.
 * El backend valida stock y genera totales.
 *
 * @param {Object} orderData
 * @returns {Promise<OrderEntity>}
 */
export async function createOrder(orderData) {
  const { valid, errors } = validateCreateOrder(orderData);
  if (!valid) throw new OrderValidationError(errors);

  return repository.createOrder(orderData);
}

/**
 * Obtener órdenes paginadas del usuario.
 * Sanitiza filtros antes de enviar.
 *
 * @param {Object} rawFilters
 * @returns {Promise<{ orders: OrderEntity[], pagination: Object }>}
 */
export async function getUserOrders(rawFilters = {}) {
  const { sanitized, errors } = sanitizeOrderFilters(rawFilters);
  if (errors.length > 0) throw new OrderValidationError(errors);

  return repository.fetchUserOrders(sanitized);
}

/**
 * Obtener detalle de una orden por ID.
 *
 * @param {string} orderId
 * @returns {Promise<OrderEntity>}
 */
export async function getOrderById(orderId) {
  return repository.fetchOrderById(orderId);
}

/**
 * Obtener tracking de una orden.
 * El backend construye el timeline completo.
 *
 * @param {string} orderId
 * @returns {Promise<{ orderNumber, currentStatus, trackingNumber, timeline }>}
 */
export async function getOrderTracking(orderId) {
  return repository.fetchOrderTracking(orderId);
}

/**
 * Cancelar una orden.
 * Valida la regla de dominio antes de llamar al backend.
 *
 * @param {OrderEntity} order - Entidad ya cargada (para validar localmente)
 * @returns {Promise<OrderEntity>}
 */
export async function cancelOrder(order) {
  const { allowed, reason } = canCancelOrder(order);
  if (!allowed) throw new OrderCancelNotAllowedError(reason);

  return repository.cancelOrder(order._id);
}

/**
 * Solicitar devolución de una orden.
 * Valida regla de dominio (30 días, status=delivered) y razón.
 *
 * @param {OrderEntity} order - Entidad ya cargada
 * @param {string} reason
 * @returns {Promise<OrderEntity>}
 */
export async function requestReturn(order, reason) {
  const reasonCheck = validateReturnReason(reason);
  if (!reasonCheck.valid) throw new OrderValidationError([reasonCheck.reason]);

  const returnCheck = canReturnOrder(order);
  if (!returnCheck.allowed) throw new OrderReturnNotAllowedError(returnCheck.reason);

  return repository.requestReturn(order._id, reason);
}

/**
 * Filtrar una lista de entidades por estado (operación local, sin red).
 *
 * @param {OrderEntity[]} orders
 * @param {string|null} status - null retorna todos
 * @returns {OrderEntity[]}
 */
export function filterOrdersByStatus(orders, status) {
  if (!status || status === 'all') return orders;
  return orders.filter(o => o.status === status);
}

/**
 * Calcular estadísticas de una lista de órdenes (operación local).
 *
 * @param {OrderEntity[]} orders
 * @returns {Object} stats
 */
export function computeOrderStats(orders) {
  const stats = {
    total:      orders.length,
    pending:    0,
    processing: 0,
    shipped:    0,
    delivered:  0,
    cancelled:  0,
    returned:   0,
    totalSpent: 0,
  };

  for (const order of orders) {
    if (order.status in stats) {
      stats[order.status] += 1;
    }
    if (order.paymentStatus === 'paid') {
      stats.totalSpent += order.totalAmount;
    }
  }

  return stats;
}

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  getOrderTracking,
  cancelOrder,
  requestReturn,
  filterOrdersByStatus,
  computeOrderStats,
};