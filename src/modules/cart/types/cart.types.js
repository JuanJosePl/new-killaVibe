/**
 * @module CartTypes
 * @description Constantes y enums para el módulo Cart
 * 
 * SINCRONIZADO CON:
 * - cart.model.js (enums del backend)
 * - cart.service.js (validaciones)
 */

/**
 * MÉTODOS DE ENVÍO
 * Enum sincronizado con cart.model.js -> shippingMethod
 */
export const SHIPPING_METHODS = {
  STANDARD: 'standard',
  EXPRESS: 'express',
  OVERNIGHT: 'overnight',
  PICKUP: 'pickup'
};

/**
 * LABELS DE MÉTODOS DE ENVÍO
 */
export const SHIPPING_METHOD_LABELS = {
  [SHIPPING_METHODS.STANDARD]: 'Envío Estándar (5-7 días)',
  [SHIPPING_METHODS.EXPRESS]: 'Envío Express (2-3 días)',
  [SHIPPING_METHODS.OVERNIGHT]: 'Envío Urgente (24 horas)',
  [SHIPPING_METHODS.PICKUP]: 'Recoger en Tienda'
};

/**
 * COSTOS DE ENVÍO POR DEFECTO
 */
export const SHIPPING_COSTS = {
  [SHIPPING_METHODS.STANDARD]: 5.99,
  [SHIPPING_METHODS.EXPRESS]: 12.99,
  [SHIPPING_METHODS.OVERNIGHT]: 24.99,
  [SHIPPING_METHODS.PICKUP]: 0
};

/**
 * ESTADOS DEL CARRITO
 * Enum sincronizado con cart.model.js -> status
 */
export const CART_STATUS = {
  ACTIVE: 'active',
  ABANDONED: 'abandoned',
  CONVERTED: 'converted'
};

/**
 * TIPOS DE CUPÓN
 * Enum sincronizado con cart.model.js -> coupon.type
 */
export const COUPON_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  SHIPPING: 'shipping'
};

/**
 * LÍMITES Y RESTRICCIONES
 * Sincronizado con cart.validation.js
 */
export const CART_LIMITS = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 9999,
  MAX_COUPON_LENGTH: 20,
  MAX_NOTES_LENGTH: 500
};

/**
 * MENSAJES DE ERROR ESTÁNDAR
 */
export const CART_ERROR_MESSAGES = {
  NOT_FOUND: 'Carrito no encontrado',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  INSUFFICIENT_STOCK: 'Stock insuficiente',
  INVALID_QUANTITY: 'Cantidad inválida',
  INVALID_COUPON: 'Cupón inválido o expirado',
  MIN_PURCHASE_NOT_MET: 'No cumple con el monto mínimo de compra',
  INVALID_SHIPPING_METHOD: 'Método de envío inválido',
  UNAUTHORIZED: 'Debes iniciar sesión para acceder al carrito'
};

/**
 * MENSAJES DE ÉXITO ESTÁNDAR
 */
export const CART_SUCCESS_MESSAGES = {
  ITEM_ADDED: 'Producto agregado al carrito',
  ITEM_UPDATED: 'Carrito actualizado',
  ITEM_REMOVED: 'Producto eliminado del carrito',
  CART_CLEARED: 'Carrito vaciado',
  COUPON_APPLIED: 'Cupón aplicado correctamente',
  SHIPPING_UPDATED: 'Dirección de envío actualizada',
  SHIPPING_METHOD_UPDATED: 'Método de envío actualizado'
};

/**
 * CLAVES DE STORAGE LOCAL
 */
export const CART_STORAGE_KEYS = {
  GUEST_CART: 'guestCart',
  LAST_COUPON: 'lastCouponUsed',
  SHIPPING_ADDRESS: 'lastShippingAddress'
};

/**
 * CONFIGURACIÓN DE CACHÉ
 */
export const CART_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
  KEY: 'cart-data'
};

/**
 * VALIDACIÓN DE ATRIBUTOS
 */
export const VALID_ATTRIBUTES = ['size', 'color', 'material', 'custom'];

/**
 * UMBRALES DE ALERTA
 */
export const CART_THRESHOLDS = {
  LOW_STOCK_WARNING: 5,
  MIN_FREE_SHIPPING: 50,
  ABANDON_TIME_HOURS: 24
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
  CART_THRESHOLDS
};