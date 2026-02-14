import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module CartAPI
 * @description Capa API para el módulo Cart
 * 
 * SINCRONIZADO 100% CON BACKEND:
 * - cart.routes.js
 * - cart.controller.js
 * - cart.validation.js
 * 
 * BASE_URL: /api/cart
 * AUTH: Todas las rutas requieren authMiddleware (JWT)
 */

const BASE_URL = '/cart';

/**
 * @function getCart
 * @description Obtener carrito del usuario autenticado
 * 
 * BACKEND: GET /api/cart
 * CONTROLLER: cartController.getCart
 * AUTH: Required
 * 
 * @returns {Promise<Object>} { success, data: Cart }
 * @throws {Error} 401 si no autenticado
 */
export const getCart = async () => {
  // axiosInstance ya devuelve response.data, no el objeto completo
  const data = await axiosInstance.get(BASE_URL);
  return data;
};

/**
 * @function addToCart
 * @description Agregar producto al carrito
 * 
 * BACKEND: POST /api/cart/items
 * CONTROLLER: cartController.addToCart
 * VALIDATION: addItemValidation
 * AUTH: Required
 * 
 * @param {Object} itemData - Datos del item
 * @param {string} itemData.productId - ID del producto (REQUIRED)
 * @param {number} [itemData.quantity=1] - Cantidad (1-9999)
 * @param {Object} [itemData.attributes={}] - Atributos (size, color, material)
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 400 si validación falla
 * @throws {Error} 404 si producto no existe
 * @throws {Error} 400 si stock insuficiente
 */
export const addToCart = async (itemData) => {
  const data = await axiosInstance.post(`${BASE_URL}/items`, itemData);
  return data;
};

/**
 * @function updateCartItem
 * @description Actualizar cantidad de un item
 * 
 * BACKEND: PUT /api/cart/items/:productId
 * CONTROLLER: cartController.updateCartItem
 * VALIDATION: updateQuantityValidation
 * AUTH: Required
 * 
 * @param {string} productId - ID del producto (REQUIRED)
 * @param {Object} updateData - Datos a actualizar
 * @param {number} updateData.quantity - Nueva cantidad (1-9999, REQUIRED)
 * @param {Object} [updateData.attributes={}] - Atributos para identificar item
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 400 si cantidad < 1
 * @throws {Error} 400 si stock insuficiente
 * @throws {Error} 404 si carrito no existe
 */
export const updateCartItem = async (productId, updateData) => {
  const data = await axiosInstance.put(`${BASE_URL}/items/${productId}`, updateData);
  return data;
};

/**
 * @function removeFromCart
 * @description Eliminar item del carrito
 * 
 * BACKEND: DELETE /api/cart/items/:productId
 * CONTROLLER: cartController.removeFromCart
 * VALIDATION: removeItemValidation
 * AUTH: Required
 * 
 * @param {string} productId - ID del producto (REQUIRED)
 * @param {Object} [attributes={}] - Atributos para identificar item exacto
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 404 si carrito no existe
 */
export const removeFromCart = async (productId, attributes = {}) => {
  const data = await axiosInstance.delete(`${BASE_URL}/items/${productId}`, {
    data: { attributes },
  });
  return data;
};

/**
 * @function clearCart
 * @description Vaciar todo el carrito
 * 
 * BACKEND: DELETE /api/cart
 * CONTROLLER: cartController.clearCart
 * AUTH: Required
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 404 si carrito no existe
 */
export const clearCart = async () => {
  const data = await axiosInstance.delete(BASE_URL);
  return data;
};

/**
 * @function applyCoupon
 * @description Aplicar cupón de descuento
 * 
 * BACKEND: POST /api/cart/coupon
 * CONTROLLER: cartController.applyCoupon
 * VALIDATION: applyCouponValidation
 * AUTH: Required
 * 
 * @param {string} code - Código del cupón (REQUIRED, max 20 chars, uppercase)
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 400 si cupón inválido o expirado
 * @throws {Error} 400 si no cumple monto mínimo
 * @throws {Error} 404 si carrito no existe
 */
export const applyCoupon = async (code) => {
  const data = await axiosInstance.post(`${BASE_URL}/coupon`, { code });
  return data;
};

/**
 * @function updateShippingAddress
 * @description Actualizar dirección de envío
 * 
 * BACKEND: PUT /api/cart/shipping-address
 * CONTROLLER: cartController.updateShippingAddress
 * VALIDATION: updateShippingAddressValidation
 * AUTH: Required
 * 
 * @param {Object} addressData - Datos de la dirección (TODOS REQUIRED)
 * @param {string} addressData.firstName - Nombre
 * @param {string} addressData.lastName - Apellido
 * @param {string} addressData.email - Email
 * @param {string} addressData.phone - Teléfono
 * @param {string} addressData.street - Calle
 * @param {string} addressData.city - Ciudad
 * @param {string} addressData.state - Estado/Provincia
 * @param {string} addressData.zipCode - Código postal
 * @param {string} addressData.country - País
 * @param {boolean} [addressData.isDefault] - ¿Es dirección por defecto?
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 400 si falta algún campo requerido
 * @throws {Error} 404 si carrito no existe
 */
export const updateShippingAddress = async (addressData) => {
  const data = await axiosInstance.put(`${BASE_URL}/shipping-address`, addressData);
  return data;
};

/**
 * @function updateShippingMethod
 * @description Actualizar método de envío
 * 
 * BACKEND: PUT /api/cart/shipping-method
 * CONTROLLER: cartController.updateShippingMethod
 * VALIDATION: updateShippingMethodValidation
 * AUTH: Required
 * 
 * @param {Object} shippingData - Datos del envío
 * @param {string} shippingData.method - Método (REQUIRED: 'standard'|'express'|'overnight'|'pickup')
 * @param {number} [shippingData.cost=0] - Costo del envío (min: 0)
 * 
 * @returns {Promise<Object>} { success, message, data: Cart }
 * @throws {Error} 400 si método inválido
 * @throws {Error} 404 si carrito no existe
 */
export const updateShippingMethod = async (shippingData) => {
  const data = await axiosInstance.put(`${BASE_URL}/shipping-method`, shippingData);
  return data;
};

/**
 * EXPORTACIÓN POR DEFECTO
 */
export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  applyCoupon,
  updateShippingAddress,
  updateShippingMethod
};