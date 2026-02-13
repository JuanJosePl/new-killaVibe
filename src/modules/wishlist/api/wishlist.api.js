import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module WishlistAPI
 * @description Capa de comunicación con backend - Wishlist
 * 
 * SINCRONIZADO 100% con:
 * - wishlist.routes.js
 * - wishlist.controller.js
 * - wishlist.validation.js
 * 
 * TODAS las rutas requieren JWT (authMiddleware)
 */

const BASE_URL = '/wishlist';

/**
 * @function getWishlist
 * @description Obtiene la wishlist del usuario autenticado
 * 
 * @route GET /api/wishlist
 * @access Private
 * 
 * @returns {Promise<Object>} { success, data: wishlist }
 * @throws {Error} 401 Unauthorized, 500 Internal Server Error
 */
export const getWishlist = async () => {
  const data = await axiosInstance.get(BASE_URL);
  return data;
};

/**
 * @function addItem
 * @description Agrega un producto a la wishlist
 * 
 * @route POST /api/wishlist/items
 * @access Private
 * 
 * @param {Object} itemData
 * @param {string} itemData.productId - ID del producto (REQUIRED)
 * @param {boolean} [itemData.notifyPriceChange=false] - Notificar cambios de precio
 * @param {boolean} [itemData.notifyAvailability=false] - Notificar disponibilidad
 * 
 * @returns {Promise<Object>} { success, message, data: wishlist }
 * @throws {Error} 400 Bad Request (duplicado, validación), 404 Not Found, 401 Unauthorized
 * 
 * @example
 * await addItem({
 *   productId: '507f1f77bcf86cd799439011',
 *   notifyPriceChange: true,
 *   notifyAvailability: true
 * });
 */
export const addItem = async (itemData) => {
  const data = await axiosInstance.post(`${BASE_URL}/items`, itemData);
  return data;
};

/**
 * @function removeItem
 * @description Elimina un producto de la wishlist
 * 
 * @route DELETE /api/wishlist/items/:productId
 * @access Private
 * 
 * @param {string} productId - ID del producto (REQUIRED)
 * 
 * @returns {Promise<Object>} { success, message, data: wishlist }
 * @throws {Error} 404 Not Found, 401 Unauthorized
 */
export const removeItem = async (productId) => {
  const data = await axiosInstance.delete(`${BASE_URL}/items/${productId}`);
  return data;
};

/**
 * @function clearWishlist
 * @description Vacía toda la wishlist
 * 
 * @route DELETE /api/wishlist
 * @access Private
 * 
 * @returns {Promise<Object>} { success, message, data: wishlist }
 * @throws {Error} 404 Not Found, 401 Unauthorized
 */
export const clearWishlist = async () => {
  const data = await axiosInstance.delete(BASE_URL);
  return data;
};

/**
 * @function checkProduct
 * @description Verifica si un producto está en la wishlist
 * 
 * @route GET /api/wishlist/check/:productId
 * @access Private
 * 
 * @param {string} productId - ID del producto (REQUIRED)
 * 
 * @returns {Promise<Object>} { success, inWishlist: boolean }
 * @throws {Error} 401 Unauthorized
 */
export const checkProduct = async (productId) => {
  const data = await axiosInstance.get(`${BASE_URL}/check/${productId}`);
  return data;
};

/**
 * @function moveToCart
 * @description Mueve productos de la wishlist al carrito
 * 
 * @route POST /api/wishlist/move-to-cart
 * @access Private
 * 
 * @param {Array<string>} productIds - Array de IDs de productos (REQUIRED)
 * 
 * @returns {Promise<Object>} { success, message, data: { movedItems, movedCount } }
 * @throws {Error} 404 Not Found, 401 Unauthorized
 * 
 * @example
 * await moveToCart(['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']);
 */
export const moveToCart = async (productIds) => {
  const data = await axiosInstance.post(`${BASE_URL}/move-to-cart`, { productIds });
  return data;
};

/**
 * @function getPriceChanges
 * @description Obtiene productos con cambios de precio
 * 
 * @route GET /api/wishlist/price-changes
 * @access Private
 * 
 * @returns {Promise<Object>} { success, count, data: [priceChanges] }
 * @throws {Error} 401 Unauthorized
 * 
 * @example
 * const response = await getPriceChanges();
 * // response.data = [
 * //   {
 * //     product: {...},
 * //     oldPrice: 100,
 * //     newPrice: 80,
 * //     difference: -20,
 * //     percentageChange: "-20.00",
 * //     addedAt: "2025-01-01T00:00:00.000Z"
 * //   }
 * // ]
 */
export const getPriceChanges = async () => {
  const data = await axiosInstance.get(`${BASE_URL}/price-changes`);
  return data;
};

export default {
  getWishlist,
  addItem,
  removeItem,
  clearWishlist,
  checkProduct,
  moveToCart,
  getPriceChanges
};