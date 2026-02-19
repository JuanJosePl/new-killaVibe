/**
 * @module cart.api
 * @description Capa HTTP del módulo Cart. Única fuente de verdad.
 *
 * CONSOLIDA:
 *   modules/cart/api/cart.api.js (original — usa axiosInstance)
 *   modules/customer/api/customerCart.api.js (usa customerApiClient)
 *
 * DIFERENCIAS DETECTADAS Y RESUELTAS:
 * ┌────────────────────┬──────────────────────┬──────────────────────┐
 * │ Función            │ cart.api.js           │ customerCart.api.js  │
 * ├────────────────────┼──────────────────────┼──────────────────────┤
 * │ addToCart          │ { productId, qty, … } │ (productId, qty, …)  │
 * │ updateCartItem     │ (productId, data)     │ (productId, qty, …)  │
 * │ applyCoupon        │ { code }              │ { code }             │
 * │ updateShipMethod   │ { method, cost }      │ (method, cost)       │
 * │ HTTP client        │ axiosInstance         │ customerApiClient    │
 * └────────────────────┴──────────────────────┴──────────────────────┘
 *
 * DECISIÓN: usar axiosInstance (tiene JWT interceptor).
 * La API pública usa objetos, no argumentos posicionales.
 *
 * BASE_URL: /cart (axiosInstance ya incluye /api)
 * AUTH: Todas las rutas requieren authMiddleware (JWT en header)
 * NOTA: El modo guest NO llama a esta API — usa guest-cart.manager.js
 */

import axiosInstance from '../../../core/api/axiosInstance';

const BASE = '/cart';

// ── LECTURA ────────────────────────────────────────────────────────────────

/**
 * Obtener carrito del usuario autenticado.
 * GET /api/cart
 * @returns {Promise<{success: boolean, data: Object}>}
 */
export const getCart = () => axiosInstance.get(BASE);

// ── ITEMS ──────────────────────────────────────────────────────────────────

/**
 * Agregar producto al carrito.
 * POST /api/cart/items
 *
 * @param {Object} payload
 * @param {string} payload.productId  - ID MongoDB
 * @param {number} [payload.quantity=1]
 * @param {Object} [payload.attributes={}] - size, color, material
 */
export const addToCart = (payload) =>
  axiosInstance.post(`${BASE}/items`, {
    productId:  payload.productId,
    quantity:   Number(payload.quantity) || 1,
    attributes: payload.attributes       || {},
  });

/**
 * Actualizar cantidad de un item.
 * PUT /api/cart/items/:productId
 *
 * @param {string} productId
 * @param {Object} updateData
 * @param {number} updateData.quantity
 * @param {Object} [updateData.attributes={}]
 */
export const updateCartItem = (productId, updateData) =>
  axiosInstance.put(`${BASE}/items/${productId}`, {
    quantity:   Number(updateData.quantity),
    attributes: updateData.attributes || {},
  });

/**
 * Eliminar item del carrito.
 * DELETE /api/cart/items/:productId
 *
 * @param {string} productId
 * @param {Object} [attributes={}]
 */
export const removeFromCart = (productId, attributes = {}) =>
  axiosInstance.delete(`${BASE}/items/${productId}`, {
    data: { attributes },
  });

/**
 * Sincronización bulk: migra items guest al carrito del usuario.
 * POST /api/cart/items/bulk  (o /api/cart/sync — ajustar al endpoint real)
 *
 * @param {Object[]} items - [{ productId, quantity, attributes }]
 */
export const syncItems = (items) =>
  axiosInstance.post(`${BASE}/sync`, { items });

// ── CARRITO COMPLETO ───────────────────────────────────────────────────────

/**
 * Vaciar todo el carrito.
 * DELETE /api/cart
 */
export const clearCart = () => axiosInstance.delete(BASE);

// ── CUPÓN ──────────────────────────────────────────────────────────────────

/**
 * Aplicar cupón de descuento.
 * POST /api/cart/coupon
 *
 * @param {string} code - Código del cupón (uppercase, max 20 chars)
 */
export const applyCoupon = (code) =>
  axiosInstance.post(`${BASE}/coupon`, { code: code.toUpperCase().trim() });

// ── ENVÍO ──────────────────────────────────────────────────────────────────

/**
 * Actualizar dirección de envío.
 * PUT /api/cart/shipping-address
 *
 * @param {Object} addressData - { firstName, lastName, email, phone, street, city, state, zipCode, country }
 */
export const updateShippingAddress = (addressData) =>
  axiosInstance.put(`${BASE}/shipping-address`, addressData);

/**
 * Actualizar método de envío.
 * PUT /api/cart/shipping-method
 *
 * @param {Object} shippingData
 * @param {string} shippingData.method  - 'standard' | 'express' | 'overnight' | 'pickup'
 * @param {number} [shippingData.cost=0]
 */
export const updateShippingMethod = (shippingData) =>
  axiosInstance.put(`${BASE}/shipping-method`, {
    method: shippingData.method,
    cost:   Number(shippingData.cost) || 0,
  });

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  syncItems,
  clearCart,
  applyCoupon,
  updateShippingAddress,
  updateShippingMethod,
};