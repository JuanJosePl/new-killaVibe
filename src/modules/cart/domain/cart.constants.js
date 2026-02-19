/**
 * @module cart.constants
 * @description Constantes del dominio Cart. Única fuente de verdad.
 * Consolidado desde cart.types.js. El archivo cart.types.js antiguo
 * puede re-exportar desde aquí para compatibilidad durante migración.
 */

export const SHIPPING_METHODS = Object.freeze({
  STANDARD:  'standard',
  EXPRESS:   'express',
  OVERNIGHT: 'overnight',
  PICKUP:    'pickup',
});

export const SHIPPING_METHOD_LABELS = Object.freeze({
  [SHIPPING_METHODS.STANDARD]:  'Envío Estándar (5-7 días)',
  [SHIPPING_METHODS.EXPRESS]:   'Envío Express (2-3 días)',
  [SHIPPING_METHODS.OVERNIGHT]: 'Envío Urgente (24 horas)',
  [SHIPPING_METHODS.PICKUP]:    'Recoger en Tienda',
});

export const SHIPPING_COSTS = Object.freeze({
  [SHIPPING_METHODS.STANDARD]:  15000,
  [SHIPPING_METHODS.EXPRESS]:   25000,
  [SHIPPING_METHODS.OVERNIGHT]: 45000,
  [SHIPPING_METHODS.PICKUP]:    0,
});

export const COUPON_TYPES = Object.freeze({
  PERCENTAGE: 'percentage',
  FIXED:      'fixed',
  SHIPPING:   'shipping',
});

export const CART_LIMITS = Object.freeze({
  MIN_QUANTITY:     1,
  MAX_QUANTITY:     9999,
  MAX_COUPON_LENGTH: 20,
  MAX_NOTES_LENGTH:  500,
});

export const CART_THRESHOLDS = Object.freeze({
  LOW_STOCK_WARNING:  5,
  MIN_FREE_SHIPPING:  150000,
  ABANDON_TIME_HOURS: 24,
});

export const DEFAULT_SHIPPING_COST = 15000;
export const DEFAULT_TAX_RATE      = 0;

export const CART_STORAGE_KEY = 'killavibes_cart_guest';

// Legacy key — mantenida por compatibilidad con CartContext viejo
export const CART_STORAGE_KEYS = Object.freeze({
  GUEST_CART:       'killavibes_cart_guest',
  LAST_COUPON:      'killavibes_last_coupon',
  SHIPPING_ADDRESS: 'killavibes_shipping_address',
});

export const CART_CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const EMPTY_CART_STRUCTURE = Object.freeze({
  items:           [],
  subtotal:        0,
  tax:             0,
  shipping:        0,
  shippingCost:    SHIPPING_COSTS[SHIPPING_METHODS.STANDARD],
  discount:        0,
  total:           0,
  coupon:          null,
  shippingMethod:  SHIPPING_METHODS.STANDARD,
  shippingAddress: null,
  taxRate:         DEFAULT_TAX_RATE,
  itemCount:       0,
});