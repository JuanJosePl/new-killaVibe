// src/modules/wishlist/hooks/useWishlist.js
import { useMemo } from 'react';
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
 * 
 * ✅ AGREGADO: isInWishlist(productId) para verificar si producto está en wishlist
 * 
 * @returns {Object} Wishlist state y helpers
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
  } = useWishlistContext();

  /**
   * Items disponibles (en stock, publicados)
   */
  const availableItems = useMemo(() => {
    return getAvailableItems(wishlist);
  }, [wishlist]);

  /**
   * Items no disponibles
   */
  const unavailableItems = useMemo(() => {
    return getUnavailableItems(wishlist);
  }, [wishlist]);

  /**
   * Items con cambio de precio
   */
  const itemsWithPriceChange = useMemo(() => {
    return getItemsWithPriceChange(wishlist);
  }, [wishlist]);

  /**
   * Items con precio reducido
   */
  const itemsWithPriceDrop = useMemo(() => {
    return getItemsWithPriceDrop(wishlist);
  }, [wishlist]);

  /**
   * Items ordenados por fecha (más reciente primero)
   */
  const itemsByDate = useMemo(() => {
    return sortByDateAdded(wishlist?.items || []);
  }, [wishlist]);

  /**
   * Items ordenados por mayor descuento
   */
  const itemsByPriceDrop = useMemo(() => {
    return sortByPriceDrop(wishlist?.items || []);
  }, [wishlist]);

  /**
   * Resumen completo de la wishlist
   */
  const summary = useMemo(() => {
    return generateWishlistSummary(wishlist);
  }, [wishlist]);

  /**
   * Todos los items (sin filtros)
   */
  const items = useMemo(() => {
    return wishlist?.items || [];
  }, [wishlist]);

  /**
   * Tiene items con cambios de precio?
   */
  const hasPriceChanges = useMemo(() => {
    return itemsWithPriceChange.length > 0;
  }, [itemsWithPriceChange]);

  /**
   * Tiene items con descuentos?
   */
  const hasPriceDrops = useMemo(() => {
    return itemsWithPriceDrop.length > 0;
  }, [itemsWithPriceDrop]);

  /**
   * Tiene items no disponibles?
   */
  const hasUnavailableItems = useMemo(() => {
    return unavailableItems.length > 0;
  }, [unavailableItems]);

  // ============================================================================
  // ✅ NUEVO: VERIFICAR SI PRODUCTO ESTÃ EN WISHLIST
  // ============================================================================

  /**
   * Verifica si un producto está en la wishlist
   * @param {string} productId - ID del producto
   * @returns {boolean}
   */
  const isInWishlist = useMemo(() => {
    return (productId) => {
      if (!productId || !wishlist) return false;
      return isProductInWishlist(wishlist, productId);
    };
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

    // Counts
    itemCount,
    availableCount: availableItems.length,
    unavailableCount: unavailableItems.length,
    priceChangesCount: itemsWithPriceChange.length,
    priceDropsCount: itemsWithPriceDrop.length,

    // Resumen
    summary,

    // ✅ AGREGADO: Verificador de wishlist
    isInWishlist,

    // Acciones
    fetchWishlist,
    refreshWishlist,
    clearCache,
    setError,
  };
};

export default useWishlist;