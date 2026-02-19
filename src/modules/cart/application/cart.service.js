/**
 * @module cart.service
 * @description Capa de aplicación del módulo Cart.
 *
 * Orquesta: validaciones de dominio → repositorio → resultado.
 * El store llama a este servicio; nunca llama al repositorio directamente.
 * Tampoco conoce React, Zustand ni localStorage.
 *
 * CONTRATO DE RETORNO:
 * Todas las funciones retornan { success, cart?, error? }
 * El store NUNCA recibe excepciones — solo objetos de resultado.
 */

import * as repository from '../infrastructure/cart.repository';
import {
  validateAddItem,
  validateQuantity,
  validateCouponCode,
  validateShippingMethod,
  validateShippingAddress,
} from '../domain/cart.validators';
import {
  CartValidationError,
  CartStockError,
} from '../domain/cart.errors';
import { CART_LIMITS } from '../domain/cart.constants';

// ── HELPER ─────────────────────────────────────────────────────────────────

const success = (cart)  => ({ success: true,  cart,  error: null });
const failure = (error) => ({ success: false,  cart:  null, error });

// ── OPERACIONES ────────────────────────────────────────────────────────────

/**
 * Carga el carrito. Decide guest/auth internamente vía repositorio.
 */
export const fetchCart = async (opts) => {
  try {
    const cart = await repository.fetchCart(opts);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al cargar el carrito');
  }
};

/**
 * Agrega un item al carrito con validación completa.
 *
 * @param {Object} productData - Objeto producto completo
 * @param {number} quantity
 * @param {Object} [attributes]
 */
export const addItem = async (productData, quantity = 1, attributes = {}) => {
  const productId = productData._id || productData.id || productData.productId;
  const stock     = productData.stock;
  const track     = productData.trackQuantity;

  const validation = validateAddItem(productId, quantity, stock, track);
  if (!validation.valid) {
    return failure(validation.errors[0]);
  }

  try {
    const cart = await repository.addItem(productData, quantity, attributes);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al agregar al carrito');
  }
};

/**
 * Actualiza la cantidad de un item.
 *
 * @param {string} productId
 * @param {number} quantity
 * @param {Object} [attributes]
 */
export const updateItem = async (productId, quantity, attributes = {}) => {
  const validation = validateQuantity(quantity);
  if (!validation.valid) {
    return failure(validation.errors[0]);
  }

  try {
    const cart = await repository.updateItem(productId, quantity, attributes);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al actualizar cantidad');
  }
};

/**
 * Elimina un item del carrito.
 *
 * @param {string} productId
 * @param {Object} [attributes]
 */
export const removeItem = async (productId, attributes = {}) => {
  if (!productId) return failure('ID de producto requerido');

  try {
    const cart = await repository.removeItem(productId, attributes);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al eliminar producto');
  }
};

/**
 * Vacía el carrito.
 */
export const clearCart = async () => {
  try {
    const cart = await repository.clearCart();
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al vaciar el carrito');
  }
};

/**
 * Aplica un cupón de descuento.
 *
 * @param {string} code
 */
export const applyCoupon = async (code) => {
  const validation = validateCouponCode(code);
  if (!validation.valid) return failure(validation.errors[0]);

  try {
    const cart = await repository.applyCoupon(code.toUpperCase().trim());
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Cupón inválido o expirado');
  }
};

/**
 * Actualiza la dirección de envío.
 *
 * @param {Object} addressData
 */
export const updateShippingAddress = async (addressData) => {
  const validation = validateShippingAddress(addressData);
  if (!validation.valid) return failure(validation.errors[0]);

  try {
    const cart = await repository.updateShippingAddress(addressData);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al actualizar dirección');
  }
};

/**
 * Actualiza el método de envío.
 *
 * @param {Object} shippingData - { method, cost }
 */
export const updateShippingMethod = async (shippingData) => {
  const validation = validateShippingMethod(shippingData.method);
  if (!validation.valid) return failure(validation.errors[0]);

  try {
    const cart = await repository.updateShippingMethod(shippingData);
    return success(cart);
  } catch (err) {
    return failure(err.message || 'Error al actualizar método de envío');
  }
};

export const cartService = {
  fetchCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  updateShippingAddress,
  updateShippingMethod,
};

export default cartService;