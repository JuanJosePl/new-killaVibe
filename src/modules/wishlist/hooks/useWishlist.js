/**
 * @hook useWishlist
 * @description Hook de solo lectura. Expone el estado de la wishlist con valores derivados.
 *
 * REEMPLAZA:
 * - useWishlist.js (anterior) — que mezclaba lectura y lógica de memos pesados
 * - Las partes de lectura de useWishlistOperations.js
 *
 * PRINCIPIO: Este hook solo lee. No despacha acciones.
 * Para acciones, usar useWishlistActions.
 *
 * PERFORMANCE:
 * Cada selector es atómico — el componente solo re-renderiza cuando
 * cambia exactamente el dato que consume, no todo el store.
 *
 * @example
 * const { items, isInWishlist, isEmpty, loading } = useWishlist();
 * const inList = isInWishlist('507f1f77bcf86cd799439011');
 */

import { useMemo } from 'react';
import { useWishlistStore, wishlistSelectors } from '../store/wishlist.store';
import { WishlistMode, SyncStatus } from '../domain/wishlist.model';

const useWishlist = () => {

  // ============================================================================
  // ESTADO BASE (selectores atómicos — mínimo re-render)
  // ============================================================================

  const wishlist      = useWishlistStore(wishlistSelectors.wishlist);
  const loading       = useWishlistStore(wishlistSelectors.loading);
  const error         = useWishlistStore(wishlistSelectors.error);
  const initialized   = useWishlistStore(wishlistSelectors.initialized);
  const mode          = useWishlistStore(wishlistSelectors.mode);
  const syncStatus    = useWishlistStore(wishlistSelectors.syncStatus);
  const syncResult    = useWishlistStore(wishlistSelectors.syncResult);

  const items = wishlist.items;

  // ============================================================================
  // VERIFICADOR DE WISHLIST (resuelto localmente, sin llamada a API)
  // ============================================================================

  /**
   * Verifica si un producto está en la wishlist.
   *
   * IMPORTANTE: Se calcula localmente sobre el estado del store.
   * El endpoint GET /wishlist/check/:productId solo se usa como validación
   * server-side si se necesita (disponible en useWishlistActions).
   *
   * El useMemo retorna una función estable que solo se recrea cuando
   * cambia el array de items — no en cada render.
   *
   * @param {string} productId
   * @returns {boolean}
   */
  const isInWishlist = useMemo(() => {
    return (productId) => {
      if (!productId || !items?.length) return false;
      return items.some(
        item => item.productId === String(productId)
      );
    };
  }, [items]);

  // ============================================================================
  // ARRAYS FILTRADOS
  // ============================================================================

  const availableItems = useMemo(
    () => items.filter(item => item.isAvailable === true),
    [items]
  );

  const unavailableItems = useMemo(
    () => items.filter(item => item.isAvailable === false),
    [items]
  );

  const itemsWithPriceChange = useMemo(
    () => items.filter(item => item.priceChanged === true),
    [items]
  );

  const itemsWithPriceDrop = useMemo(
    () => items.filter(item => item.priceDropped === true),
    [items]
  );

  // ============================================================================
  // ARRAYS ORDENADOS
  // ============================================================================

  /**
   * Items ordenados por fecha (más reciente primero).
   * Crea una copia para no mutar el estado del store.
   */
  const itemsByDate = useMemo(
    () => [...items].sort(
      (a, b) => new Date(b.addedAt) - new Date(a.addedAt)
    ),
    [items]
  );

  /**
   * Items ordenados por mayor descuento primero.
   */
  const itemsByPriceDrop = useMemo(
    () => [...items].sort(
      (a, b) => (Number(a.priceDifference) || 0) - (Number(b.priceDifference) || 0)
    ),
    [items]
  );

  // ============================================================================
  // BOOLEANOS DERIVADOS
  // ============================================================================

  const isEmpty             = items.length === 0;
  const isGuestMode         = mode === WishlistMode.GUEST;
  const isAuthMode          = mode === WishlistMode.AUTHENTICATED;
  const isSyncing           = syncStatus === SyncStatus.IN_PROGRESS;
  const hasPriceChanges     = itemsWithPriceChange.length > 0;
  const hasPriceDrops       = itemsWithPriceDrop.length > 0;
  const hasUnavailableItems = unavailableItems.length > 0;

  // ============================================================================
  // LOADING HELPERS
  // ============================================================================

  /**
   * Verifica si un item específico tiene una operación en curso.
   * Permite mostrar spinner por botón sin bloquear toda la lista.
   *
   * @param {string} productId
   * @returns {boolean}
   */
  const isItemLoading = useMemo(() => {
    return (productId) => loading.items.has(String(productId));
  }, [loading.items]);

  // ============================================================================
  // RESUMEN PARA ANALYTICS / UI HEADER
  // ============================================================================

  const summary = useMemo(() => ({
    itemCount:        items.length,
    availableCount:   availableItems.length,
    unavailableCount: unavailableItems.length,
    priceChangesCount: itemsWithPriceChange.length,
    priceDropsCount:  itemsWithPriceDrop.length,
    isEmpty,
  }), [
    items.length,
    availableItems.length,
    unavailableItems.length,
    itemsWithPriceChange.length,
    itemsWithPriceDrop.length,
    isEmpty,
  ]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado base
    wishlist,
    loading,
    error,
    initialized,
    mode,
    syncStatus,
    syncResult,

    // Arrays
    items,
    availableItems,
    unavailableItems,
    itemsWithPriceChange,
    itemsWithPriceDrop,
    itemsByDate,
    itemsByPriceDrop,

    // Booleanos
    isEmpty,
    isGuestMode,
    isAuthMode,
    isSyncing,
    hasPriceChanges,
    hasPriceDrops,
    hasUnavailableItems,

    // Counts
    itemCount:        items.length,
    availableCount:   availableItems.length,
    unavailableCount: unavailableItems.length,
    priceChangesCount: itemsWithPriceChange.length,
    priceDropsCount:  itemsWithPriceDrop.length,

    // Funciones
    isInWishlist,
    isItemLoading,

    // Resumen
    summary,
  };
};

export default useWishlist;