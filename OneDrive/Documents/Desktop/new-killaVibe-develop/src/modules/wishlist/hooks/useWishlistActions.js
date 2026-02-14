// wishlist/hooks/useWishlistActions.js

import { useState, useCallback } from "react";
import { useWishlistContext } from "../context/WishlistContext";
import {
  validateAddItem,
  validateMoveToCart,
  getValidationErrors,
} from "../schemas/wishlist.schema";

/**
 * @hook useWishlistActions
 * @description Hook para acciones de wishlist (UI + sistema)
 * 
 * 🆕 MEJORADO:
 * - Loading state unificado
 * - Error handling consistente con Cart
 */
const useWishlistActions = (onSuccess, onError) => {
  const {
    addItem: contextAddItem,
    removeItem: contextRemoveItem,
    clearWishlistItems: contextClearWishlist,
    moveToCart: contextMoveToCart,
    checkProduct: contextCheckProduct,
    getPriceChanges: contextGetPriceChanges,
    migrateGuestWishlistToUser,
    clearGuestWishlist,
    loading: contextLoading,
    error: contextError,
  } = useWishlistContext();

  const [actionError, setActionError] = useState(null);

  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  // ============================================================================
  // HELPER: EJECUTAR ACCIÓN
  // ============================================================================

  const executeAction = useCallback(
    async (action, successMessage) => {
      try {
        setActionError(null);
        const result = await action();

        if (onSuccess && successMessage) {
          onSuccess(successMessage);
        }

        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al realizar la acción";

        setActionError(errorMessage);

        if (onError) {
          onError(errorMessage, err);
        }

        throw err;
      }
    },
    [onSuccess, onError]
  );

  // ============================================================================
  // UI ACTIONS
  // ============================================================================

  const addToWishlist = useCallback(
    async (itemData) => {
      try {
        const validatedData = await validateAddItem(itemData);
        
        return await executeAction(
          () => contextAddItem(validatedData),
          "Producto agregado a tu lista de deseos"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errorMsg = getValidationErrors(err)[0] || "Error de validación";
          setActionError(errorMsg);
          if (onError) {
            onError(errorMsg, err);
          }
        }
        throw err;
      }
    },
    [contextAddItem, executeAction, onError]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      return await executeAction(
        () => contextRemoveItem(productId),
        "Producto eliminado de tu lista de deseos"
      );
    },
    [contextRemoveItem, executeAction]
  );

  const clearWishlist = useCallback(async () => {
    return await executeAction(
      () => contextClearWishlist(),
      "Lista de deseos vaciada"
    );
  }, [contextClearWishlist, executeAction]);

  const moveToCart = useCallback(
    async (productIds) => {
      try {
        await validateMoveToCart(productIds);
        
        const result = await executeAction(
          () => contextMoveToCart(productIds),
          null // No message aquí, se setea después
        );

        const count = result.movedCount || 0;
        const msg = `${count} producto${count !== 1 ? "s" : ""} movido${
          count !== 1 ? "s" : ""
        } al carrito`;

        if (onSuccess) {
          onSuccess(msg);
        }

        return result;
      } catch (err) {
        if (err.name === "ValidationError") {
          const errorMsg = getValidationErrors(err)[0] || "Error de validación";
          setActionError(errorMsg);
          if (onError) {
            onError(errorMsg, err);
          }
        }
        throw err;
      }
    },
    [contextMoveToCart, executeAction, onSuccess, onError]
  );

  const checkProduct = useCallback(
    async (productId) => {
      try {
        return await contextCheckProduct(productId);
      } catch {
        return false;
      }
    },
    [contextCheckProduct]
  );

  const getPriceChanges = useCallback(async () => {
    try {
      setActionError(null);
      return await contextGetPriceChanges();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al obtener cambios de precio";
      setActionError(errorMsg);
      if (onError) {
        onError(errorMsg, err);
      }
      throw err;
    }
  }, [contextGetPriceChanges, onError]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // UI
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    checkProduct,
    getPriceChanges,

    // 🔥 Sync (alias limpio para syncManager)
    syncGuestWishlistToUser: migrateGuestWishlistToUser,
    clearGuestWishlist,

    // State (unificado)
    loading: contextLoading,
    error: actionError || contextError,
    clearError,
  };
};

export default useWishlistActions;