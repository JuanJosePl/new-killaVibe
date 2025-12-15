import { useState, useCallback } from 'react';
import { useWishlistContext } from '../context/WishlistContext';
import { validateAddItem, validateMoveToCart, getValidationErrors } from '../schemas/wishlist.schema';

/**
 * @hook useWishlistActions
 * @description Hook para acciones de wishlist (add, remove, clear, etc)
 * 
 * Similar a useCartActions en arquitectura
 * 
 * @param {Function} onSuccess - Callback al éxito
 * @param {Function} onError - Callback al error
 * @returns {Object} Acciones y estado
 */
const useWishlistActions = (onSuccess, onError) => {
  const {
    addItem: contextAddItem,
    removeItem: contextRemoveItem,
    clearWishlistItems: contextClearWishlist,
    moveToCart: contextMoveToCart,
    checkProduct: contextCheckProduct,
    getPriceChanges: contextGetPriceChanges
  } = useWishlistContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Limpia el error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Agregar producto a wishlist
   * 
   * @param {Object} itemData
   * @param {string} itemData.productId
   * @param {boolean} [itemData.notifyPriceChange]
   * @param {boolean} [itemData.notifyAvailability]
   */
  const addToWishlist = useCallback(async (itemData) => {
    try {
      setLoading(true);
      setError(null);

      // Validación Yup
      const validatedData = await validateAddItem(itemData);

      // API call
      const result = await contextAddItem(validatedData);

      // Callback éxito
      if (onSuccess) {
        onSuccess('Producto agregado a tu lista de deseos', result);
      }

      return result;
    } catch (err) {
      console.error('[useWishlistActions] Error adding to wishlist:', err);

      let errorMsg = 'Error al agregar producto';

      // Errores de validación Yup
      if (err.name === 'ValidationError') {
        const errors = getValidationErrors(err);
        errorMsg = errors[0] || errorMsg;
      }
      // Errores de API
      else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setError(errorMsg);

      // Callback error
      if (onError) {
        onError(errorMsg, err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextAddItem, onSuccess, onError]);

  /**
   * Eliminar producto de wishlist
   * 
   * @param {string} productId
   */
  const removeFromWishlist = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const result = await contextRemoveItem(productId);

      if (onSuccess) {
        onSuccess('Producto eliminado de tu lista de deseos', result);
      }

      return result;
    } catch (err) {
      console.error('[useWishlistActions] Error removing from wishlist:', err);

      const errorMsg = err.response?.data?.message || 'Error al eliminar producto';
      setError(errorMsg);

      if (onError) {
        onError(errorMsg, err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextRemoveItem, onSuccess, onError]);

  /**
   * Limpiar toda la wishlist
   */
  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await contextClearWishlist();

      if (onSuccess) {
        onSuccess('Lista de deseos vaciada', result);
      }

      return result;
    } catch (err) {
      console.error('[useWishlistActions] Error clearing wishlist:', err);

      const errorMsg = err.response?.data?.message || 'Error al vaciar wishlist';
      setError(errorMsg);

      if (onError) {
        onError(errorMsg, err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextClearWishlist, onSuccess, onError]);

  /**
   * Mover productos a carrito
   * 
   * @param {Array<string>} productIds
   */
  const moveToCart = useCallback(async (productIds) => {
    try {
      setLoading(true);
      setError(null);

      // Validación Yup
      await validateMoveToCart(productIds);

      const result = await contextMoveToCart(productIds);

      if (onSuccess) {
        onSuccess(
          `${result.movedCount} producto${result.movedCount !== 1 ? 's' : ''} movido${result.movedCount !== 1 ? 's' : ''} al carrito`,
          result
        );
      }

      return result;
    } catch (err) {
      console.error('[useWishlistActions] Error moving to cart:', err);

      let errorMsg = 'Error al mover productos';

      if (err.name === 'ValidationError') {
        const errors = getValidationErrors(err);
        errorMsg = errors[0] || errorMsg;
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setError(errorMsg);

      if (onError) {
        onError(errorMsg, err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextMoveToCart, onSuccess, onError]);

  /**
   * Verificar si producto está en wishlist
   * 
   * @param {string} productId
   * @returns {Promise<boolean>}
   */
  const checkProduct = useCallback(async (productId) => {
    try {
      return await contextCheckProduct(productId);
    } catch (err) {
      console.error('[useWishlistActions] Error checking product:', err);
      return false;
    }
  }, [contextCheckProduct]);

  /**
   * Obtener cambios de precio
   * 
   * @returns {Promise<Array>}
   */
  const getPriceChanges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await contextGetPriceChanges();
      return result;
    } catch (err) {
      console.error('[useWishlistActions] Error getting price changes:', err);

      const errorMsg = err.response?.data?.message || 'Error al obtener cambios de precio';
      setError(errorMsg);

      if (onError) {
        onError(errorMsg, err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextGetPriceChanges, onError]);

  return {
    // Acciones principales
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    checkProduct,
    getPriceChanges,

    // Estado
    loading,
    error,
    clearError
  };
};

export default useWishlistActions;