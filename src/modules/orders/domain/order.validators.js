// modules/orders/domain/order.validators.js
//
// Validadores de inputs del dominio Order para el frontend.
// Espeja exactamente los schemas Joi de order.validation.js del backend.
// NO valida reglas de negocio (eso es order.rules.js).
// Valida estructura y formato de los datos de entrada.

import { PAYMENT_METHOD } from './order.model.js';

// ============================================
// SCHEMA DE DIRECCIÓN
// Espeja: addressSchema de order.validation.js
// ============================================

/**
 * Validar estructura de dirección de envío/facturación
 * @param {Object} address
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAddress(address) {
  const errors = [];

  if (!address || typeof address !== 'object') {
    return { valid: false, errors: ['La dirección es requerida'] };
  }

  if (!address.firstName?.trim() || address.firstName.trim().length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  }
  if (address.firstName?.trim().length > 50) {
    errors.push('El nombre no puede superar 50 caracteres');
  }

  if (!address.lastName?.trim() || address.lastName.trim().length < 2) {
    errors.push('El apellido debe tener al menos 2 caracteres');
  }
  if (address.lastName?.trim().length > 50) {
    errors.push('El apellido no puede superar 50 caracteres');
  }

  if (!address.street?.trim() || address.street.trim().length < 5) {
    errors.push('La dirección debe tener al menos 5 caracteres');
  }

  if (!address.city?.trim() || address.city.trim().length < 2) {
    errors.push('La ciudad es requerida');
  }

  if (!address.state?.trim() || address.state.trim().length < 2) {
    errors.push('El departamento/estado es requerido');
  }

  if (!address.zipCode?.trim() || address.zipCode.trim().length < 3) {
    errors.push('El código postal es requerido');
  }

  if (!address.phone?.trim()) {
    errors.push('El teléfono es requerido');
  } else if (!/^[0-9\s\-\+()]+$/.test(address.phone.trim())) {
    errors.push('El teléfono solo puede contener números, espacios y símbolos +, -, ()');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// CREAR ORDEN
// Espeja: createOrder body de order.validation.js
// ============================================

/**
 * Validar datos de creación de orden
 * @param {Object} data
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateCreateOrder(data) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Los datos de la orden son requeridos'] };
  }

  // shippingAddress requerida
  const addressResult = validateAddress(data.shippingAddress);
  if (!addressResult.valid) {
    errors.push(...addressResult.errors.map(e => `shippingAddress: ${e}`));
  }

  // billingAddress opcional pero si existe debe ser válida
  if (data.billingAddress) {
    const billingResult = validateAddress(data.billingAddress);
    if (!billingResult.valid) {
      errors.push(...billingResult.errors.map(e => `billingAddress: ${e}`));
    }
  }

  // paymentMethod requerido
  const validMethods = Object.values(PAYMENT_METHOD);
  if (!data.paymentMethod) {
    errors.push('El método de pago es requerido');
  } else if (!validMethods.includes(data.paymentMethod)) {
    errors.push(`Método de pago inválido. Válidos: ${validMethods.join(', ')}`);
  }

  // customerNotes opcional, max 500
  if (data.customerNotes && data.customerNotes.length > 500) {
    errors.push('Las notas no pueden superar 500 caracteres');
  }

  return { valid: errors.length === 0, errors };
}

// ============================================
// FILTROS DE LISTADO
// Espeja: getUserOrders query de order.validation.js
// ============================================

/**
 * Sanitizar y validar filtros de listado de órdenes
 * @param {Object} filters
 * @returns {{ sanitized: Object, errors: string[] }}
 */
export function sanitizeOrderFilters(filters = {}) {
  const errors     = [];
  const sanitized  = {};

  const page = parseInt(filters.page, 10);
  sanitized.page = isNaN(page) || page < 1 ? 1 : page;

  const limit = parseInt(filters.limit, 10);
  sanitized.limit = isNaN(limit) || limit < 1 ? 10 : Math.min(limit, 100);

  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];
  if (filters.status) {
    if (!validStatuses.includes(filters.status)) {
      errors.push(`Estado inválido: ${filters.status}`);
    } else {
      sanitized.status = filters.status;
    }
  }

  const validSortBy = ['createdAt', 'totalAmount', 'status'];
  sanitized.sortBy = validSortBy.includes(filters.sortBy) ? filters.sortBy : 'createdAt';

  sanitized.sortOrder = filters.sortOrder === 'asc' ? 'asc' : 'desc';

  return { sanitized, errors };
}