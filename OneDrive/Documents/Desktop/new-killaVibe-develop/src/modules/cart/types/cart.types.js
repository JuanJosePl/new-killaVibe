// cart/types/cart.types.js

/**
 * @module CartTypes
 * @description Constantes y enums para el módulo Cart
 *
 * SINCRONIZADO CON:
 * - cart.model.js (enums del backend)
 * - cart.service.js (validaciones)
 */

export const SHIPPING_METHODS = {
  STANDARD: "standard",
  EXPRESS: "express",
  OVERNIGHT: "overnight",
  PICKUP: "pickup",
};

export const SHIPPING_METHOD_LABELS = {
  [SHIPPING_METHODS.STANDARD]: "Envío Estándar (5-7 días)",
  [SHIPPING_METHODS.EXPRESS]: "Envío Express (2-3 días)",
  [SHIPPING_METHODS.OVERNIGHT]: "Envío Urgente (24 horas)",
  [SHIPPING_METHODS.PICKUP]: "Recoger en Tienda",
};

export const SHIPPING_COSTS = {
  [SHIPPING_METHODS.STANDARD]: 5.99,
  [SHIPPING_METHODS.EXPRESS]: 12.99,
  [SHIPPING_METHODS.OVERNIGHT]: 24.99,
  [SHIPPING_METHODS.PICKUP]: 0,
};

export const CART_STATUS = {
  ACTIVE: "active",
  ABANDONED: "abandoned",
  CONVERTED: "converted",
};

export const COUPON_TYPES = {
  PERCENTAGE: "percentage",
  FIXED: "fixed",
  SHIPPING: "shipping",
};

export const CART_LIMITS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 9999,
  MAX_COUPON_LENGTH: 20,
  MAX_NOTES_LENGTH: 500,
};

export const CART_ERROR_MESSAGES = {
  NOT_FOUND: "Carrito no encontrado",
  PRODUCT_NOT_FOUND: "Producto no encontrado",
  INSUFFICIENT_STOCK: "Stock insuficiente",
  INVALID_QUANTITY: "Cantidad inválida",
  INVALID_COUPON: "Cupón inválido o expirado",
  MIN_PURCHASE_NOT_MET: "No cumple con el monto mínimo de compra",
  INVALID_SHIPPING_METHOD: "Método de envío inválido",
  UNAUTHORIZED: "Debes iniciar sesión para acceder al carrito",
};

export const CART_SUCCESS_MESSAGES = {
  ITEM_ADDED: "Producto agregado al carrito",
  ITEM_UPDATED: "Carrito actualizado",
  ITEM_REMOVED: "Producto eliminado del carrito",
  CART_CLEARED: "Carrito vaciado",
  COUPON_APPLIED: "Cupón aplicado correctamente",
  SHIPPING_UPDATED: "Dirección de envío actualizada",
  SHIPPING_METHOD_UPDATED: "Método de envío actualizado",
};

export const CART_STORAGE_KEYS = {
  GUEST_CART: "killavibes_cart_guest",
  LAST_COUPON: "killavibes_last_coupon",
  SHIPPING_ADDRESS: "killavibes_shipping_address",
};

export const CART_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000,
  KEY: "cart-data",
};

export const VALID_ATTRIBUTES = ["size", "color", "material", "custom"];

export const CART_THRESHOLDS = {
  LOW_STOCK_WARNING: 5,
  // ✅ INTEGRADO: alineado con la lógica real COP del proyecto funcional
  // El funcional usaba 150000 en calculateLocalCartTotals y CartSummary
  MIN_FREE_SHIPPING: 150000,
  ABANDON_TIME_HOURS: 24,
};

// ✅ INTEGRADO: constante de costo base de envío alineada con el funcional
export const DEFAULT_SHIPPING_COST = 15000;

export const DEFAULT_TAX_RATE = 0;

export const EMPTY_CART_STRUCTURE = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  discount: 0,
  total: 0,
  coupon: null,
  shippingMethod: SHIPPING_METHODS.STANDARD,
  shippingCost: SHIPPING_COSTS[SHIPPING_METHODS.STANDARD],
  shippingAddress: null,
  taxRate: DEFAULT_TAX_RATE,
};

export default {
  SHIPPING_METHODS,
  SHIPPING_METHOD_LABELS,
  SHIPPING_COSTS,
  CART_STATUS,
  COUPON_TYPES,
  CART_LIMITS,
  CART_ERROR_MESSAGES,
  CART_SUCCESS_MESSAGES,
  CART_STORAGE_KEYS,
  CART_CACHE_CONFIG,
  VALID_ATTRIBUTES,
  CART_THRESHOLDS,
  DEFAULT_SHIPPING_COST,
  DEFAULT_TAX_RATE,
  EMPTY_CART_STRUCTURE,
};
