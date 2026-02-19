/**
 * @module wishlist.repository
 * @description Interfaz única de acceso a datos del dominio Wishlist.
 *
 * Es el intermediario entre el store y los adapters.
 * El store solo conoce el repository. Nunca habla con adapters ni con la API.
 *
 * RESPONSABILIDADES:
 * 1. Mantener referencia al adapter activo (guest o authenticated)
 * 2. Exponer una interfaz uniforme independiente del adapter
 * 3. Construir la entidad Wishlist canónica a partir de los items del adapter
 * 4. Orquestar el proceso de swap de adapter durante el sync
 *
 * LO QUE NO HACE:
 * - No maneja estado de React (sin useState, sin useEffect)
 * - No habla con la API directamente (eso lo hacen los adapters)
 * - No normaliza datos crudos (eso lo hace el domain model)
 * - No tiene lógica de UI
 */

import { guestAdapter } from './adapters/guest.adapter';
import { authenticatedAdapter } from './adapters/authenticated.adapter';
import {
  createWishlist,
  WishlistMode,
  toSyncPayload,
} from '../domain/wishlist.model';
import {
  WishlistModeError,
  WishlistSyncError,
} from '../domain/wishlist.errors';
import {
  validateAddItem,
  validateMoveToCart,
} from '../domain/wishlist.validators';
import { WishlistValidationError } from '../domain/wishlist.errors';

// ============================================================================
// FACTORY DEL REPOSITORY
// ============================================================================

/**
 * Crea una instancia del repository con su adapter activo.
 *
 * Se usa factory function en lugar de clase para facilitar
 * el mocking en tests y evitar el `this` binding problemático.
 *
 * @param {WishlistMode} initialMode - Modo inicial ('guest' | 'authenticated')
 * @returns {Object} Instancia del repository
 */
export const createWishlistRepository = (initialMode = WishlistMode.GUEST) => {

  // Estado interno del repository: qué adapter está activo
  let currentAdapter = initialMode === WishlistMode.AUTHENTICATED
    ? authenticatedAdapter
    : guestAdapter;

  let currentMode = initialMode;

  // ============================================================================
  // HELPERS INTERNOS
  // ============================================================================

  /**
   * Construye la entidad Wishlist canónica a partir de los items del adapter.
   * El repository siempre retorna una Wishlist, nunca un array de items suelto.
   *
   * @param {import('../domain/wishlist.model').WishlistItem[]} items
   * @param {string|null} userId
   * @returns {import('../domain/wishlist.model').Wishlist}
   */
  const buildWishlist = (items, userId = null) => {
    return createWishlist({ items, userId });
  };

  // ============================================================================
  // OPERACIONES CORE (disponibles en ambos modos)
  // ============================================================================

  const get = async () => {
    const items = await currentAdapter.get();
    return buildWishlist(items);
  };

  const add = async (itemData) => {
    // Validación de dominio antes de llamar al adapter
    const validation = validateAddItem(itemData);
    if (!validation.valid) {
      throw new WishlistValidationError(validation.errors);
    }

    const items = await currentAdapter.add(itemData);
    return buildWishlist(items);
  };

  const remove = async (productId) => {
    const items = await currentAdapter.remove(productId);
    return buildWishlist(items);
  };

  const clear = async () => {
    const items = await currentAdapter.clear();
    return buildWishlist(items);
  };

  // ============================================================================
  // OPERACIONES SOLO AUTHENTICATED
  // ============================================================================

  const moveToCart = async (productIds) => {
    if (currentMode !== WishlistMode.AUTHENTICATED) {
      throw new WishlistModeError('moveToCart', currentMode);
    }

    const validation = validateMoveToCart(productIds);
    if (!validation.valid) {
      throw new WishlistValidationError(validation.errors);
    }

    return currentAdapter.moveToCart(productIds);
  };

  const getPriceChanges = async () => {
    // En modo guest retorna vacío (el adapter lo maneja)
    return currentAdapter.getPriceChanges();
  };

  // ============================================================================
  // SINCRONIZACIÓN GUEST → AUTHENTICATED
  // ============================================================================

  /**
   * Orquesta el proceso completo de swap de adapter y sincronización.
   *
   * FLUJO (ver diseño arquitectónico, sección 3):
   * 1. Captura items guest ANTES del swap (síncrono, no puede fallar)
   * 2. Hace swap de adapter: guest → authenticated
   * 3. Fetch del estado real del backend
   * 4. Sync de items guest al backend (bulk upsert)
   * 5. Limpieza del localStorage SOLO si sync fue exitoso
   * 6. Retorna wishlist final + métricas del sync
   *
   * @returns {Promise<{
   *   wishlist: Wishlist,
   *   migratedCount: number,
   *   failedCount: number,
   *   hadGuestItems: boolean
   * }>}
   * @throws {WishlistSyncError} Solo si el fetch del backend falla (paso 3)
   */
  const switchToAuthenticated = async () => {
    // PASO 1: Capturar items guest de forma síncrona ANTES del swap
    // (después del swap perdemos acceso al guestAdapter)
    const guestItemsRaw = currentAdapter.getGuestItems();
    const hadGuestItems = guestItemsRaw.length > 0;

    // PASO 2: Swap de adapter
    currentAdapter = authenticatedAdapter;
    currentMode = WishlistMode.AUTHENTICATED;

    // PASO 3: Fetch del estado real del backend
    // Si este paso falla, el adapter ya fue swapeado pero tenemos error.
    // El store debe manejar este caso reseteando si es necesario.
    let currentItems;
    try {
      currentItems = await authenticatedAdapter.get();
    } catch (err) {
      throw new WishlistSyncError(
        `Failed to fetch authenticated wishlist: ${err.message}`
      );
    }

    // PASO 4: Sync de items guest (si había alguno)
    let migratedCount = 0;
    let failedCount = 0;

    if (hadGuestItems) {
      try {
        const syncResult = await authenticatedAdapter.sync(guestItemsRaw);
        migratedCount = syncResult.migratedCount;
        failedCount = syncResult.failedCount;

        // PASO 5: Limpieza SOLO si sync exitoso
        // guestAdapter.clearStorage() es síncrono para garantizar atomicidad
        guestAdapter.clearStorage();

        // PASO 6: Re-fetch para obtener wishlist con items sincronizados
        currentItems = await authenticatedAdapter.get();

      } catch (err) {
        // Fallo en sync: logueamos pero NO limpiamos el localStorage
        // Los items guest se preservan para reintento en próximo login
        console.error('[Repository] Sync parcialmente fallido:', err.message);

        if (err.migratedCount !== undefined) {
          migratedCount = err.migratedCount;
        }

        // No relanzamos: la app debe seguir funcionando con la wishlist
        // del backend aunque el sync haya fallado
      }
    }

    return {
      wishlist: buildWishlist(currentItems),
      migratedCount,
      failedCount,
      hadGuestItems,
    };
  };

  /**
   * Revierte al modo guest (logout).
   * Limpia el adapter activo y vuelve al guestAdapter.
   *
   * @returns {import('../domain/wishlist.model').Wishlist} Wishlist guest actual
   */
  const switchToGuest = async () => {
    currentAdapter = guestAdapter;
    currentMode = WishlistMode.GUEST;

    const items = await guestAdapter.get();
    return buildWishlist(items);
  };

  // ============================================================================
  // INTROSPECCIÓN (para el store y tests)
  // ============================================================================

  const getMode = () => currentMode;

  const isAuthenticated = () => currentMode === WishlistMode.AUTHENTICATED;

  // ============================================================================
  // API PÚBLICA DEL REPOSITORY
  // ============================================================================

  return {
    // Core (ambos modos)
    get,
    add,
    remove,
    clear,

    // Solo authenticated
    moveToCart,
    getPriceChanges,

    // Transiciones de modo
    switchToAuthenticated,
    switchToGuest,

    // Introspección
    getMode,
    isAuthenticated,
  };
};

// ============================================================================
// INSTANCIA SINGLETON
// ============================================================================

/**
 * Instancia única del repository para toda la aplicación.
 *
 * El modo inicial se detecta verificando si hay sesión activa.
 * Esto permite que si el usuario ya estaba autenticado al cargar la app,
 * el repository inicie directamente en modo authenticated.
 *
 * Nota: la detección de auth aquí es solo para el estado inicial.
 * Los cambios de auth en runtime se manejan via switchToAuthenticated/switchToGuest.
 */
const detectInitialMode = () => {
  try {
    // Usar la misma key que usa WishlistContext.jsx actualmente
    // Cuando se unifique el auth module, este detector se actualiza aquí
    const auth = localStorage.getItem('killavibes_auth');
    return auth ? WishlistMode.AUTHENTICATED : WishlistMode.GUEST;
  } catch {
    return WishlistMode.GUEST;
  }
};

export const wishlistRepository = createWishlistRepository(detectInitialMode());

export default wishlistRepository;