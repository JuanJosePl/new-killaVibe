/**
 * @module cart.rules
 * @description Reglas de negocio puras del dominio Cart.
 * Sin efectos secundarios. Input → boolean / valor.
 * Usadas por validators, store y sync service.
 */

import { CART_THRESHOLDS, SHIPPING_METHODS, SHIPPING_COSTS, DEFAULT_SHIPPING_COST } from './cart.constants';

/**
 * ¿El subtotal califica para envío gratis?
 */
export const qualifiesForFreeShipping = (subtotal) =>
  Number(subtotal) >= CART_THRESHOLDS.MIN_FREE_SHIPPING;

/**
 * ¿Cuánto falta para envío gratis?
 */
export const amountForFreeShipping = (subtotal) =>
  Math.max(0, CART_THRESHOLDS.MIN_FREE_SHIPPING - Number(subtotal));

/**
 * Calcula el costo de envío según subtotal y método.
 * Si el subtotal califica, siempre es 0 (aplica a todos los métodos).
 */
export const calculateShippingCost = (subtotal, method = SHIPPING_METHODS.STANDARD) => {
  if (qualifiesForFreeShipping(subtotal)) return 0;
  return SHIPPING_COSTS[method] ?? DEFAULT_SHIPPING_COST;
};

/**
 * ¿Hay stock suficiente para agregar la cantidad solicitada?
 */
export const hasEnoughStock = (requestedQty, availableStock, trackQuantity = false) => {
  if (!trackQuantity) return true;
  return Number(requestedQty) <= Number(availableStock);
};

/**
 * ¿El item está en stock bajo?
 */
export const isLowStock = (stock) => {
  const s = Number(stock) || 0;
  return s > 0 && s <= CART_THRESHOLDS.LOW_STOCK_WARNING;
};

/**
 * ¿El carrito tiene algún item sin stock?
 */
export const hasOutOfStockItems = (items = []) =>
  items.some(item => (Number(item.product?.stock) || 0) === 0);

/**
 * ¿El carrito tiene items con stock bajo?
 */
export const hasLowStockItems = (items = []) =>
  items.some(item => isLowStock(item.product?.stock));

/**
 * ¿El cupón sigue vigente?
 */
export const isCouponValid = (coupon) => {
  if (!coupon?.code) return false;
  if (!coupon.expiresAt) return true;
  return new Date(coupon.expiresAt) > new Date();
};

/**
 * ¿El carrito está vacío?
 */
export const isCartEmpty = (cart) =>
  !cart || !cart.items || cart.items.length === 0;

/**
 * ¿El carrito tiene cupón aplicado?
 */
export const hasCouponApplied = (cart) => Boolean(cart?.coupon?.code);

/**
 * Verifica si un producto (con sus atributos) ya está en el carrito.
 * Usa comparación exacta de atributos.
 */
export const isProductInCart = (items = [], productId, attributes = {}) => {
  if (!Array.isArray(items) || !productId) return false;
  return items.some(item => {
    if (item.productId !== String(productId)) return false;
    return _attrsEqual(item.attributes, attributes);
  });
};

/**
 * Busca un item en el carrito por productId + attributes.
 */
export const findCartItem = (items = [], productId, attributes = {}) => {
  if (!Array.isArray(items) || !productId) return null;
  return items.find(item => {
    if (item.productId !== String(productId)) return false;
    return _attrsEqual(item.attributes, attributes);
  }) || null;
};

const _attrsEqual = (a1 = {}, a2 = {}) => {
  const k1 = Object.keys(a1 || {}).sort();
  const k2 = Object.keys(a2 || {}).sort();
  if (k1.length !== k2.length) return false;
  return k1.every((k, i) => k2[i] === k && (a1)[k] === (a2)[k]);
};