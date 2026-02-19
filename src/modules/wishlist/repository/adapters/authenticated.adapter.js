/**
 * @module authenticated.adapter
 * @description Adapter de persistencia para usuarios autenticados.
 *
 * Implementa la misma interfaz que guest.adapter.js usando la API REST.
 * La simetría de interfaz es lo que permite al repository intercambiar
 * adapters sin que el store lo note.
 *
 * INTERFACE CONTRACT (simétrica con guest.adapter.js):
 *   get()                       → Promise<WishlistItem[]>
 *   add(itemData)               → Promise<WishlistItem[]>
 *   remove(productId)           → Promise<WishlistItem[]>
 *   clear()                     → Promise<WishlistItem[]>
 *   getGuestItems()             → []  (no aplica, retorna vacío)
 *   clearStorage()              → void (no aplica, no-op)
 *
 * OPERACIONES EXCLUSIVAS DE AUTH:
 *   moveToCart(productIds)      → Promise<{ movedItems, movedCount }>
 *   getPriceChanges()           → Promise<Object[]>
 *   sync(guestItems)            → Promise<{ migratedCount, failedCount }>
 */

import wishlistApi from '../wishlist.api';
import { createWishlistItem } from '../../domain/wishlist.model';
import { fromHttpError } from '../../domain/wishlist.errors';
import { toSyncPayload } from '../../domain/wishlist.model';
import { validateGuestItem } from '../../domain/wishlist.validators';

// ============================================================================
// HELPERS INTERNOS
// ============================================================================

/**
 * Extrae y normaliza los items de una API response.
 * El backend puede responder con { data: { items: [...] } } o { items: [...] }.
 * Este helper centraliza la extracción.
 *
 * @param {Object} response - Respuesta cruda de axios
 * @returns {import('../../domain/wishlist.model').WishlistItem[]}
 */
const extractAndNormalizeItems = (response) => {
  // Navegar la estructura de respuesta del backend
  const raw = response?.data?.data || response?.data || {};
  const rawItems = Array.isArray(raw.items) ? raw.items : [];

  return rawItems.reduce((acc, rawItem) => {
    try {
      acc.push(createWishlistItem(rawItem));
    } catch (err) {
      console.warn('[AuthAdapter] Item descartado en normalización:', rawItem, err.message);
    }
    return acc;
  }, []);
};

// ============================================================================
// ADAPTER
// ============================================================================

export const authenticatedAdapter = {

  /**
   * Obtiene la wishlist del usuario autenticado desde el backend.
   *
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>}
   * @throws {WishlistError}
   */
  async get() {
    try {
      const response = await wishlistApi.fetchWishlist();
      return extractAndNormalizeItems(response);
    } catch (err) {
      throw fromHttpError(err);
    }
  },

  /**
   * Agrega un producto a la wishlist en el backend.
   *
   * @param {Object} itemData - { productId, notifyPriceChange?, notifyAvailability? }
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>}
   * @throws {WishlistDuplicateError | WishlistValidationError | WishlistError}
   */
  async add(itemData) {
    try {
      const response = await wishlistApi.addItem({
        productId: itemData.productId,
        notifyPriceChange: itemData.notifyPriceChange ?? false,
        notifyAvailability: itemData.notifyAvailability ?? false,
      });
      return extractAndNormalizeItems(response);
    } catch (err) {
      throw fromHttpError(err, itemData.productId);
    }
  },

  /**
   * Elimina un producto de la wishlist en el backend.
   *
   * @param {string} productId
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>}
   * @throws {WishlistNotFoundError | WishlistError}
   */
  async remove(productId) {
    try {
      const response = await wishlistApi.removeItem(productId);
      return extractAndNormalizeItems(response);
    } catch (err) {
      throw fromHttpError(err, productId);
    }
  },

  /**
   * Vacía toda la wishlist en el backend.
   *
   * @returns {Promise<[]>}
   * @throws {WishlistError}
   */
  async clear() {
    try {
      await wishlistApi.clearWishlist();
      return [];
    } catch (err) {
      throw fromHttpError(err);
    }
  },

  /**
   * No aplica en modo autenticado.
   * Implementado para mantener simetría de interfaz con guest.adapter.
   *
   * @returns {[]} Siempre vacío
   */
  getGuestItems() {
    return [];
  },

  /**
   * No aplica en modo autenticado.
   * No-op para mantener simetría de interfaz con guest.adapter.
   */
  clearStorage() {
    // No-op intencional
  },

  // ============================================================================
  // OPERACIONES EXCLUSIVAS DE AUTH
  // ============================================================================

  /**
   * Mueve productos de la wishlist al carrito.
   *
   * @param {string[]} productIds
   * @returns {Promise<{ movedItems: Object[], movedCount: number }>}
   * @throws {WishlistError}
   */
  async moveToCart(productIds) {
    try {
      const response = await wishlistApi.moveToCart(productIds);
      const data = response?.data?.data || response?.data || {};
      return {
        movedItems: data.movedItems || [],
        movedCount: data.movedCount || 0,
      };
    } catch (err) {
      throw fromHttpError(err);
    }
  },

  /**
   * Obtiene productos de la wishlist con cambios de precio.
   *
   * @returns {Promise<Object[]>}
   * @throws {WishlistError}
   */
  async getPriceChanges() {
    try {
      const response = await wishlistApi.getPriceChanges();
      const data = response?.data?.data || response?.data || [];
      return Array.isArray(data) ? data : [];
    } catch (err) {
      throw fromHttpError(err);
    }
  },

  /**
   * Sincroniza items guest al usuario autenticado (bulk upsert).
   *
   * El proceso:
   * 1. Filtra items guest inválidos
   * 2. Los convierte al payload que espera el backend
   * 3. Llama al endpoint de sync
   * 4. Retorna métricas del proceso
   *
   * Si no hay items válidos para sincronizar, retorna éxito inmediato
   * sin llamar al backend.
   *
   * @param {Object[]} guestItems - Items raw del localStorage
   * @returns {Promise<{ migratedCount: number, failedCount: number }>}
   * @throws {WishlistSyncError}
   */
  async sync(guestItems) {
    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return { migratedCount: 0, failedCount: 0 };
    }

    // Filtrar items válidos antes de enviar al backend
    const { validItems, invalidCount } = guestItems.reduce(
      (acc, item) => {
        const { valid } = validateGuestItem(item);
        if (valid) {
          acc.validItems.push(item);
        } else {
          acc.invalidCount++;
          console.warn('[AuthAdapter] Item guest inválido descartado en sync:', item);
        }
        return acc;
      },
      { validItems: [], invalidCount: 0 }
    );

    if (validItems.length === 0) {
      return { migratedCount: 0, failedCount: invalidCount };
    }

    try {
      // Construir payload para el endpoint de sync
      // toSyncPayload convierte WishlistItems canónicos, pero aquí tenemos raw items
      // Los normalizamos mínimamente para extraer los campos necesarios
      const payload = validItems.map(item => ({
        productId: String(item.productId),
        notifyPriceChange: Boolean(item.notifyPriceChange ?? false),
        notifyAvailability: Boolean(item.notifyAvailability ?? false),
        addedAt: item.addedAt || new Date().toISOString(),
      }));

      const response = await wishlistApi.syncGuestItems(payload);
      const data = response?.data?.data || response?.data || {};

      return {
        migratedCount: data.migratedCount ?? validItems.length,
        failedCount: invalidCount + (data.failedCount ?? 0),
      };
    } catch (err) {
      const { WishlistSyncError } = await import('../../domain/wishlist.errors');
      throw new WishlistSyncError(
        err.response?.data?.message || err.message || 'unknown error'
      );
    }
  },
};

export default authenticatedAdapter;