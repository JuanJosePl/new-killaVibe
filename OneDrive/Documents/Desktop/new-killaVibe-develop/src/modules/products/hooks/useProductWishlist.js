// src/modules/products/hooks/useProductWishlist.js
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../core/hooks/useAuth';
import  useWishlistActions  from '../../wishlist/hooks/useWishlistActions';
import useWishlist from '../../wishlist/hooks/useWishlist';

/**
 * @hook useProductWishlist
 * @description Hook especializado para manejar Wishlist desde el módulo Products
 * 
 * FUNCIONALIDADES:
 * ✅ Agregar/remover de wishlist con validaciones
 * ✅ Toggle automático (add/remove)
 * ✅ Verificar si producto está en wishlist
 * ✅ Obtener item completo de wishlist
 * ✅ Mover a carrito
 * ✅ Validaciones de auth
 * ✅ Loading states
 * ✅ Error handling con toasts
 * 
 * @returns {Object} Funciones y estados de wishlist para productos
 */
export const useProductWishlist = () => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist: checkIsInWishlist, items, loading: wishlistStateLoading } = useWishlist();

  // Wishlist Actions con callbacks personalizados
  const {
    addToWishlist: addToWishlistAction,
    removeFromWishlist: removeFromWishlistAction,
    moveToCart: moveToCartAction,
    loading: wishlistActionLoading,
  } = useWishlistActions(
    (message) => toast.success(message),
    (error) => toast.error(error)
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const loading = wishlistStateLoading || wishlistActionLoading;

  /**
   * Verifica si un producto está en la wishlist
   */
  const isProductInWishlist = useCallback(
    (productId) => {
      if (!productId) return false;
      return checkIsInWishlist(productId);
    },
    [checkIsInWishlist]
  );

  /**
   * Obtiene el item completo de wishlist para un producto
   */
  const getWishlistItem = useCallback(
    (productId) => {
      if (!items || items.length === 0) return null;
      return items.find((item) => item.product?._id === productId) || null;
    },
    [items]
  );

  /**
   * Verifica si producto tiene cambio de precio
   */
  const hasPriceChange = useCallback(
    (productId) => {
      const item = getWishlistItem(productId);
      return item?.priceChanged || false;
    },
    [getWishlistItem]
  );

  /**
   * Verifica si producto tiene precio reducido
   */
  const hasPriceDrop = useCallback(
    (productId) => {
      const item = getWishlistItem(productId);
      return item?.priceDropped || false;
    },
    [getWishlistItem]
  );

  // ============================================================================
  // ACCIONES
  // ============================================================================

  /**
   * Agregar producto a wishlist con validaciones
   * @param {Object} product - Producto completo
   * @param {boolean} notifyPriceChange - Notificar cambios de precio
   * @param {boolean} notifyAvailability - Notificar disponibilidad
   */
  const addProductToWishlist = useCallback(
    async (product, notifyPriceChange = true, notifyAvailability = true) => {

      // Validación: Ya está en wishlist
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
    [isAuthenticated, isProductInWishlist, addToWishlistAction]
  );

  /**
   * Remover producto de wishlist
   * @param {string} productId - ID del producto
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
   * Toggle wishlist (agregar/remover automáticamente)
   * @param {Object} product - Producto completo
   */
  const toggleProductWishlist = useCallback(
    async (product) => {

      const inWishlist = isProductInWishlist(product._id);

      if (inWishlist) {
        return removeProductFromWishlist(product._id);
      } else {
        return addProductToWishlist(product, true, true);
      }
    },
    [
      isAuthenticated,
      isProductInWishlist,
      addProductToWishlist,
      removeProductFromWishlist,
    ]
  );

  /**
   * Mover producto de wishlist a carrito
   * @param {string} productId - ID del producto
   */
  const moveProductToCart = useCallback(
    async (productId) => {
      if (!isAuthenticated) {
        toast.warning('Debes iniciar sesión');
        return false;
      }

      try {
        await moveToCartAction([productId]);
        return true;
      } catch (error) {
        console.error('[useProductWishlist] Error moving to cart:', error);
        return false;
      }
    },
    [isAuthenticated, moveToCartAction]
  );

  /**
   * Mover múltiples productos a carrito
   * @param {Array<string>} productIds - Array de IDs
   */
  const moveMultipleToCart = useCallback(
    async (productIds) => {
      if (!isAuthenticated) {
        toast.warning('Debes iniciar sesión');
        return false;
      }

      if (!productIds || productIds.length === 0) {
        toast.error('No hay productos seleccionados');
        return false;
      }

      try {
        await moveToCartAction(productIds);
        return true;
      } catch (error) {
        console.error('[useProductWishlist] Error moving multiple to cart:', error);
        return false;
      }
    },
    [isAuthenticated, moveToCartAction]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estados
    loading,
    isAuthenticated,

    // Verificadores
    isProductInWishlist,
    getWishlistItem,
    hasPriceChange,
    hasPriceDrop,

    // Acciones principales
    addProductToWishlist,
    removeProductFromWishlist,
    toggleProductWishlist,

    // Acciones de movimiento
    moveProductToCart,
    moveMultipleToCart,
  };
};

export default useProductWishlist;