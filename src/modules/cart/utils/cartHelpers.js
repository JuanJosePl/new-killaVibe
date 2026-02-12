import {
  SHIPPING_METHOD_LABELS,
  SHIPPING_COSTS,
  COUPON_TYPES,
  CART_THRESHOLDS
} from '../types/cart.types';

/**
 * @module CartHelpers
 * @description Funciones utilidad para el módulo Cart
 * 
 * 25+ funciones para:
 * - Cálculos de totales
 * - Formateo de precios
 * - Validaciones
 * - Comparaciones
 * - Helpers de UI
 */



// ============================================================================
// CÁLCULOS DE TOTALES
// ============================================================================

/**
 * Calcula subtotal del carrito
 * @param {Array} items - Items del carrito
 * @returns {number} Subtotal
 */

export const calculateSubtotal = (items = []) => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

/**
 * Calcula descuento de cupón
 * @param {number} subtotal - Subtotal del carrito
 * @param {Object} coupon - Objeto cupón
 * @returns {number} Monto de descuento
 */
export const calculateCouponDiscount = (subtotal, coupon) => {
  if (!coupon?.code) return 0;

  if (coupon.type === COUPON_TYPES.PERCENTAGE) {
    return (subtotal * coupon.discount) / 100;
  } else if (coupon.type === COUPON_TYPES.FIXED) {
    return Math.min(coupon.discount, subtotal);
  }

  return 0;
};

/**
 * Calcula descuento en envío
 * @param {number} shippingCost - Costo de envío
 * @param {Object} coupon - Objeto cupón
 * @returns {number} Descuento en envío
 */
export const calculateShippingDiscount = (shippingCost, coupon) => {
  if (!coupon?.code || coupon.type !== COUPON_TYPES.SHIPPING) return 0;
  return Math.min(coupon.discount, shippingCost);
};

/**
 * Calcula impuestos
 * @param {number} amount - Monto base
 * @param {number} taxRate - Tasa de impuesto (%)
 * @returns {number} Monto de impuestos
 */
export const calculateTax = (amount, taxRate = 19) => {
  return (amount * taxRate) / 100;
};

/**
 * Calcula total del carrito
 * @param {Object} cart - Objeto carrito completo
 * @returns {number} Total
 */
export const calculateTotal = (cart) => {
  if (!cart) return 0;

  const subtotal = cart.subtotal || calculateSubtotal(cart.items);
  const couponDiscount = calculateCouponDiscount(subtotal, cart.coupon);
  const shippingDiscount = calculateShippingDiscount(cart.shippingCost, cart.coupon);
  
  const beforeTax = subtotal - couponDiscount + (cart.shippingCost - shippingDiscount);
  const tax = calculateTax(beforeTax, cart.taxRate);
  
  return Math.max(0, beforeTax + tax);
};

/**
 * Calcula cantidad total de items
 * @param {Array} items - Items del carrito
 * @returns {number} Cantidad total
 */
export const calculateItemCount = (items = []) => {
  return items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * Calcula cantidad de productos únicos
 * @param {Array} items - Items del carrito
 * @returns {number} Productos únicos
 */
export const calculateUniqueItems = (items = []) => {
  return items.length;
};

// ============================================================================
// FORMATEO DE PRECIOS
// ============================================================================

/**
 * Formatea precio a moneda
 * @param {number} amount - Monto
 * @param {string} currency - Código de moneda
 * @returns {string} Precio formateado
 */
export const formatPrice = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

/**
 * Formatea descuento según tipo
 * @param {Object} coupon - Objeto cupón
 * @returns {string} Descuento formateado
 */
export const formatDiscount = (coupon) => {
  if (!coupon) return '';

  if (coupon.type === COUPON_TYPES.PERCENTAGE) {
    return `-${coupon.discount}%`;
  } else if (coupon.type === COUPON_TYPES.FIXED) {
    return `-${formatPrice(coupon.discount)}`;
  } else if (coupon.type === COUPON_TYPES.SHIPPING) {
    return `Envío gratis`;
  }

  return '';
};

/**
 * Formatea porcentaje de ahorro
 * @param {number} original - Precio original
 * @param {number} final - Precio final
 * @returns {string} Porcentaje de ahorro
 */
export const formatSavingsPercentage = (original, final) => {
  if (original <= final) return '';
  const savings = ((original - final) / original) * 100;
  return `${savings.toFixed(0)}%`;
};

// ============================================================================
// VALIDACIONES Y VERIFICACIONES
// ============================================================================

/**
 * Verifica si el carrito está vacío
 * @param {Object} cart - Objeto carrito
 * @returns {boolean}
 */
export const isCartEmpty = (cart) => {
  return !cart || !cart.items || cart.items.length === 0;
};

/**
 * Verifica si hay cupón aplicado
 * @param {Object} cart - Objeto carrito
 * @returns {boolean}
 */
export const hasCouponApplied = (cart) => {
  return !!(cart?.coupon?.code);
};

/**
 * Verifica si cumple con envío gratis
 * @param {number} subtotal - Subtotal
 * @param {number} threshold - Umbral para envío gratis
 * @returns {boolean}
 */
export const qualifiesForFreeShipping = (subtotal, threshold = CART_THRESHOLDS.MIN_FREE_SHIPPING) => {
  return subtotal >= threshold;
};

/**
 * Calcula cuánto falta para envío gratis
 * @param {number} subtotal - Subtotal
 * @param {number} threshold - Umbral
 * @returns {number} Monto faltante
 */
export const amountForFreeShipping = (subtotal, threshold = CART_THRESHOLDS.MIN_FREE_SHIPPING) => {
  return Math.max(0, threshold - subtotal);
};

/**
 * Verifica si producto está en carrito
 * @param {Array} items - Items del carrito
 * @param {string} productId - ID del producto
 * @param {Object} attributes - Atributos opcionales
 * @returns {boolean}
 */
export const isProductInCart = (items = [], productId, attributes = {}) => {
  return items.some(item => 
    item.product._id === productId &&
    JSON.stringify(item.attributes) === JSON.stringify(attributes)
  );
};

/**
 * Encuentra item en carrito
 * @param {Array} items - Items del carrito
 * @param {string} productId - ID del producto
 * @param {Object} attributes - Atributos
 * @returns {Object|null} Item encontrado
 */
export const findCartItem = (items = [], productId, attributes = {}) => {
  return items.find(item =>
    item.product._id === productId &&
    JSON.stringify(item.attributes) === JSON.stringify(attributes)
  ) || null;
};

/**
 * Verifica si hay productos con bajo stock
 * @param {Array} items - Items del carrito
 * @returns {boolean}
 */
export const hasLowStockItems = (items = []) => {
  return items.some(item => 
    item.product.stock > 0 && 
    item.product.stock <= CART_THRESHOLDS.LOW_STOCK_WARNING
  );
};

/**
 * Obtiene items con bajo stock
 * @param {Array} items - Items del carrito
 * @returns {Array} Items con bajo stock
 */
export const getLowStockItems = (items = []) => {
  return items.filter(item =>
    item.product.stock > 0 &&
    item.product.stock <= CART_THRESHOLDS.LOW_STOCK_WARNING
  );
};

// ============================================================================
// HELPERS DE UI
// ============================================================================

/**
 * Obtiene label del método de envío
 * @param {string} method - Método de envío
 * @returns {string} Label
 */
export const getShippingMethodLabel = (method) => {
  return SHIPPING_METHOD_LABELS[method] || method;
};

/**
 * Obtiene costo del método de envío
 * @param {string} method - Método de envío
 * @returns {number} Costo
 */
export const getShippingCost = (method) => {
  return SHIPPING_COSTS[method] || 0;
};

/**
 * Genera resumen del carrito para checkout
 * @param {Object} cart - Objeto carrito
 * @returns {Object} Resumen
 */
export const generateCartSummary = (cart) => {
  const subtotal = cart.subtotal || calculateSubtotal(cart.items);
  const discount = calculateCouponDiscount(subtotal, cart.coupon);
  
  // Regla estricta de envío gratis
  const FREE_SHIPPING_THRESHOLD = 150000;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCostBase = cart.shippingCost || 15000; // Valor por defecto si no hay
  const shipping = isFreeShipping ? 0 : shippingCostBase;
  
  // Impuesto sobre el subtotal (IVA 19%)
  const tax = calculateTax(subtotal - discount, 19);
  
  // Total final
  const total = (subtotal - discount) + shipping;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount: calculateItemCount(cart.items),
    savings: discount,
    freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  };
};

/**
 * Formatea atributos para display
 * @param {Object} attributes - Atributos
 * @returns {string} String formateado
 */
export const formatAttributes = (attributes = {}) => {
  const parts = [];
  
  if (attributes.size) parts.push(`Talla: ${attributes.size}`);
  if (attributes.color) parts.push(`Color: ${attributes.color}`);
  if (attributes.material) parts.push(`Material: ${attributes.material}`);
  
  return parts.join(' | ');
};

/**
 * Genera mensaje de stock
 * @param {number} stock - Stock disponible
 * @returns {string} Mensaje
 */
export const getStockMessage = (stock) => {
  if (stock === 0) return 'Sin stock';
  if (stock <= CART_THRESHOLDS.LOW_STOCK_WARNING) {
    return `¡Solo quedan ${stock}!`;
  }
  return 'En stock';
};

/**
 * Valida cupón por fecha
 * @param {Object} coupon - Objeto cupón
 * @returns {boolean}
 */
export const isCouponValid = (coupon) => {
  if (!coupon) return false;
  if (!coupon.expiresAt) return true;
  return new Date(coupon.expiresAt) > new Date();
};

/**
 * Compara dos sets de atributos
 * @param {Object} attr1 - Atributos 1
 * @param {Object} attr2 - Atributos 2
 * @returns {boolean}
 */
export const areAttributesEqual = (attr1 = {}, attr2 = {}) => {
  return JSON.stringify(attr1) === JSON.stringify(attr2);
};

export default {
  calculateSubtotal,
  calculateCouponDiscount,
  calculateShippingDiscount,
  calculateTax,
  calculateTotal,
  calculateItemCount,
  calculateUniqueItems,
  formatPrice,
  formatDiscount,
  formatSavingsPercentage,
  isCartEmpty,
  hasCouponApplied,
  qualifiesForFreeShipping,
  amountForFreeShipping,
  isProductInCart,
  findCartItem,
  hasLowStockItems,
  getLowStockItems,
  getShippingMethodLabel,
  getShippingCost,
  generateCartSummary,
  formatAttributes,
  getStockMessage,
  isCouponValid,
  areAttributesEqual
};