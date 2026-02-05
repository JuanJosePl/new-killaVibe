import { useState, useCallback } from "react";
import { useCartContext } from "../context/CartContext";
import {
  validateAddItem,
  validateUpdateQuantity,
  validateCoupon,
  validateShippingAddress,
  validateShippingMethod,
  formatValidationErrors,
} from "../schemas/cart.schema";

/**
 * @hook useCartActions
 * @description Hook para acciones de carrito (UI + sistema)
 */
export const useCartActions = (onSuccess, onError) => {
  const {
    // UI actions
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,

    // 🔥 SYSTEM actions (guest → user)
    migrateGuestCartToUser,
    clearGuestCart,

    // Estado global del context
    loading: contextLoading,
    error: contextError,
  } = useCartContext();

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ============================================================================
  // HELPER: EJECUTAR ACCIÓN
  // ============================================================================

  const executeAction = useCallback(
    async (action, successMessage) => {
      try {
        setActionLoading(true);
        setActionError(null);

        const result = await action();

        onSuccess?.(successMessage || result?.message);
        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Error al realizar la acción";

        setActionError(errorMessage);
        onError?.(errorMessage, err);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    [onSuccess, onError]
  );

  // ============================================================================
  // ACCIONES UI
  // ============================================================================

  const addToCart = useCallback(
    async (itemData) => {
      try {
        const validatedData = await validateAddItem(itemData);

        return await executeAction(
          () => addItem(validatedData),
          "Producto agregado al carrito"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = formatValidationErrors(err);
          const msg = Object.values(errors)[0];
          setActionError(msg);
          onError?.(msg, err);
        }
        throw err;
      }
    },
    [addItem, executeAction, onError]
  );

  const updateQuantity = useCallback(
    async (productId, quantity, attributes = {}) => {
      try {
        const validatedData = await validateUpdateQuantity({
          quantity,
          attributes,
        });

        return await executeAction(
          () => updateItem(productId, validatedData),
          "Cantidad actualizada"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = formatValidationErrors(err);
          const msg = Object.values(errors)[0];
          setActionError(msg);
          onError?.(msg, err);
        }
        throw err;
      }
    },
    [updateItem, executeAction, onError]
  );

  const removeFromCart = useCallback(
    async (productId, attributes = {}) => {
      return await executeAction(
        () => removeItem(productId, attributes),
        "Producto eliminado del carrito"
      );
    },
    [removeItem, executeAction]
  );

  const clearCart = useCallback(async () => {
    return await executeAction(() => clearCartItems(), "Carrito vaciado");
  }, [clearCartItems, executeAction]);

  const applyCouponCode = useCallback(
    async (code) => {
      try {
        const validatedData = await validateCoupon({ code });

        return await executeAction(
          () => applyCoupon(validatedData.code),
          "Cupón aplicado correctamente"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = formatValidationErrors(err);
          const msg = Object.values(errors)[0];
          setActionError(msg);
          onError?.(msg, err);
        }
        throw err;
      }
    },
    [applyCoupon, executeAction, onError]
  );

  const updateAddress = useCallback(
    async (addressData) => {
      try {
        const validatedData = await validateShippingAddress(addressData);

        return await executeAction(
          () => updateShippingAddress(validatedData),
          "Dirección de envío actualizada"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = formatValidationErrors(err);
          const msg = Object.values(errors)[0];
          setActionError(msg);
          onError?.(msg, err);
        }
        throw err;
      }
    },
    [updateShippingAddress, executeAction, onError]
  );

  const updateShipping = useCallback(
    async (shippingData) => {
      try {
        const validatedData = await validateShippingMethod(shippingData);

        return await executeAction(
          () => updateShippingMethod(validatedData),
          "Método de envío actualizado"
        );
      } catch (err) {
        if (err.name === "ValidationError") {
          const errors = formatValidationErrors(err);
          const msg = Object.values(errors)[0];
          setActionError(msg);
          onError?.(msg, err);
        }
        throw err;
      }
    },
    [updateShippingMethod, executeAction, onError]
  );

  // ============================================================================
  // HELPERS
  // ============================================================================

  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // UI actions
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon: applyCouponCode,
    updateAddress,
    updateShipping,

    // 🔥 Sync (para syncManager)
    syncGuestCartToUser: migrateGuestCartToUser,
    clearGuestCart,

    // Estado
    loading: actionLoading || contextLoading,
    error: actionError || contextError,

    // Helpers
    clearError,
  };
};

export default useCartActions;
