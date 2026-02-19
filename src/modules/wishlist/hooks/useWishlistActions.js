/**
 * @hook useWishlistActions
 * @description Hook de solo escritura. Expone acciones con feedback UI integrado.
 *
 * PRINCIPIO: Este hook solo escribe. Para leer estado, usar useWishlist.
 *
 * PATRÓN DE CALLBACKS:
 * onSuccess(message: string) — para toasts de éxito, puede ser null
 * onError(message: string, err?: WishlistError) — para toasts de error, puede ser null
 *
 * @param {Function} [onSuccess]
 * @param {Function} [onError]
 */

import { useCallback } from "react";
import { useWishlistStore } from "../store/wishlist.store";
import {
  validateAddItem,
  validateMoveToCart,
} from "../domain/wishlist.validators";
import { WishlistValidationError } from "../domain/wishlist.errors";

const useWishlistActions = (onSuccess = null, onError = null) => {
  // ============================================================================
  // SELECTORES ATÓMICOS (ESTABLES - NO OBJETOS COMPUESTOS)
  // ============================================================================

  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const clearWishlistStore = useWishlistStore((state) => state.clearWishlist);
  const moveToCart = useWishlistStore((state) => state.moveToCart);
  const getPriceChangesStore = useWishlistStore(
    (state) => state.getPriceChanges
  );
  const clearErrorStore = useWishlistStore((state) => state.clearError);
  const refreshWishlist = useWishlistStore(
    (state) => state.refreshWishlist
  );

  // Para toggle
  const items = useWishlistStore((state) => state.items);

  // ============================================================================
  // HELPER: EJECUTAR CON FEEDBACK
  // ============================================================================

  const withFeedback = useCallback(
    async (action, successMessage = null) => {
      const result = await action();

      if (result?.success) {
        if (successMessage && onSuccess) {
          onSuccess(successMessage);
        }
      } else {
        if (onError && result?.error) {
          onError(result.error);
        }
      }

      return result;
    },
    [onSuccess, onError]
  );

  // ============================================================================
  // CORE
  // ============================================================================

  const addToWishlist = useCallback(
    async (itemData) => {
      const validation = validateAddItem(itemData);

      if (!validation.valid) {
        const err = new WishlistValidationError(validation.errors);
        if (onError) onError(err.userMessage, err);
        return { success: false, error: err.userMessage };
      }

      const result = await withFeedback(
        () => addItem(itemData),
        "Producto agregado a tu lista de deseos"
      );

      if (result?.isDuplicate && onSuccess) {
        onSuccess("El producto ya estaba en tu lista de deseos");
      }

      return result;
    },
    [addItem, withFeedback, onSuccess, onError]
  );

  const removeFromWishlist = useCallback(
    async (productId) => {
      return withFeedback(
        () => removeItem(productId),
        "Producto eliminado de tu lista de deseos"
      );
    },
    [removeItem, withFeedback]
  );

  const toggleWishlist = useCallback(
    async (productId, addOptions = {}) => {
      const isInList = items.some(
        (item) => item.productId === String(productId)
      );

      if (isInList) {
        const result = await removeFromWishlist(productId);
        return { ...result, action: "removed" };
      } else {
        const result = await addToWishlist({
          productId,
          ...addOptions,
        });
        return { ...result, action: "added" };
      }
    },
    [items, addToWishlist, removeFromWishlist]
  );

  const clearWishlist = useCallback(async () => {
    return withFeedback(
      () => clearWishlistStore(),
      "Lista de deseos vaciada"
    );
  }, [clearWishlistStore, withFeedback]);

  // ============================================================================
  // CARRITO
  // ============================================================================

  const moveItemToCart = useCallback(
    async (productId) => {
      return withFeedback(
        () => moveToCart([productId]),
        "✓ Producto agregado al carrito"
      );
    },
    [moveToCart, withFeedback]
  );

  const moveMultipleToCart = useCallback(
    async (productIds) => {
      const validation = validateMoveToCart(productIds);

      if (!validation.valid) {
        const err = new WishlistValidationError(validation.errors);
        if (onError) onError(err.userMessage, err);
        return { success: false, error: err.userMessage };
      }

      const result = await moveToCart(productIds);

      if (result?.success) {
        const count = result.movedCount || 0;
        const msg = `✓ ${count} producto${count !== 1 ? "s" : ""} movido${
          count !== 1 ? "s" : ""
        } al carrito`;

        if (onSuccess) onSuccess(msg);
      } else {
        if (onError) onError(result?.error);
      }

      return result;
    },
    [moveToCart, onSuccess, onError]
  );

  // ============================================================================
  // PRICE CHANGES
  // ============================================================================

  const getPriceChanges = useCallback(async () => {
    return getPriceChangesStore();
  }, [getPriceChangesStore]);

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  const clearError = useCallback(() => {
    clearErrorStore();
  }, [clearErrorStore]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Core
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,

    // Carrito
    moveItemToCart,
    moveMultipleToCart,

    // Datos
    getPriceChanges,

    // Utilidades
    clearError,
    refreshWishlist,
  };
};

export default useWishlistActions;
