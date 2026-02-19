/**
 * @module cart.repository
 * @description Repositorio del dominio Cart.
 *
 * ÚNICA capa que decide si usar el API (autenticado) o el guest manager.
 * El store y los hooks NUNCA saben de dónde vienen los datos.
 *
 * REGLA: si hay token en localStorage → modo autenticado.
 * El token se detecta sin acoplar al sistema de auth.
 */

import * as cartAPI  from '../api/cart.api';
import {
  loadGuestCart,
  saveGuestCart,
  clearGuestCart,
  addGuestItem,
  updateGuestItem,
  removeGuestItem,
  clearGuestItems,
  getGuestItems,
} from './guest-cart.manager';
import { fromHttpError }          from '../domain/cart.errors';
import { createCart }             from '../domain/cart.model';
import { CART_STORAGE_KEYS }      from '../domain/cart.constants';

// ── AUTH DETECTION (agnóstico al sistema de auth) ──────────────────────────

const isAuthenticated = () =>
  Boolean(
    localStorage.getItem('killavibes_auth') ||
    localStorage.getItem('token')            ||
    sessionStorage.getItem('killavibes_auth')
  );

// ── OPERACIONES PÚBLICAS ───────────────────────────────────────────────────

/**
 * Fetch del carrito (detecta modo automáticamente).
 *
 * @param {Object} [options]
 * @param {boolean} [options.forceRefresh]
 * @param {Object}  [options.cache]        - { data, timestamp }
 * @param {number}  [options.cacheTTL]
 * @returns {Promise<Cart>}
 */
export const fetchCart = async ({ forceRefresh = false, cache = null, cacheTTL = 0 } = {}) => {
  if (!isAuthenticated()) {
    return loadGuestCart();
  }

  // Cache válido
  if (!forceRefresh && cache?.data && cache.timestamp && Date.now() - cache.timestamp < cacheTTL) {
    return cache.data;
  }

  try {
    const res  = await cartAPI.getCart();
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    if (err.response?.status === 401) return createCart(null);
    throw fromHttpError(err);
  }
};

/**
 * Agrega un item al carrito.
 * En modo guest: usa localStorage.
 * En modo auth: llama al API.
 *
 * @param {Object} productData - Objeto producto completo (para guest) o { _id }
 * @param {number} quantity
 * @param {Object} [attributes]
 * @returns {Promise<Cart>}
 */
export const addItem = async (productData, quantity = 1, attributes = {}) => {
  if (!isAuthenticated()) {
    return addGuestItem(productData, quantity, attributes);
  }

  const productId = productData._id || productData.id || productData.productId;
  try {
    const res  = await cartAPI.addToCart({ productId, quantity, attributes });
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Actualiza la cantidad de un item.
 *
 * @param {string} productId
 * @param {number} quantity
 * @param {Object} [attributes]
 * @returns {Promise<Cart>}
 */
export const updateItem = async (productId, quantity, attributes = {}) => {
  if (!isAuthenticated()) {
    return updateGuestItem(productId, quantity, attributes);
  }

  try {
    const res  = await cartAPI.updateCartItem(productId, { quantity, attributes });
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Elimina un item del carrito.
 *
 * @param {string} productId
 * @param {Object} [attributes]
 * @returns {Promise<Cart>}
 */
export const removeItem = async (productId, attributes = {}) => {
  if (!isAuthenticated()) {
    return removeGuestItem(productId, attributes);
  }

  try {
    const res  = await cartAPI.removeFromCart(productId, attributes);
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Vacía el carrito.
 *
 * @returns {Promise<Cart>}
 */
export const clearCart = async () => {
  if (!isAuthenticated()) {
    return clearGuestItems();
  }

  try {
    const res  = await cartAPI.clearCart();
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Aplica un cupón (solo disponible en modo autenticado).
 *
 * @param {string} code
 * @returns {Promise<Cart>}
 */
export const applyCoupon = async (code) => {
  if (!isAuthenticated()) {
    throw new Error('Debes iniciar sesión para aplicar cupones');
  }

  try {
    const res  = await cartAPI.applyCoupon(code);
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Actualiza la dirección de envío (solo autenticado).
 *
 * @param {Object} addressData
 * @returns {Promise<Cart>}
 */
export const updateShippingAddress = async (addressData) => {
  if (!isAuthenticated()) {
    throw new Error('Debes iniciar sesión para guardar una dirección');
  }

  try {
    const res  = await cartAPI.updateShippingAddress(addressData);
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

/**
 * Actualiza el método de envío (solo autenticado).
 *
 * @param {Object} shippingData - { method, cost }
 * @returns {Promise<Cart>}
 */
export const updateShippingMethod = async (shippingData) => {
  if (!isAuthenticated()) {
    throw new Error('Debes iniciar sesión para seleccionar método de envío');
  }

  try {
    const res  = await cartAPI.updateShippingMethod(shippingData);
    const data = res.data || res;
    return createCart(data);
  } catch (err) {
    throw fromHttpError(err);
  }
};

// ── SYNC ────────────────────────────────────────────────────────────────────

/**
 * Devuelve los items guest para usar en el sync service.
 * Solo infraestructura — no llama al backend.
 */
export { getGuestItems, clearGuestCart };

export const cartRepository = {
  fetchCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  updateShippingAddress,
  updateShippingMethod,
  getGuestItems,
  clearGuestCart,
};

export default cartRepository;