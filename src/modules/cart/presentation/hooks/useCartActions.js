/**
 * @hook useCartActions
 * @description Hook de solo escritura para el módulo Cart.
 *
 * - Valida inputs antes de llamar al store
 * - Integra callbacks de feedback (toast) opcionales
 * - Retorna { success, error? } — nunca lanza
 * - Compatible con la API antigua del CartContext
 *
 * @param {Function} [onSuccess] - (message: string) => void
 * @param {Function} [onError]   - (message: string) => void
 */

import { useCallback } from 'react';
import { useCartStore } from '../store/cart.store';
import {
  validateQuantity,
  validateCouponCode,
  validateShippingMethod,
  validateShippingAddress,
} from '../../domain/cart.validators';

const useCartActions = (onSuccess, onError) => {
  const storeAddItem             = useCartStore(s => s.addItem);
  const storeUpdateItem          = useCartStore(s => s.updateItem);
  const storeRemoveItem          = useCartStore(s => s.removeItem);
  const storeClearCart           = useCartStore(s => s.clearCart);
  const storeApplyCoupon         = useCartStore(s => s.applyCoupon);
  const storeUpdateShipAddress   = useCartStore(s => s.updateShippingAddress);
  const storeUpdateShipMethod    = useCartStore(s => s.updateShippingMethod);
  const storeFetchCart           = useCartStore(s => s.fetchCart);
  const storeOnLogin             = useCartStore(s => s.onLogin);
  const storeOnLogout            = useCartStore(s => s.onLogout);
  const storeClearError          = useCartStore(s => s.clearError);

  // ── HELPER ───────────────────────────────────────────────────────────────

  const notify = useCallback((result, successMsg) => {
    if (result.success) {
      if (onSuccess && successMsg) onSuccess(successMsg);
    } else {
      if (onError && result.error) onError(result.error);
    }
    return result;
  }, [onSuccess, onError]);

  // ── ACCIONES ─────────────────────────────────────────────────────────────

  /**
   * Agrega un producto al carrito.
   * Acepta:
   *   addToCart(productObject, quantity)
   *   addToCart({ productId, quantity, attributes })
   *
   * @param {Object|{productId}} productOrPayload
   * @param {number} [quantityArg]
   * @param {Object} [attributes]
   */
  const addToCart = useCallback(async (productOrPayload, quantityArg = 1, attributes = {}) => {
    let productData;
    let quantity;

    if (productOrPayload?._id || productOrPayload?.id) {
      // Objeto producto completo
      productData = productOrPayload;
      quantity    = Number(quantityArg) || 1;
    } else if (productOrPayload?.productId) {
      // Payload simplificado
      productData = { _id: productOrPayload.productId, id: productOrPayload.productId };
      quantity    = Number(productOrPayload.quantity) || Number(quantityArg) || 1;
      attributes  = productOrPayload.attributes || attributes || {};
    } else {
      const msg = 'Datos de producto inválidos';
      if (onError) onError(msg);
      return { success: false, error: msg };
    }

    const validation = validateQuantity(quantity);
    if (!validation.valid) {
      if (onError) onError(validation.errors[0]);
      return { success: false, error: validation.errors[0] };
    }

    const result = await storeAddItem(productData, quantity, attributes);
    return notify(result, 'Producto agregado al carrito');
  }, [storeAddItem, notify, onError]);

  /**
   * Actualiza la cantidad de un item.
   *
   * @param {string} productId
   * @param {number} quantity
   * @param {Object} [attributes]
   */
  const updateQuantity = useCallback(async (productId, quantity, attributes = {}) => {
    const validation = validateQuantity(quantity);
    if (!validation.valid) {
      if (onError) onError(validation.errors[0]);
      return { success: false, error: validation.errors[0] };
    }

    const result = await storeUpdateItem(productId, quantity, attributes);
    return notify(result, 'Cantidad actualizada');
  }, [storeUpdateItem, notify, onError]);

  /**
   * Elimina un item del carrito.
   *
   * @param {string} productId
   * @param {Object} [attributes]
   */
  const removeFromCart = useCallback(async (productId, attributes = {}) => {
    const result = await storeRemoveItem(productId, attributes);
    return notify(result, 'Producto eliminado del carrito');
  }, [storeRemoveItem, notify]);

  /**
   * Vacía el carrito completo.
   */
  const clearCart = useCallback(async () => {
    const result = await storeClearCart();
    return notify(result, 'Carrito vaciado');
  }, [storeClearCart, notify]);

  /**
   * Aplica un cupón de descuento.
   *
   * @param {string} code
   */
  const applyCoupon = useCallback(async (code) => {
    const validation = validateCouponCode(code);
    if (!validation.valid) {
      if (onError) onError(validation.errors[0]);
      return { success: false, error: validation.errors[0] };
    }

    const result = await storeApplyCoupon(code);
    return notify(result, 'Cupón aplicado correctamente');
  }, [storeApplyCoupon, notify, onError]);

  /**
   * Actualiza la dirección de envío.
   *
   * @param {Object} addressData
   */
  const updateAddress = useCallback(async (addressData) => {
    const validation = validateShippingAddress(addressData);
    if (!validation.valid) {
      if (onError) onError(validation.errors[0]);
      return { success: false, error: validation.errors[0] };
    }

    const result = await storeUpdateShipAddress(addressData);
    return notify(result, 'Dirección de envío actualizada');
  }, [storeUpdateShipAddress, notify, onError]);

  /**
   * Actualiza el método de envío.
   *
   * @param {Object} shippingData - { method, cost }
   */
  const updateShipping = useCallback(async (shippingData) => {
    const validation = validateShippingMethod(shippingData?.method);
    if (!validation.valid) {
      if (onError) onError(validation.errors[0]);
      return { success: false, error: validation.errors[0] };
    }

    const result = await storeUpdateShipMethod(shippingData);
    return notify(result, 'Método de envío actualizado');
  }, [storeUpdateShipMethod, notify, onError]);

  /**
   * Fuerza un refresh del carrito desde el backend.
   */
  const refreshCart = useCallback(() => storeFetchCart(true), [storeFetchCart]);

  /**
   * Inicializa el carrito (fetch inicial).
   */
  const initCart = useCallback(() => storeFetchCart(false), [storeFetchCart]);

  /**
   * Limpia el error del store.
   */
  const clearError = useCallback(() => storeClearError(), [storeClearError]);

  return {
    // Acciones principales
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    updateAddress,
    updateShipping,

    // Sync (para useCartSync)
    onLogin:  storeOnLogin,
    onLogout: storeOnLogout,

    // Utilidades
    refreshCart,
    initCart,
    clearError,
  };
};

export default useCartActions;