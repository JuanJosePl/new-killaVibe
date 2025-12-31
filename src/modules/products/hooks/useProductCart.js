// src/modules/products/hooks/useProductCart.js

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCartContext } from '../../cart/context/CartContext';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @hook useProductCart
 * @description Hook para agregar productos al carrito desde cualquier componente
 * 
 * CARACTERÍSTICAS:
 * - Verifica autenticación
 * - Validación de stock
 * - Notificaciones toast
 * - Redirección opcional
 * - Manejo de errores
 */
export const useProductCart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, cart, loading: cartLoading } = useCartContext();
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Verifica si un producto está en el carrito
   */
  const isProductInCart = useCallback((productId) => {
    if (!cart || !cart.items) return false;
    return cart.items.some(item => item.product._id === productId);
  }, [cart]);

  /**
   * Obtiene la cantidad de un producto en el carrito
   */
  const getProductQuantity = useCallback((productId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find(item => item.product._id === productId);
    return item ? item.quantity : 0;
  }, [cart]);

  /**
   * Agregar producto al carrito
   * @param {Object} product - Producto completo o solo ID
   * @param {number} quantity - Cantidad (default: 1)
   * @param {Object} attributes - Atributos opcionales (size, color, etc.)
   * @param {Object} options - Opciones adicionales
   */
  const addProductToCart = useCallback(async (product, quantity = 1, attributes = {}, options = {}) => {
    const {
      showToast = true,
      redirectToCart = false,
      onSuccess,
      onError
    } = options;

    // Verificar autenticación
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar productos al carrito', {
        duration: 3000,
        position: 'bottom-right'
      });
      navigate('/auth/login', { state: { from: window.location.pathname } });
      return null;
    }

    // Validar producto
    const productId = product._id || product;
    if (!productId) {
      toast.error('Producto inválido');
      return null;
    }

    // Validar stock (si el producto tiene la info)
    if (product.trackQuantity && product.stock !== undefined) {
      if (product.stock <= 0) {
        toast.error('Producto sin stock disponible', {
          duration: 3000,
          position: 'bottom-right'
        });
        return null;
      }

      if (quantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`, {
          duration: 3000,
          position: 'bottom-right'
        });
        return null;
      }
    }

    try {
      setIsAdding(true);

      const result = await addItem({
        productId,
        quantity,
        attributes
      });

      if (result?.success) {
        if (showToast) {
          toast.success('✅ Producto agregado al carrito', {
            duration: 2000,
            position: 'bottom-right',
            icon: '🛒'
          });
        }

        if (onSuccess) {
          onSuccess(result);
        }

        if (redirectToCart) {
          navigate('/carrito');
        }

        return result;
      }

      throw new Error(result?.message || 'Error al agregar al carrito');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      
      if (showToast) {
        toast.error(errorMessage, {
          duration: 3000,
          position: 'bottom-right'
        });
      }

      if (onError) {
        onError(error);
      }

      return null;
    } finally {
      setIsAdding(false);
    }
  }, [isAuthenticated, navigate, addItem]);

  /**
   * Incrementar cantidad de un producto ya en el carrito
   */
  const incrementQuantity = useCallback(async (product) => {
    const productId = product._id || product;
    const currentQuantity = getProductQuantity(productId);

    if (currentQuantity === 0) {
      return addProductToCart(product, 1);
    }

    return addProductToCart(product, currentQuantity + 1, {}, {
      showToast: true
    });
  }, [addProductToCart, getProductQuantity]);

  /**
   * Quick add - agregar y redirigir al carrito
   */
  const quickAddToCart = useCallback(async (product, quantity = 1, attributes = {}) => {
    return addProductToCart(product, quantity, attributes, {
      redirectToCart: true
    });
  }, [addProductToCart]);

  /**
   * Silent add - agregar sin toast ni redirección
   */
  const silentAddToCart = useCallback(async (product, quantity = 1, attributes = {}) => {
    return addProductToCart(product, quantity, attributes, {
      showToast: false,
      redirectToCart: false
    });
  }, [addProductToCart]);

  return {
    // Acciones
    addProductToCart,
    quickAddToCart,
    silentAddToCart,
    incrementQuantity,

    // Queries
    isProductInCart,
    getProductQuantity,

    // Estado
    isAdding: isAdding || cartLoading,
    loading: isAdding || cartLoading
  };
};

export default useProductCart;