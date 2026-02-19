/**
 * @module guest.adapter
 * @description Adapter de persistencia para usuarios no autenticados.
 *
 * Implementa la interfaz del repository usando localStorage.
 * El store nunca toca localStorage directamente — todo pasa por aquí.
 *
 * INTERFACE CONTRACT (debe ser simétrica con authenticated.adapter.js):
 *   get()                       → Promise<WishlistItem[]>
 *   add(itemData)               → Promise<WishlistItem[]>
 *   remove(productId)           → Promise<WishlistItem[]>
 *   clear()                     → Promise<WishlistItem[]>
 *   getGuestItems()             → WishlistItem[]  (síncrono, para capturar antes del swap)
 *   clearStorage()              → void            (síncrono, para limpieza post-sync)
 *
 * OPERACIONES NO DISPONIBLES EN GUEST (retornan vacío o lanzan WishlistModeError):
 *   moveToCart()                → WishlistModeError
 *   getPriceChanges()           → []
 *   sync()                      → WishlistModeError
 */

import {
  createWishlistItem,
  createGuestItem,
} from '../../domain/wishlist.model';
import {
  WishlistDuplicateError,
  WishlistModeError,
} from '../../domain/wishlist.errors';
import { validateGuestItem } from '../../domain/wishlist.validators';

// ============================================================================
// STORAGE KEY - ÚNICO LUGAR DONDE SE DEFINE
// ============================================================================

/**
 * Key de localStorage para la wishlist guest.
 *
 * Problema resuelto: esta key estaba hardcodeada en 3 archivos distintos
 * (WishlistContext.jsx, syncGuestWishlistToUser.js, y CustomerWishlistContext.jsx).
 * Ahora existe en un único lugar.
 */
const STORAGE_KEY = 'killavibes_wishlist_guest';

// ============================================================================
// HELPERS DE STORAGE
// ============================================================================

/**
 * Lee los items raw del localStorage de forma segura.
 * Maneja JSON corrupto y formatos inesperados.
 *
 * @returns {Object[]} Array de items raw (puede estar vacío)
 */
const readFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      console.warn('[GuestAdapter] localStorage corrupto, inicializando vacío');
      return [];
    }

    return parsed;
  } catch (err) {
    console.error('[GuestAdapter] Error leyendo localStorage:', err);
    return [];
  }
};

/**
 * Escribe los items al localStorage de forma segura.
 *
 * @param {Object[]} items
 */
const writeToStorage = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (err) {
    // QuotaExceededError u otros errores de storage
    console.error('[GuestAdapter] Error escribiendo en localStorage:', err);
  }
};

// ============================================================================
// ADAPTER
// ============================================================================

export const guestAdapter = {

  /**
   * Obtiene todos los items de la wishlist guest.
   * Normaliza cada item al modelo canónico, descartando los corruptos.
   *
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>}
   */
  async get() {
    const rawItems = readFromStorage();

    return rawItems.reduce((acc, raw) => {
      // Solo procesamos items que pasen validación mínima
      const { valid } = validateGuestItem(raw);
      if (!valid) {
        console.warn('[GuestAdapter] Item descartado:', raw);
        return acc;
      }

      try {
        acc.push(createWishlistItem(raw));
      } catch (err) {
        console.warn('[GuestAdapter] Error normalizando item:', raw, err.message);
      }

      return acc;
    }, []);
  },

  /**
   * Agrega un item a la wishlist guest.
   * Lanza WishlistDuplicateError si el producto ya existe.
   *
   * @param {Object} itemData - { productId, notifyPriceChange?, notifyAvailability? }
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>} Items actualizados
   * @throws {WishlistDuplicateError}
   */
  async add(itemData) {
    const currentRaw = readFromStorage();

    // Verificar duplicado
    const exists = currentRaw.some(
      i => String(i.productId) === String(itemData.productId)
    );

    if (exists) {
      throw new WishlistDuplicateError(itemData.productId);
    }

    const newRawItem = createGuestItem(itemData.productId, {
      notifyPriceChange: itemData.notifyPriceChange,
      notifyAvailability: itemData.notifyAvailability,
    });

    const updatedRaw = [...currentRaw, newRawItem];
    writeToStorage(updatedRaw);

    return this.get();
  },

  /**
   * Elimina un producto de la wishlist guest.
   * Si el producto no existe, retorna el estado actual sin error (idempotente).
   *
   * @param {string} productId
   * @returns {Promise<import('../../domain/wishlist.model').WishlistItem[]>} Items actualizados
   */
  async remove(productId) {
    const currentRaw = readFromStorage();
    const filteredRaw = currentRaw.filter(
      i => String(i.productId) !== String(productId)
    );

    writeToStorage(filteredRaw);
    return this.get();
  },

  /**
   * Vacía toda la wishlist guest.
   *
   * @returns {Promise<[]>} Array vacío
   */
  async clear() {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  },

  /**
   * Lectura síncrona de los items guest.
   * Usado por el store para capturar los items ANTES del swap de adapter
   * durante la sincronización (el swap borra el acceso al localStorage).
   *
   * @returns {Object[]} Items raw del localStorage (sin normalizar, para pasar al sync)
   */
  getGuestItems() {
    return readFromStorage();
  },

  /**
   * Elimina el localStorage de forma síncrona.
   * Llamado por el store DESPUÉS de confirmar que el sync fue exitoso.
   * Separado de `clear()` (que es async) para garantizar que se ejecuta
   * de forma atómica durante el proceso de swap.
   */
  clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error('[GuestAdapter] Error limpiando localStorage:', err);
    }
  },

  // ============================================================================
  // OPERACIONES NO DISPONIBLES EN GUEST
  // ============================================================================

  /**
   * moveToCart no está disponible para usuarios guest.
   * @throws {WishlistModeError}
   */
  async moveToCart() {
    throw new WishlistModeError('moveToCart', 'guest');
  },

  /**
   * getPriceChanges no aplica en modo guest (sin price tracking).
   * Retorna vacío en lugar de lanzar error para no interrumpir
   * flujos que llamen a esto sin verificar el modo.
   *
   * @returns {Promise<[]>}
   */
  async getPriceChanges() {
    return [];
  },

  /**
   * sync no se llama en modo guest (es la operación de transición).
   * @throws {WishlistModeError}
   */
  async sync() {
    throw new WishlistModeError('sync', 'guest');
  },
};

export default guestAdapter;