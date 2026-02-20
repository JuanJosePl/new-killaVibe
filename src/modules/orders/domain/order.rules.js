// modules/orders/domain/order.rules.js
//
// Reglas de negocio puras del dominio Order.
// Espeja las validaciones de order.model.js (Mongoose methods) y order.service.js.
// Sin dependencias de React, Zustand, Router, ni API.

import { ORDER_STATUS, PAYMENT_STATUS, RETURN_WINDOW_DAYS } from './order.model.js';

/**
 * @namespace OrderRules
 * @description Reglas de dominio puras. Todas reciben datos y retornan boolean o string.
 */

/**
 * ¿Puede cancelarse la orden?
 * Espeja: OrderEntity.canBeCancelled + order.model.js#cancelOrder()
 *
 * @param {OrderEntity|Object} order
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canCancelOrder(order) {
  if (!order) return { allowed: false, reason: 'Orden no válida' };

  if (!['pending', 'confirmed'].includes(order.status)) {
    return {
      allowed: false,
      reason: `No se puede cancelar una orden en estado "${order.status}"`,
    };
  }

  if (order.paymentStatus === PAYMENT_STATUS.PAID) {
    return {
      allowed: false,
      reason: 'No se puede cancelar una orden pagada. Debe solicitar reembolso.',
    };
  }

  if (order.paymentStatus === PAYMENT_STATUS.REFUNDED) {
    return { allowed: false, reason: 'La orden ya fue reembolsada' };
  }

  return { allowed: true };
}

/**
 * ¿Puede solicitarse devolución?
 * Espeja: order.service.js#requestReturn()
 *
 * @param {OrderEntity|Object} order
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canReturnOrder(order) {
  if (!order) return { allowed: false, reason: 'Orden no válida' };

  if (order.status !== ORDER_STATUS.DELIVERED) {
    return {
      allowed: false,
      reason: 'Solo se pueden devolver órdenes entregadas',
    };
  }

  if (!order.deliveredAt) {
    return { allowed: false, reason: 'La orden no tiene fecha de entrega registrada' };
  }

  const windowMs   = RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const deliveredAt = new Date(order.deliveredAt).getTime();
  const now         = Date.now();

  if (now - deliveredAt > windowMs) {
    return {
      allowed: false,
      reason: `El período de devolución ha expirado (${RETURN_WINDOW_DAYS} días)`,
    };
  }

  return { allowed: true };
}

/**
 * ¿Puede reembolsarse la orden?
 * Espeja: OrderEntity.canBeRefunded + order.model.js#processRefund()
 *
 * @param {OrderEntity|Object} order
 * @returns {{ allowed: boolean, maxAmount?: number, reason?: string }}
 */
export function canRefundOrder(order) {
  if (!order) return { allowed: false, reason: 'Orden no válida' };

  if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    return { allowed: false, reason: 'Solo se pueden reembolsar órdenes pagadas' };
  }

  const maxAmount = (order.totalAmount ?? 0) - (order.refundAmount ?? 0);

  if (maxAmount <= 0) {
    return { allowed: false, reason: 'La orden ya fue completamente reembolsada' };
  }

  return { allowed: true, maxAmount };
}

/**
 * ¿El estado destino es una transición válida?
 * Espeja la state machine implícita en order.model.js methods.
 *
 * @param {string} currentStatus
 * @param {string} targetStatus
 * @returns {{ valid: boolean, reason?: string }}
 */
export function isValidStatusTransition(currentStatus, targetStatus) {
  const transitions = {
    [ORDER_STATUS.PENDING]:    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.CONFIRMED]:  [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.SHIPPED]:    [ORDER_STATUS.DELIVERED],
    [ORDER_STATUS.DELIVERED]:  [ORDER_STATUS.RETURNED],
    [ORDER_STATUS.CANCELLED]:  [],
    [ORDER_STATUS.RETURNED]:   [],
  };

  const allowed = transitions[currentStatus] ?? [];

  if (!allowed.includes(targetStatus)) {
    return {
      valid: false,
      reason: `Transición inválida: ${currentStatus} → ${targetStatus}`,
    };
  }

  return { valid: true };
}

/**
 * Validar razón de devolución
 * Espeja: order.validation.js#requestReturn body + order.service.js
 *
 * @param {string} reason
 * @returns {{ valid: boolean, reason?: string }}
 */
export function validateReturnReason(reason) {
  if (!reason || typeof reason !== 'string') {
    return { valid: false, reason: 'La razón de devolución es requerida' };
  }

  const trimmed = reason.trim();

  if (trimmed.length < 10) {
    return { valid: false, reason: 'La razón debe tener al menos 10 caracteres' };
  }

  if (trimmed.length > 500) {
    return { valid: false, reason: 'La razón no puede superar los 500 caracteres' };
  }

  return { valid: true };
}

/**
 * Días restantes para poder solicitar devolución
 *
 * @param {Date|string} deliveredAt
 * @returns {number} Días restantes (negativo = expirado)
 */
export function returnWindowDaysRemaining(deliveredAt) {
  if (!deliveredAt) return 0;
  const deliveryTime = new Date(deliveredAt).getTime();
  const expiresAt    = deliveryTime + RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const remaining    = Math.ceil((expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
  return remaining;
}