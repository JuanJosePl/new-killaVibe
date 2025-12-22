// src/modules/wishlist/hooks/useWishlist.js
import { useMemo, useCallback } from 'react';
import { useWishlistContext } from '../context/WishlistContext';
import {
  getAvailableItems,
  getUnavailableItems,
  getItemsWithPriceChange,
  getItemsWithPriceDrop,
  generateWishlistSummary,
  sortByDateAdded,
  sortByPriceDrop,
  isProductInWishlist, 
} from '../utils/wishlistHelpers';

/**
 * @hook useWishlist
 * @description Hook principal para acceder a wishlist con datos calculados
 */
const useWishlist = () => {
  const {
    wishlist,
    loading,
    error,
    initialized,
    isEmpty,
    itemCount,
    fetchWishlist,
    refreshWishlist,
    clearCache,
    setError,
    addItem,      // Asegúrate de exportar estas acciones desde el context
    removeItem,
  } = useWishlistContext();

  /**
   * Todos los items (array base)
   * Extraemos .items para que los helpers trabajen sobre datos limpios
   */
  const items = useMemo(() => {
    return wishlist?.items || [];
  }, [wishlist]);

  /**
   * Items filtrados y procesados
   */
  const availableItems = useMemo(() => getAvailableItems(wishlist), [wishlist]);
  const unavailableItems = useMemo(() => getUnavailableItems(wishlist), [wishlist]);
  const itemsWithPriceChange = useMemo(() => getItemsWithPriceChange(wishlist), [wishlist]);
  const itemsWithPriceDrop = useMemo(() => getItemsWithPriceDrop(wishlist), [wishlist]);

  /**
   * Ordenamiento
   */
  const itemsByDate = useMemo(() => sortByDateAdded(items), [items]);
  const itemsByPriceDrop = useMemo(() => sortByPriceDrop(items), [items]);

  /**
   * Resumen y Flags
   */
  const summary = useMemo(() => generateWishlistSummary(wishlist), [wishlist]);
  const hasPriceChanges = itemsWithPriceChange.length > 0;
  const hasPriceDrops = itemsWithPriceDrop.length > 0;
  const hasUnavailableItems = unavailableItems.length > 0;

  // ============================================================================
  // ✅ CORRECCIÓN: isInWishlist como CALLBACK
  // ============================================================================
  
  /**
   * Verifica si un producto está en la wishlist.
   * Usamos useCallback en lugar de useMemo devolviendo una función para 
   * evitar regeneraciones innecesarias de la lógica de búsqueda.
   */
  const isInWishlist = useCallback((productId) => {
    if (!productId || !wishlist) return false;
    return isProductInWishlist(wishlist, productId);
  }, [wishlist]);

  return {
    // Estado base
    wishlist,
    loading,
    error,
    initialized,

    // Arrays de items
    items,
    availableItems,
    unavailableItems,
    itemsWithPriceChange,
    itemsWithPriceDrop,
    itemsByDate,
    itemsByPriceDrop,

    // Helpers booleanos
    isEmpty,
    hasPriceChanges,
    hasPriceDrops,
    hasUnavailableItems,

    // Conteos (Seguros)
    itemCount: itemCount || 0,
    availableCount: availableItems?.length || 0,
    unavailableCount: unavailableItems?.length || 0,
    priceChangesCount: itemsWithPriceChange?.length || 0,
    priceDropsCount: itemsWithPriceDrop?.length || 0,

    // Resumen
    summary,

    // ✅ Verificador corregido
    isInWishlist,

    // Acciones (Pasamos las del contexto para tener todo en un solo hook)
    fetchWishlist,
    refreshWishlist,
    addItem,
    removeItem,
    clearCache,
    setError,
  };
};

export default useWishlist;