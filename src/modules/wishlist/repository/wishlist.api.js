/**
 * @module wishlist.api
 * @description Cliente HTTP unificado para el recurso Wishlist.
 *
 * REEMPLAZA:
 * - wishlist_api.js        (usaba axiosInstance)
 * - customerWishlist_api.js (usaba customerApiClient)
 *
 * Ambos archivos apuntaban al mismo endpoint backend /wishlist.
 * Este módulo los consolida en un único cliente.
 *
 * Responsabilidad única: llamadas HTTP.
 * NO normaliza datos (eso lo hace el repository).
 * NO maneja errores de dominio (eso lo hace el repository vía fromHttpError).
 * NO tiene estado.
 *
 * Nota sobre el cliente HTTP:
 * Se usa `customerApiClient` como base porque incluye el interceptor JWT
 * necesario para las rutas autenticadas. Si en el futuro se unifica el
 * cliente HTTP global del proyecto, solo hay que cambiar el import aquí.
 */

import customerApiClient from '../../customer/utils/customerApiClient';

const BASE = '/wishlist';

// ============================================================================
// ENDPOINTS CRUD CORE
// ============================================================================

/**
 * GET /wishlist
 * Obtiene la wishlist completa del usuario autenticado con productos populados.
 *
 * @returns {Promise<Object>} Response cruda de axios
 */
export const fetchWishlist = () =>
  customerApiClient.get(BASE);

/**
 * POST /wishlist/items
 * Agrega un producto a la wishlist.
 *
 * @param {Object} payload
 * @param {string}  payload.productId
 * @param {boolean} [payload.notifyPriceChange=false]
 * @param {boolean} [payload.notifyAvailability=false]
 * @returns {Promise<Object>} Response cruda de axios
 */
export const addItem = (payload) =>
  customerApiClient.post(`${BASE}/items`, payload);

/**
 * DELETE /wishlist/items/:productId
 * Elimina un producto de la wishlist.
 *
 * @param {string} productId
 * @returns {Promise<Object>} Response cruda de axios
 */
export const removeItem = (productId) =>
  customerApiClient.delete(`${BASE}/items/${productId}`);

/**
 * DELETE /wishlist
 * Vacía toda la wishlist.
 *
 * @returns {Promise<Object>} Response cruda de axios
 */
export const clearWishlist = () =>
  customerApiClient.delete(BASE);

// ============================================================================
// ENDPOINTS AUXILIARES
// ============================================================================

/**
 * GET /wishlist/check/:productId
 * Verifica si un producto está en la wishlist (verificación server-side).
 *
 * Nota: en el nuevo diseño, la verificación local (isInWishlist) es preferida
 * por rendimiento. Este endpoint se usa como fallback o validación server-side.
 *
 * @param {string} productId
 * @returns {Promise<Object>} Response cruda de axios — data: { inWishlist: boolean }
 */
export const checkProduct = (productId) =>
  customerApiClient.get(`${BASE}/check/${productId}`);

/**
 * POST /wishlist/move-to-cart
 * Mueve productos de la wishlist al carrito.
 *
 * @param {string[]} productIds
 * @returns {Promise<Object>} Response cruda — data: { movedItems, movedCount }
 */
export const moveToCart = (productIds) =>
  customerApiClient.post(`${BASE}/move-to-cart`, { productIds });

/**
 * GET /wishlist/price-changes
 * Obtiene productos de la wishlist con cambios de precio desde que fueron agregados.
 *
 * @returns {Promise<Object>} Response cruda — data: [{ product, oldPrice, newPrice, ... }]
 */
export const getPriceChanges = () =>
  customerApiClient.get(`${BASE}/price-changes`);

// ============================================================================
// ENDPOINT DE SINCRONIZACIÓN GUEST → AUTH
// ============================================================================

/**
 * POST /wishlist/sync
 * Sincroniza items del guest wishlist al usuario autenticado (bulk upsert).
 *
 * El backend hace upsert: agrega los que no existen, ignora duplicados (409).
 * Retorna cuántos items fueron efectivamente migrados.
 *
 * @param {Object[]} items - Items en formato toSyncPayload()
 * @param {string}   items[].productId
 * @param {boolean}  items[].notifyPriceChange
 * @param {boolean}  items[].notifyAvailability
 * @param {string}   items[].addedAt
 *
 * @returns {Promise<Object>} Response cruda — data: { success, migratedCount }
 */
export const syncGuestItems = (items) =>
  customerApiClient.post(`${BASE}/sync`, { items });

// ============================================================================
// EXPORT DEFAULT (para mocking en tests)
// ============================================================================

export default {
  fetchWishlist,
  addItem,
  removeItem,
  clearWishlist,
  checkProduct,
  moveToCart,
  getPriceChanges,
  syncGuestItems,
};