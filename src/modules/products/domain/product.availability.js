/**
 * @module product.availability
 * @description Reglas de negocio de disponibilidad de productos.
 *
 * Fuente única de verdad para toda la lógica de disponibilidad.
 * Reemplaza: isProductAvailable, validateProductAvailability,
 * validateStock, isLowStock, isOutOfStock (dispersos en 3 archivos).
 *
 * PURO: Sin React, sin HTTP, sin localStorage, sin efectos secundarios.
 */

import { AVAILABILITY_STATUS, STOCK_LIMITS } from '../types/product.types';

// ─────────────────────────────────────────────
// REGLAS PRIMITIVAS
// ─────────────────────────────────────────────

/**
 * Verifica si el estado del producto permite la venta.
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
const hasValidStatus = (product) => {
  if (!product.status) return true; // sin campo = no bloqueamos
  return product.status === 'active';
};

/**
 * Verifica si la visibilidad permite el acceso público.
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
const hasPublicVisibility = (product) => {
  if (!product.visibility) return true; // sin campo = no bloqueamos
  return product.visibility === 'public';
};

/**
 * Verifica los flags de publicación/activación.
 * Solo bloquea si son explícitamente false.
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
const hasActiveFlags = (product) => {
  if (product.isPublished === false) return false;
  if (product.isActive === false) return false;
  return true;
};

/**
 * Verifica si hay unidades disponibles para venta.
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
const hasStockAvailable = (product) => {
  const trackQuantity = product.trackQuantity === true;

  if (!trackQuantity) return true; // sin control de stock = disponible

  const stock = Number(product.stock ?? 0);
  const allowBackorder = product.allowBackorder === true;

  return stock > 0 || allowBackorder;
};

// ─────────────────────────────────────────────
// API PÚBLICA
// ─────────────────────────────────────────────

/**
 * Regla maestra: ¿puede comprarse este producto ahora?
 *
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const canPurchase = (product) => {
  if (!product) return false;
  return (
    hasValidStatus(product) &&
    hasPublicVisibility(product) &&
    hasActiveFlags(product) &&
    hasStockAvailable(product)
  );
};

/**
 * ¿Puede el usuario agregar `requestedQty` unidades,
 * dado que ya tiene `currentCartQty` en el carrito?
 *
 * @param {import('./product.entity').Product} product
 * @param {number} requestedQty      - Cantidad que quiere agregar
 * @param {number} [currentCartQty]  - Cantidad ya en el carrito
 * @returns {{ allowed: boolean, reason?: string, remaining?: number }}
 */
export const canAddQuantity = (product, requestedQty, currentCartQty = 0) => {
  if (!product) {
    return { allowed: false, reason: 'PRODUCT_NOT_FOUND' };
  }

  if (!canPurchase(product)) {
    return { allowed: false, reason: 'PRODUCT_UNAVAILABLE' };
  }

  // Sin control de stock: siempre permitido
  if (!product.trackQuantity) {
    return { allowed: true };
  }

  const stock = Number(product.stock ?? 0);
  const allowBackorder = product.allowBackorder === true;
  const totalRequested = currentCartQty + requestedQty;

  if (allowBackorder) {
    return { allowed: true, backorder: true };
  }

  if (totalRequested > stock) {
    const remaining = Math.max(0, stock - currentCartQty);
    return {
      allowed: false,
      reason: 'STOCK_EXCEEDED',
      remaining,
      stock,
      currentCartQty,
    };
  }

  return { allowed: true, remaining: stock - totalRequested };
};

/**
 * Obtiene el estado de disponibilidad del producto.
 *
 * @param {import('./product.entity').Product} product
 * @returns {import('../types/product.types').AvailabilityStatus}
 */
export const getAvailabilityStatus = (product) => {
  if (!product) return AVAILABILITY_STATUS.UNAVAILABLE;

  if (!hasValidStatus(product) || !hasPublicVisibility(product) || !hasActiveFlags(product)) {
    return AVAILABILITY_STATUS.UNAVAILABLE;
  }

  const trackQuantity = product.trackQuantity === true;

  if (!trackQuantity) return AVAILABILITY_STATUS.AVAILABLE;

  const stock = Number(product.stock ?? 0);
  const threshold = Number(product.lowStockThreshold ?? STOCK_LIMITS.LOW_THRESHOLD_DEFAULT);
  const allowBackorder = product.allowBackorder === true;

  if (stock === 0 && allowBackorder) return AVAILABILITY_STATUS.BACKORDER;
  if (stock === 0) return AVAILABILITY_STATUS.OUT_OF_STOCK;
  if (stock <= threshold) return AVAILABILITY_STATUS.LOW_STOCK;

  return AVAILABILITY_STATUS.AVAILABLE;
};

/**
 * ¿Tiene stock bajo (por encima de 0 pero bajo el umbral)?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const isLowStock = (product) => {
  if (!product) return false;
  return getAvailabilityStatus(product) === AVAILABILITY_STATUS.LOW_STOCK;
};

/**
 * ¿Está completamente agotado (sin backorder)?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const isOutOfStock = (product) => {
  if (!product) return true;
  return getAvailabilityStatus(product) === AVAILABILITY_STATUS.OUT_OF_STOCK;
};

/**
 * ¿Está disponible solo vía backorder?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const isBackorder = (product) => {
  if (!product) return false;
  return getAvailabilityStatus(product) === AVAILABILITY_STATUS.BACKORDER;
};

/**
 * Cuántas unidades puede agregar aún dado lo que ya tiene en el carrito.
 * Retorna Infinity si no hay control de stock.
 *
 * @param {import('./product.entity').Product} product
 * @param {number} [currentCartQty]
 * @returns {number}
 */
export const getRemainingStock = (product, currentCartQty = 0) => {
  if (!product || !product.trackQuantity) return Infinity;
  if (product.allowBackorder) return Infinity;
  return Math.max(0, Number(product.stock ?? 0) - currentCartQty);
};