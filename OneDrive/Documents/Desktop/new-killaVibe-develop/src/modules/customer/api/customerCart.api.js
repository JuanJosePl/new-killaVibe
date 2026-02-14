// src/modules/customer/api/customerCart.api.js

import customerApiClient from '../utils/customerApiClient';

/**
 * @description API para Cart (CRUD completo)
 * 
 * Endpoints:
 * - GET /api/cart
 * - POST /api/cart/items
 * - PUT /api/cart/items/:productId
 * - DELETE /api/cart/items/:productId
 * - DELETE /api/cart
 * - POST /api/cart/coupon
 * - PUT /api/cart/shipping-address
 * - PUT /api/cart/shipping-method
 */

/**
 * Obtener carrito del usuario
 */
export const getCart = async () => {
  const response = await customerApiClient.get('/cart');
  return response.data;
};

/**
 * Agregar item al carrito
 */
export const addToCart = async (productId, quantity = 1, attributes = {}) => {
  const response = await customerApiClient.post('/cart/items', {
    productId,
    quantity,
    attributes,
  });
  return response.data;
};

/**
 * Actualizar cantidad de item
 */
export const updateCartItem = async (productId, quantity, attributes = {}) => {
  const response = await customerApiClient.put(`/cart/items/${productId}`, {
    quantity,
    attributes,
  });
  return response.data;
};

/**
 * Eliminar item del carrito
 */
export const removeFromCart = async (productId, attributes = {}) => {
  const response = await customerApiClient.delete(`/cart/items/${productId}`, {
    data: { attributes },
  });
  return response.data;
};

/**
 * Vaciar carrito
 */
export const clearCart = async () => {
  const response = await customerApiClient.delete('/cart');
  return response.data;
};

/**
 * Aplicar cupón
 */
export const applyCoupon = async (code) => {
  const response = await customerApiClient.post('/cart/coupon', { code });
  return response.data;
};

/**
 * Actualizar dirección de envío
 */
export const updateShippingAddress = async (address) => {
  const response = await customerApiClient.put('/cart/shipping-address', address);
  return response.data;
};

/**
 * Actualizar método de envío
 */
export const updateShippingMethod = async (method, cost) => {
  const response = await customerApiClient.put('/cart/shipping-method', {
    method,
    cost,
  });
  return response.data;
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  updateShippingAddress,
  updateShippingMethod,
};