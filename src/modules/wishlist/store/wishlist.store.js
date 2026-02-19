/**
 * @module wishlist.store
 * @description Store Zustand - única fuente de verdad del dominio Wishlist.
 *
 * RESPONSABILIDADES:
 * - Mantener estado: wishlist, loading, error, initialized, syncStatus
 * - Exponer acciones que delegan 100% al repository
 * - Manejar loading granular por item (Set de productIds)
 * - Orquestar el swap de adapter en el momento del login/logout
 *
 * LO QUE ESTE STORE NO HACE:
 * - No llama a la API directamente (eso lo hace el repository)
 * - No normaliza datos (eso lo hace el domain model)
 * - No calcula derivados (eso lo hacen los hooks con selectors)
 * - No tiene lógica de presentación
 *
 * PATRÓN DE LOADING:
 * - loading.global    → operaciones que afectan toda la wishlist (fetch, clear, sync)
 * - loading.items     → Set de productIds con operación en curso (add, remove)
 *   Permite que el UI muestre loading granular por botón sin bloquear toda la lista.
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { wishlistRepository } from '../repository/wishlist.repository';
import {
  createInitialState,
  WishlistMode,
  SyncStatus,
} from '../domain/wishlist.model';
import {
  WishlistDuplicateError,
  WishlistModeError,
} from '../domain/wishlist.errors';

// ============================================================================
// HELPERS INTERNOS DEL STORE
// ============================================================================

/**
 * Agrega un productId al Set de loading.items de forma inmutable.
 * Zustand requiere nuevas referencias para detectar cambios.
 */
const addLoadingItem = (set, productId) => {
  set(state => ({
    loading: {
      ...state.loading,
      items: new Set([...state.loading.items, productId]),
    },
  }));
};

/**
 * Elimina un productId del Set de loading.items de forma inmutable.
 */
const removeLoadingItem = (set, productId) => {
  set(state => {
    const next = new Set(state.loading.items);
    next.delete(productId);
    return { loading: { ...state.loading, items: next } };
  });
};

/**
 * Extrae el mensaje de usuario de cualquier tipo de error.
 * Prioriza userMessage (errores de dominio tipados) sobre message genérico.
 */
const extractErrorMessage = (err) => {
  return err?.userMessage || err?.message || 'Error inesperado';
};

// ============================================================================
// STORE
// ============================================================================

export const useWishlistStore = create(
  devtools(
    (set, get) => ({

      // ============================================================================
      // ESTADO INICIAL
      // ============================================================================

      ...createInitialState(),

      // ============================================================================
      // ACCIONES: LECTURA
      // ============================================================================

      /**
       * Carga la wishlist desde el adapter activo.
       * Idempotente: si ya está inicializado y no se fuerza refresh, no hace nada.
       *
       * @param {boolean} [forceRefresh=false]
       */
      fetchWishlist: async (forceRefresh = false) => {
        const { initialized, loading } = get();

        if (initialized && !forceRefresh && !loading.global) return;

        set({ loading: { ...get().loading, global: true }, error: null });

        try {
          const wishlist = await wishlistRepository.get();
          set({ wishlist, initialized: true });
        } catch (err) {
          set({ error: extractErrorMessage(err) });
          console.error('[WishlistStore] fetchWishlist error:', err);
        } finally {
          set(state => ({ loading: { ...state.loading, global: false } }));
        }
      },

      /**
       * Alias semántico para refresh explícito desde UI.
       */
      refreshWishlist: () => get().fetchWishlist(true),

      // ============================================================================
      // ACCIONES: ESCRITURA CORE
      // ============================================================================

      /**
       * Agrega un producto a la wishlist.
       *
       * Loading granular: solo el botón del producto específico muestra spinner,
       * el resto de la lista sigue siendo interactiva.
       *
       * Maneja WishlistDuplicateError silenciosamente (no es un error de usuario).
       *
       * @param {Object} itemData - { productId, notifyPriceChange?, notifyAvailability? }
       * @returns {Promise<{ success: boolean, error?: string, isDuplicate?: boolean }>}
       */
      addItem: async (itemData) => {
        const { productId } = itemData;
        addLoadingItem(set, productId);

        try {
          const wishlist = await wishlistRepository.add(itemData);
          set({ wishlist, error: null });
          return { success: true };
        } catch (err) {
          // Duplicado no es un error de UI — el item ya estaba, no hay nada roto
          if (err instanceof WishlistDuplicateError) {
            return { success: true, isDuplicate: true };
          }

          const message = extractErrorMessage(err);
          set({ error: message });
          return { success: false, error: message };
        } finally {
          removeLoadingItem(set, productId);
        }
      },

      /**
       * Elimina un producto de la wishlist.
       *
       * @param {string} productId
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      removeItem: async (productId) => {
        addLoadingItem(set, productId);

        try {
          const wishlist = await wishlistRepository.remove(productId);
          set({ wishlist, error: null });
          return { success: true };
        } catch (err) {
          const message = extractErrorMessage(err);
          set({ error: message });
          return { success: false, error: message };
        } finally {
          removeLoadingItem(set, productId);
        }
      },

      /**
       * Vacía toda la wishlist.
       *
       * @returns {Promise<{ success: boolean, error?: string }>}
       */
      clearWishlist: async () => {
        set(state => ({ loading: { ...state.loading, global: true }, error: null }));

        try {
          const wishlist = await wishlistRepository.clear();
          set({ wishlist });
          return { success: true };
        } catch (err) {
          const message = extractErrorMessage(err);
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set(state => ({ loading: { ...state.loading, global: false } }));
        }
      },

      // ============================================================================
      // ACCIONES: SOLO AUTHENTICATED
      // ============================================================================

      /**
       * Mueve productos de la wishlist al carrito.
       *
       * Maneja WishlistModeError cuando el usuario no está autenticado,
       * exponiendo un mensaje claro para la UI.
       *
       * @param {string[]} productIds
       * @returns {Promise<{ success: boolean, movedCount?: number, error?: string }>}
       */
      moveToCart: async (productIds) => {
        set(state => ({ loading: { ...state.loading, global: true }, error: null }));

        try {
          const result = await wishlistRepository.moveToCart(productIds);

          // Refresh de la wishlist porque el backend la modifica al mover items
          await get().fetchWishlist(true);

          return { success: true, movedCount: result.movedCount };
        } catch (err) {
          if (err instanceof WishlistModeError) {
            return {
              success: false,
              error: err.userMessage,
              requiresAuth: true,
            };
          }

          const message = extractErrorMessage(err);
          set({ error: message });
          return { success: false, error: message };
        } finally {
          set(state => ({ loading: { ...state.loading, global: false } }));
        }
      },

      /**
       * Obtiene los cambios de precio de la wishlist.
       * En modo guest retorna array vacío (el adapter lo maneja).
       *
       * @returns {Promise<{ success: boolean, data?: Object[], error?: string }>}
       */
      getPriceChanges: async () => {
        try {
          const data = await wishlistRepository.getPriceChanges();
          return { success: true, data };
        } catch (err) {
          const message = extractErrorMessage(err);
          return { success: false, error: message, data: [] };
        }
      },

      // ============================================================================
      // ACCIONES: TRANSICIONES DE MODO (AUTH)
      // ============================================================================

      /**
       * Llamado cuando el usuario inicia sesión.
       * Orquesta el proceso completo de swap + sincronización.
       *
       * El store actualiza syncStatus en cada etapa para que useWishlistSync
       * pueda mostrar feedback en la UI durante el proceso.
       *
       * @returns {Promise<{
       *   success: boolean,
       *   migratedCount: number,
       *   failedCount: number,
       *   hadGuestItems: boolean,
       *   error?: string
       * }>}
       */
      onLogin: async () => {
        set({
          syncStatus: SyncStatus.IN_PROGRESS,
          loading: { ...get().loading, global: true },
          error: null,
        });

        try {
          const result = await wishlistRepository.switchToAuthenticated();

          set({
            wishlist: result.wishlist,
            mode: WishlistMode.AUTHENTICATED,
            initialized: true,
            syncStatus: SyncStatus.COMPLETED,
            syncResult: {
              migratedCount: result.migratedCount,
              failedCount: result.failedCount,
            },
          });

          return {
            success: true,
            migratedCount: result.migratedCount,
            failedCount: result.failedCount,
            hadGuestItems: result.hadGuestItems,
          };
        } catch (err) {
          const message = extractErrorMessage(err);

          set({
            syncStatus: SyncStatus.FAILED,
            error: message,
          });

          return {
            success: false,
            migratedCount: 0,
            failedCount: 0,
            hadGuestItems: false,
            error: message,
          };
        } finally {
          set(state => ({ loading: { ...state.loading, global: false } }));
        }
      },

      /**
       * Llamado cuando el usuario cierra sesión.
       * Revierte al modo guest y carga la wishlist del localStorage.
       */
      onLogout: async () => {
        set({
          loading: { global: true, items: new Set() },
          error: null,
          syncStatus: SyncStatus.IDLE,
          syncResult: null,
        });

        try {
          const wishlist = await wishlistRepository.switchToGuest();
          set({
            wishlist,
            mode: WishlistMode.GUEST,
            initialized: true,
          });
        } catch (err) {
          // En caso de error en logout, reseteamos a estado vacío
          // para no dejar datos del usuario anterior expuestos
          const { createWishlist } = await import('../domain/wishlist.model');
          set({
            wishlist: createWishlist(null),
            mode: WishlistMode.GUEST,
            initialized: true,
            error: null,
          });
        } finally {
          set(state => ({ loading: { ...state.loading, global: false } }));
        }
      },

      // ============================================================================
      // ACCIONES: UTILIDADES
      // ============================================================================

      /**
       * Limpia el error actual del store.
       * Útil para dismiss de toasts de error desde la UI.
       */
      clearError: () => set({ error: null }),

      /**
       * Resetea el syncStatus a IDLE.
       * Llamado por useWishlistSync después de mostrar el feedback al usuario.
       */
      clearSyncStatus: () => set({
        syncStatus: SyncStatus.IDLE,
        syncResult: null,
      }),
    }),

    // Nombre para Redux DevTools
    { name: 'WishlistStore' }
  )
);

// ============================================================================
// SELECTORS ATÓMICOS (para uso con useWishlistStore con selector)
// ============================================================================

/**
 * Selectors atómicos para evitar re-renders innecesarios.
 *
 * Uso: const wishlist = useWishlistStore(selectors.wishlist);
 * En lugar de: const { wishlist } = useWishlistStore(); // re-render en CUALQUIER cambio
 *
 * @example
 * // Solo re-renderiza cuando cambia wishlist, no cuando cambia loading
 * const wishlist = useWishlistStore(wishlistSelectors.wishlist);
 */
export const wishlistSelectors = {
  wishlist:     state => state.wishlist,
  items:        state => state.wishlist.items,
  itemCount:    state => state.wishlist.itemCount,
  loading:      state => state.loading,
  globalLoading: state => state.loading.global,
  loadingItems: state => state.loading.items,
  error:        state => state.error,
  initialized:  state => state.initialized,
  mode:         state => state.mode,
  syncStatus:   state => state.syncStatus,
  syncResult:   state => state.syncResult,
  isEmpty:      state => state.wishlist.items.length === 0,

  // Acciones (estables, no causan re-renders)
  actions: state => ({
    fetchWishlist:   state.fetchWishlist,
    refreshWishlist: state.refreshWishlist,
    addItem:         state.addItem,
    removeItem:      state.removeItem,
    clearWishlist:   state.clearWishlist,
    moveToCart:      state.moveToCart,
    getPriceChanges: state.getPriceChanges,
    onLogin:         state.onLogin,
    onLogout:        state.onLogout,
    clearError:      state.clearError,
    clearSyncStatus: state.clearSyncStatus,
  }),
};

export default useWishlistStore;