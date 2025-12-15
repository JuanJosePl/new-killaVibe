import { useState, useCallback } from 'react';
import { useCartContext } from '../context/CartContext';
import { 
  validateAddItem, 
  validateUpdateQuantity, 
  validateCoupon,
  validateShippingAddress,
  validateShippingMethod,
  formatValidationErrors
} from '../schemas/cart.schema';

/**
 * @hook useCartActions
 * @description Hook para acciones de modificación del carrito
 * 
 * CARACTERÍSTICAS:
 * - Validación frontend antes de enviar
 * - Manejo de errores robusto
 * - Callbacks de éxito/error
 * - Loading states individuales
 * 
 * @param {Function} onSuccess - Callback al completar acción exitosa
 * @param {Function} onError - Callback al fallar acción
 * 
 * @returns {Object} Métodos de acción y estados
 * 
 * @example
 * const {
 *   addToCart,
 *   updateQuantity,
 *   removeFromCart,
 *   clearCart,
 *   applyCoupon,
 *   updateAddress,
 *   updateShipping,
 *   loading,
 *   error
 * } = useCartActions(onSuccess, onError);
 */
export const useCartActions = (onSuccess, onError) => {
  const context = useCartContext();
  
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  // ============================================================================
  // HELPER: EJECUTAR ACCIÓN
  // ============================================================================

  /**
   * Wrapper genérico para ejecutar acciones con manejo de errores
   */
  const executeAction = useCallback(async (action, successMessage) => {
    try {
      setActionLoading(true);
      setActionError(null);

      const result = await action();

      if (onSuccess) {
        onSuccess(successMessage || result?.message);
      }

      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al realizar la acción';
      setActionError(errorMessage);

      if (onError) {
        onError(errorMessage, err);
      }

      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [onSuccess, onError]);

  // ============================================================================
  // ACCIONES DEL CARRITO
  // ============================================================================

  /**
   * Agregar producto al carrito
   * Con validación Yup
   */
  const addToCart = useCallback(async (itemData) => {
    try {
      // Validar datos
      const validatedData = await validateAddItem(itemData);

      return await executeAction(
        () => context.addItem(validatedData),
        'Producto agregado al carrito'
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = formatValidationErrors(err);
        setActionError(Object.values(errors)[0]);
        if (onError) onError(Object.values(errors)[0], err);
        throw err;
      }
      throw err;
    }
  }, [context, executeAction, onError]);

  /**
   * Actualizar cantidad de producto
   * Con validación Yup
   */
  const updateQuantity = useCallback(async (productId, quantity, attributes = {}) => {
    try {
      // Validar datos
      const validatedData = await validateUpdateQuantity({ quantity, attributes });

      return await executeAction(
        () => context.updateItem(productId, validatedData),
        'Cantidad actualizada'
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = formatValidationErrors(err);
        setActionError(Object.values(errors)[0]);
        if (onError) onError(Object.values(errors)[0], err);
        throw err;
      }
      throw err;
    }
  }, [context, executeAction, onError]);

  /**
   * Eliminar producto del carrito
   */
  const removeFromCart = useCallback(async (productId, attributes = {}) => {
    return await executeAction(
      () => context.removeItem(productId, attributes),
      'Producto eliminado del carrito'
    );
  }, [context, executeAction]);

  /**
   * Vaciar carrito completo
   */
  const clearCart = useCallback(async () => {
    return await executeAction(
      () => context.clearCartItems(),
      'Carrito vaciado'
    );
  }, [context, executeAction]);

  /**
   * Aplicar cupón de descuento
   * Con validación Yup
   */
  const applyCouponCode = useCallback(async (code) => {
    try {
      // Validar cupón
      const validatedData = await validateCoupon({ code });

      return await executeAction(
        () => context.applyCoupon(validatedData.code),
        'Cupón aplicado correctamente'
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = formatValidationErrors(err);
        setActionError(Object.values(errors)[0]);
        if (onError) onError(Object.values(errors)[0], err);
        throw err;
      }
      throw err;
    }
  }, [context, executeAction, onError]);

  /**
   * Actualizar dirección de envío
   * Con validación Yup
   */
  const updateAddress = useCallback(async (addressData) => {
    try {
      // Validar dirección
      const validatedData = await validateShippingAddress(addressData);

      return await executeAction(
        () => context.updateShippingAddress(validatedData),
        'Dirección de envío actualizada'
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = formatValidationErrors(err);
        setActionError(Object.values(errors)[0]);
        if (onError) onError(Object.values(errors)[0], err);
        throw err;
      }
      throw err;
    }
  }, [context, executeAction, onError]);

  /**
   * Actualizar método de envío
   * Con validación Yup
   */
  const updateShipping = useCallback(async (shippingData) => {
    try {
      // Validar método
      const validatedData = await validateShippingMethod(shippingData);

      return await executeAction(
        () => context.updateShippingMethod(validatedData),
        'Método de envío actualizado'
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        const errors = formatValidationErrors(err);
        setActionError(Object.values(errors)[0]);
        if (onError) onError(Object.values(errors)[0], err);
        throw err;
      }
      throw err;
    }
  }, [context, executeAction, onError]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Limpiar errores
   */
  const clearError = useCallback(() => {
    setActionError(null);
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Acciones
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon: applyCouponCode,
    updateAddress,
    updateShipping,

    // Estados
    loading: actionLoading || context.loading,
    error: actionError || context.error,

    // Helpers
    clearError
  };
};

export default useCartActions;