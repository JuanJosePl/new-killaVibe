// src/modules/wishlist/hooks/useWishlistToCart.js

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useCartContext } from '../../cart/context/CartContext';
import { useWishlistContext } from '../context/WishlistContext';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @hook useWishlistToCart
 * @description Hook para mover productos de wishlist al carrito
 * 
 * CARACTERÍSTICAS:
 * - Agregar al carrito
 * - Eliminar de wishlist (opcional)
 * - Notificaciones toast
 * - Manejo de errores
 */
export const useWishlistToCart = () => {
  const { isAuthenticated } = useAuth();
  const { addItem: addToCart } = useCartContext();
  const { removeItem: removeFromWishlist, wishlist } = useWishlistContext();
  const [loading, setLoading] = useState(false);

  /**
   * Mover producto de wishlist a carrito
   * @param {Object|string} product - Producto completo o ID
   * @param {number} quantity - Cantidad (default: 1)
   * @param {boolean} keepInWishlist - Mantener en wishlist (default: false)
   */
  const moveToCart = useCallback(async (product, quantity = 1, keepInWishlist = false) => {
    // Verificar autenticación
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión', {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    }

    // Obtener ID del producto
    const productId = product._id || product;
    if (!productId) {
      toast.error('Producto inválido');
      return null;
    }

    try {
      setLoading(true);

      // 1. Agregar al carrito
      const cartResult = await addToCart({
        productId,
        quantity,
        attributes: {}
      });

      if (!cartResult?.success) {
        throw new Error('Error al agregar al carrito');
      }

      // 2. Eliminar de wishlist (si keepInWishlist = false)
      if (!keepInWishlist) {
        await removeFromWishlist(productId);
      }

      // 3. Mostrar notificación
      toast.success(
        keepInWishlist 
          ? '✅ Producto agregado al carrito' 
          : '✅ Producto movido al carrito',
        {
          duration: 2000,
          position: 'bottom-right',
          icon: '🛒'
        }
      );

      return cartResult;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, addToCart, removeFromWishlist]);

  /**
   * Agregar a carrito sin eliminar de wishlist
   */
  const addToCartFromWishlist = useCallback(async (product, quantity = 1) => {
    return moveToCart(product, quantity, true);
  }, [moveToCart]);

  /**
   * Mover múltiples productos al carrito
   */
  const moveMultipleToCart = useCallback(async (productIds) => {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      toast.error('No hay productos seleccionados');
      return null;
    }

    try {
      setLoading(true);

      const results = await Promise.allSettled(
        productIds.map(id => moveToCart(id, 1, false))
      );

      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        toast.success(
          `✅ ${succeeded} ${succeeded === 1 ? 'producto movido' : 'productos movidos'} al carrito`,
          {
            duration: 3000,
            position: 'bottom-right'
          }
        );
      }

      if (failed > 0) {
        toast.error(
          `❌ ${failed} ${failed === 1 ? 'producto falló' : 'productos fallaron'}`,
          {
            duration: 3000,
            position: 'bottom-right'
          }
        );
      }

      return { succeeded, failed };
    } catch (error) {
      toast.error('Error al mover productos', {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [moveToCart]);

  /**
   * Verificar si un producto está en wishlist
   */
  const isInWishlist = useCallback((productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product._id === productId);
  }, [wishlist]);

  return {
    // Acciones
    moveToCart,
    addToCartFromWishlist,
    moveMultipleToCart,

    // Queries
    isInWishlist,

    // Estado
    loading
  };
};

export default useWishlistToCart;