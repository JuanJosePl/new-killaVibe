// src/modules/customer/hooks/useCartOperations.js

import { useState, useCallback } from 'react';
import { useCustomerCart } from '../context/CustomerCartContext';

/**
 * @hook useCartOperations
 * @description Hook personalizado para operaciones del carrito con manejo de loading por item
 * 
 * Beneficios:
 * - Loading granular por item (no bloquea toda la UI)
 * - Manejo de errores centralizado
 * - Confirmaciones consistentes
 * - Reutilizable en múltiples componentes
 * 
 * @returns {Object} Operaciones del carrito con estados de loading
 */
export const useCartOperations = () => {
  const {
    cart,
    isLoading,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
  } = useCustomerCart();

  // Estado de loading por item individual
  const [loadingItems, setLoadingItems] = useState(new Set());
  
  // Estado para operaciones globales
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  /**
   * Actualizar cantidad de un item
   */
  const handleUpdateQuantity = useCallback(async (productId, newQuantity, attributes = {}) => {
    if (newQuantity < 1) {
      throw new Error('La cantidad mínima es 1');
    }

    const itemKey = `${productId}-${JSON.stringify(attributes)}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));

    try {
      await updateItem(productId, newQuantity, attributes);
      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { 
        success: false, 
        error: error.message || 'Error al actualizar cantidad' 
      };
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [updateItem]);

  /**
   * Eliminar item del carrito
   */
  const handleRemoveItem = useCallback(async (productId, attributes = {}) => {
    const itemKey = `${productId}-${JSON.stringify(attributes)}`;
    setLoadingItems(prev => new Set(prev).add(itemKey));

    try {
      await removeItem(productId, attributes);
      return { success: true };
    } catch (error) {
      console.error('Error removing item:', error);
      return { 
        success: false, 
        error: error.message || 'Error al eliminar producto' 
      };
    } finally {
      setLoadingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  }, [removeItem]);

  /**
   * Vaciar carrito completo
   */
  const handleClearCart = useCallback(async () => {
    setIsClearingCart(true);

    try {
      await clearCart();
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { 
        success: false, 
        error: error.message || 'Error al vaciar carrito' 
      };
    } finally {
      setIsClearingCart(false);
    }
  }, [clearCart]);

  /**
   * Aplicar cupón de descuento
   */
  const handleApplyCoupon = useCallback(async (code) => {
    if (!code || !code.trim()) {
      return { 
        success: false, 
        error: 'Ingresa un código de cupón válido' 
      };
    }

    setIsApplyingCoupon(true);

    try {
      await applyCoupon(code.toUpperCase());
      return { success: true };
    } catch (error) {
      console.error('Error applying coupon:', error);
      return { 
        success: false, 
        error: error.message || 'Cupón inválido o expirado' 
      };
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [applyCoupon]);

  /**
   * Verificar si un item específico está cargando
   */
  const isItemLoading = useCallback((productId, attributes = {}) => {
    const itemKey = `${productId}-${JSON.stringify(attributes)}`;
    return loadingItems.has(itemKey);
  }, [loadingItems]);

  return {
    // Operaciones
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    handleApplyCoupon,
    
    // Estados de loading
    isItemLoading,
    isClearingCart,
    isApplyingCoupon,
    isGlobalLoading: isLoading,
    
    // Data del carrito (pass-through)
    cart,
  };
};

export default useCartOperations;