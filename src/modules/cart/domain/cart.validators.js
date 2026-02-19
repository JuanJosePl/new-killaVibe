/**
 * @module cart.validators
 * @description Validaciones puras del dominio Cart.
 * Sin Yup, sin React, sin efectos secundarios.
 * Retornan { valid: boolean, errors: string[] }.
 */

import { CART_LIMITS, SHIPPING_METHODS } from './cart.constants';

// ── HELPERS ────────────────────────────────────────────────────────────────

const err = (...msgs) => ({ valid: false, errors: msgs.filter(Boolean) });
const ok  = ()        => ({ valid: true,  errors: [] });

// ── VALIDACIONES ───────────────────────────────────────────────────────────

/**
 * Valida que un productId sea un string no vacío.
 */
export const validateProductId = (productId) => {
  if (!productId || typeof productId !== 'string' || !productId.trim()) {
    return err('El ID del producto es requerido');
  }
  return ok();
};

/**
 * Valida cantidad de un item.
 */
export const validateQuantity = (quantity) => {
  const qty = Number(quantity);
  if (!Number.isInteger(qty))                   return err('La cantidad debe ser un número entero');
  if (qty < CART_LIMITS.MIN_QUANTITY)           return err(`La cantidad mínima es ${CART_LIMITS.MIN_QUANTITY}`);
  if (qty > CART_LIMITS.MAX_QUANTITY)           return err(`La cantidad máxima es ${CART_LIMITS.MAX_QUANTITY}`);
  return ok();
};

/**
 * Valida que la cantidad no supere el stock disponible.
 */
export const validateStock = (quantity, stock, trackQuantity = false) => {
  if (!trackQuantity) return ok();
  const qty     = Number(quantity);
  const available = Number(stock) || 0;
  if (qty > available) return err(`Solo hay ${available} unidades disponibles`);
  return ok();
};

/**
 * Valida un item completo para agregar al carrito.
 */
export const validateAddItem = (productId, quantity, stock, trackQuantity) => {
  const pidResult = validateProductId(productId);
  if (!pidResult.valid) return pidResult;

  const qtyResult = validateQuantity(quantity);
  if (!qtyResult.valid) return qtyResult;

  const stockResult = validateStock(quantity, stock, trackQuantity);
  if (!stockResult.valid) return stockResult;

  return ok();
};

/**
 * Valida el código de un cupón.
 */
export const validateCouponCode = (code) => {
  if (!code || typeof code !== 'string' || !code.trim()) {
    return err('El código de cupón es requerido');
  }
  if (code.trim().length > CART_LIMITS.MAX_COUPON_LENGTH) {
    return err(`El código no puede exceder ${CART_LIMITS.MAX_COUPON_LENGTH} caracteres`);
  }
  return ok();
};

/**
 * Valida el método de envío.
 */
export const validateShippingMethod = (method) => {
  if (!Object.values(SHIPPING_METHODS).includes(method)) {
    return err(`Método de envío inválido. Válidos: ${Object.values(SHIPPING_METHODS).join(', ')}`);
  }
  return ok();
};

/**
 * Valida dirección de envío mínima.
 */
export const validateShippingAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return err('La dirección es requerida');
  }
  const required = ['firstName', 'lastName', 'email', 'phone', 'street', 'city', 'state', 'zipCode', 'country'];
  const missing  = required.filter(f => !address[f]?.toString().trim());
  if (missing.length > 0) {
    return err(`Campos requeridos: ${missing.join(', ')}`);
  }
  return ok();
};

/**
 * Compara dos conjuntos de atributos.
 * Usada para identificar un item único (productId + attributes).
 */
export const areAttributesEqual = (attr1 = {}, attr2 = {}) => {
  const a1 = attr1 || {};
  const a2 = attr2 || {};
  const keys1 = Object.keys(a1).sort();
  const keys2 = Object.keys(a2).sort();
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key, i) => keys2[i] === key && a1[key] === a2[key]);
};

/**
 * Genera la clave única de un item en el carrito.
 * productId + attributes → clave determinista.
 */
export const generateCartItemKey = (productId, attributes = {}) => {
  const attrKeys = Object.keys(attributes || {}).sort();
  const attrStr  = attrKeys.map(k => `${k}:${attributes[k]}`).join('|');
  return `${productId}${attrStr ? `::${attrStr}` : ''}`;
};