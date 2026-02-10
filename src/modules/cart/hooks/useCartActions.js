// cart/hooks/useCartActions.js
import { useState, useCallback } from "react";
import { useCartContext } from "../context/CartContext";
import {
  validateUpdateQuantity,
  validateCoupon,
  validateShippingAddress,
  validateShippingMethod,
  formatValidationErrors,
} from "../schemas/cart.schema";

/**
 * @hook useCartActions
 *
 * ✅ FIX: addToCart ya NO valida con addItemSchema ni llama a validateAddItem.
 * La normalización del payload (productId, quantity, attributes) se hace aquí
 * antes de delegar al contexto, que recibe el objeto producto completo.
 * Esto evita que Yup con stripUnknown destruya los datos del producto
 * necesarios para el modo guest (name, price, images, slug, stock...).
 */
export const useCartActions = (onSuccess, onError) => {
  const {
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,
    migrateGuestCartToUser,
    clearGuestCart,
    loading: contextLoading,
    error: contextError,
  } = useCartContext();

  const [actionError, setActionError] = useState(null);

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
  // ACCIONES UI
  // ============================================================================

  /**
   * ✅ FIX PRINCIPAL: addToCart
   *
   * Acepta dos formas de llamada:
   *   1. addToCart(productObject, quantity)          ← desde ProductCard vía useProductCart
   *   2. addToCart({ productId, quantity, attributes }) ← llamada directa
   *
   * En ambos casos normaliza antes de delegar a CartContext.addItem,
   * que recibe (productData completo, quantity) para poder construir
   * el item correctamente tanto en modo guest como autenticado.
   */
  const addToCart = useCallback(
    async (productOrPayload, quantityArg = 1) => {
      // --- Normalizar entrada ---
      let productData;
      let quantity;

      if (
        productOrPayload &&
        typeof productOrPayload === "object" &&
        // Si viene con _id o id, es un objeto producto completo
        (productOrPayload._id || productOrPayload.id)
      ) {
        // Forma 1: objeto producto completo
        productData = productOrPayload;
        quantity = Number(quantityArg) || 1;
      } else if (
        productOrPayload &&
        typeof productOrPayload === "object" &&
        productOrPayload.productId
      ) {
        // Forma 2: payload ya construido { productId, quantity, attributes }
        // En este caso productData tendrá solo lo mínimo para modo autenticado
        productData = {
          _id: productOrPayload.productId,
          id: productOrPayload.productId,
          attributes: productOrPayload.attributes || {},
        };
        quantity =
          Number(productOrPayload.quantity) || Number(quantityArg) || 1;
      } else {
        const msg = "Datos de producto inválidos para agregar al carrito";
        setActionError(msg);
        if (onError) onError(msg, new Error(msg));
        throw new Error(msg);
      }

      // --- Validación mínima sin Yup para no destruir datos ---
      const productId = productData._id || productData.id;
      if (!productId) {
        const msg = "ID de producto requerido";
        setActionError(msg);
        if (onError) onError(msg, new Error(msg));
        throw new Error(msg);
      }

      if (quantity < 1 || quantity > 9999) {
        const msg = `Cantidad debe estar entre 1 y 9999`;
        setActionError(msg);
        if (onError) onError(msg, new Error(msg));
        throw new Error(msg);
      }

      // --- Delegar al contexto con datos completos ---
      return await executeAction(
        () => addItem(productData, quantity),
        "Producto agregado al carrito"
      );
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
          const msg = Object.values(errors)[0] || "Error de validación";
          setActionError(msg);
          if (onError) onError(msg, err);
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
          const msg = Object.values(errors)[0] || "Error de validación";
          setActionError(msg);
          if (onError) onError(msg, err);
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
          const msg = Object.values(errors)[0] || "Error de validación";
          setActionError(msg);
          if (onError) onError(msg, err);
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
          const msg = Object.values(errors)[0] || "Error de validación";
          setActionError(msg);
          if (onError) onError(msg, err);
        }
        throw err;
      }
    },
    [updateShippingMethod, executeAction, onError]
  );

  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  return {
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon: applyCouponCode,
    updateAddress,
    updateShipping,
    syncGuestCartToUser: migrateGuestCartToUser,
    clearGuestCart,
    loading: contextLoading,
    error: actionError || contextError,
    clearError,
  };
};

export default useCartActions;
