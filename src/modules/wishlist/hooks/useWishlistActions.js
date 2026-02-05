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
 */
const useWishlistActions = (onSuccess, onError) => {
  const {
    // UI actions
    addItem: contextAddItem,
    removeItem: contextRemoveItem,
    clearWishlistItems: contextClearWishlist,
    moveToCart: contextMoveToCart,
    checkProduct: contextCheckProduct,
    getPriceChanges: contextGetPriceChanges,

    // 🔥 SYSTEM actions (guest → user)
    migrateGuestWishlistToUser,
    clearGuestWishlist,
  } = useWishlistContext();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /* =========================
     UI ACTIONS
  ========================= */

  const addToWishlist = useCallback(
    async (itemData) => {
      try {
        setLoading(true);
        setError(null);

        const validatedData = await validateAddItem(itemData);
        const result = await contextAddItem(validatedData);

        onSuccess?.("Producto agregado a tu lista de deseos", result);
        return result;
      } catch (err) {
        let errorMsg = "Error al agregar producto";

        if (err.name === "ValidationError") {
          errorMsg = getValidationErrors(err)[0] || errorMsg;
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }

        setError(errorMsg);
        onError?.(errorMsg, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contextAddItem, onSuccess, onError]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      try {
        setLoading(true);
        setError(null);

        const result = await contextRemoveItem(productId);
        onSuccess?.("Producto eliminado de tu lista de deseos", result);
        return result;
      } catch (err) {
        const errorMsg =
          err.response?.data?.message || "Error al eliminar producto";
        setError(errorMsg);
        onError?.(errorMsg, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contextRemoveItem, onSuccess, onError]
  );

  const clearWishlist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await contextClearWishlist();
      onSuccess?.("Lista de deseos vaciada", result);
      return result;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Error al vaciar wishlist";
      setError(errorMsg);
      onError?.(errorMsg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextClearWishlist, onSuccess, onError]);

  const moveToCart = useCallback(
    async (productIds) => {
      try {
        setLoading(true);
        setError(null);

        await validateMoveToCart(productIds);
        const result = await contextMoveToCart(productIds);

        onSuccess?.(
          `${result.movedCount} producto${
            result.movedCount !== 1 ? "s" : ""
          } movido${result.movedCount !== 1 ? "s" : ""} al carrito`,
          result
        );

        return result;
      } catch (err) {
        let errorMsg = "Error al mover productos";

        if (err.name === "ValidationError") {
          errorMsg = getValidationErrors(err)[0] || errorMsg;
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }

        setError(errorMsg);
        onError?.(errorMsg, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contextMoveToCart, onSuccess, onError]
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
      setLoading(true);
      setError(null);
      return await contextGetPriceChanges();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Error al obtener cambios de precio";
      setError(errorMsg);
      onError?.(errorMsg, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [contextGetPriceChanges, onError]);

  /* =========================
     SYSTEM / SYNC ACTIONS
  ========================= */

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

    // State
    loading,
    error,
    clearError,
  };
};

export default useWishlistActions;
