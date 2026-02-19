/**
 * @hook useProductWishlist
 * @description Bridge de integración entre el dominio Products y el dominio Wishlist.
 *
 * CAPA: integration/ (no es parte del core de Products)
 *
 * REGLA: Solo este archivo conoce ambos dominios.
 * El resto del módulo Products NO importa de modules/wishlist/.
 */

import { useCallback } from 'react';
import { toast } from 'react-toastify';

// Dominio Wishlist (ya migrado)
import useWishlistActions from '../../wishlist/hooks/useWishlistActions';
import useWishlist from '../../wishlist/hooks/useWishlist';
import { useAuth } from '../../../core/hooks/useAuth';

// ─────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────

export const useProductWishlist = () => {
  const { isAuthenticated } = useAuth();
  const {
    isInWishlist: checkIsInWishlist,
    items,
    loading: wishlistStateLoading,
  } = useWishlist();

  const {
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
    moveToCart: moveToCartAction,
    loading: wishlistActionLoading,
  } = useWishlistActions(
    (message) => toast.success(message),
    (error) => toast.error(error)
  );

  const loading = wishlistStateLoading || wishlistActionLoading;

  // ─────────────────────────────────────────────
  // VERIFICADORES
  // ─────────────────────────────────────────────

  const isProductInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return checkIsInWishlist(productId);
    },
    [checkIsInWishlist]
  );

  const getWishlistItem = useCallback(
    (productId) => {
      if (!items?.length) return null;
      return items.find((item) => item.product?._id === productId) ?? null;
    },
    [items]
  );

  const hasPriceChange = useCallback(
    (productId) => getWishlistItem(productId)?.priceChanged ?? false,
    [getWishlistItem]
  );

  const hasPriceDrop = useCallback(
    (productId) => getWishlistItem(productId)?.priceDropped ?? false,
    [getWishlistItem]
  );

  // ─────────────────────────────────────────────
  // ACCIONES
  // ─────────────────────────────────────────────

  /**
   * Agrega un producto a la wishlist.
   *
   * @param {import('../domain/product.entity').Product} product
   * @param {boolean} [notifyPriceChange=true]
   * @param {boolean} [notifyAvailability=true]
   * @returns {Promise<boolean>}
   */
  const addProductToWishlist = useCallback(
    async (product, notifyPriceChange = true, notifyAvailability = true) => {
      if (isProductInWishlist(product._id)) {
        toast.info('Este producto ya está en tu lista de deseos');
        return false;
      }

      try {
        await addToWishlistAction({
          productId: product._id,
          notifyPriceChange,
          notifyAvailability,
        });
        return true;
      } catch (error) {
        console.error('[useProductWishlist] Error adding to wishlist:', error);
        return false;
      }
    },
    [isProductInWishlist, addToWishlistAction]
  );

  /**
   * Elimina un producto de la wishlist.
   */
  const removeProductFromWishlist = useCallback(
    async (productId) => {
      try {
        await removeFromWishlistAction(productId);
        return true;
      } catch (error) {
        console.error('[useProductWishlist] Error removing from wishlist:', error);
        return false;
      }
    },
    [removeFromWishlistAction]
  );

  /**
   * Toggle automático: agrega si no está, elimina si está.
   */
  const toggleProductWishlist = useCallback(
    async (product) => {
      if (isProductInWishlist(product._id)) {
        return removeProductFromWishlist(product._id);
      }
      return addProductToWishlist(product);
    },
    [isProductInWishlist, addProductToWishlist, removeProductFromWishlist]
  );

  /**
   * Mueve uno o varios productos a carrito.
   * Requiere autenticación (la wishlist en backend es solo para auth).
   */
  const moveProductToCart = useCallback(
    async (productIds) => {
      if (!isAuthenticated) {
        toast.warning('Debes iniciar sesión para usar esta función');
        return false;
      }

      const ids = Array.isArray(productIds) ? productIds : [productIds];

      if (ids.length === 0) {
        toast.error('No hay productos seleccionados');
        return false;
      }

      try {
        await moveToCartAction(ids);
        return true;
      } catch (error) {
        console.error('[useProductWishlist] Error moving to cart:', error);
        return false;
      }
    },
    [isAuthenticated, moveToCartAction]
  );

  return {
    loading,
    isAuthenticated,

    // Verificadores
    isProductInWishlist,
    getWishlistItem,
    hasPriceChange,
    hasPriceDrop,

    // Acciones
    addProductToWishlist,
    removeProductFromWishlist,
    toggleProductWishlist,
    moveProductToCart,
  };
};

export default useProductWishlist;