// src/modules/products/hooks/useProductWishlist.js

import { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useWishlistContext } from '../../wishlist/context/WishlistContext';
import { useAuth } from '../../../core/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * @hook useProductWishlist
 * @description Hook para agregar/quitar productos de wishlist desde componentes de productos
 * 
 * CARACTERÍSTICAS:
 * - Toggle wishlist (agregar/quitar)
 * - Verifica autenticación
 * - Notificaciones toast
 * - Manejo de errores
 */
export const useProductWishlist = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addItem, removeItem, wishlist, loading: wishlistLoading } = useWishlistContext();
  const [isToggling, setIsToggling] = useState(false);

  /**
   * Verifica si un producto está en wishlist
   */
  const isProductInWishlist = useCallback((productId) => {
    if (!wishlist || !wishlist.items) return false;
    return wishlist.items.some(item => item.product._id === productId);
  }, [wishlist]);

  /**
   * Toggle producto en wishlist (agregar o quitar)
   * @param {Object|string} product - Producto completo o ID
   */
  const toggleProductWishlist = useCallback(async (product) => {
    // Verificar autenticación
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión para agregar a favoritos', {
        duration: 3000,
        position: 'bottom-right'
      });
      navigate('/auth/login', { state: { from: window.location.pathname } });
      return null;
    }

    // Obtener ID del producto
    const productId = product._id || product;
    if (!productId) {
      toast.error('Producto inválido');
      return null;
    }

    try {
      setIsToggling(true);

      const inWishlist = isProductInWishlist(productId);

      if (inWishlist) {
        // Quitar de wishlist
        const result = await removeItem(productId);

        if (result?.success) {
          toast.success('❌ Eliminado de favoritos', {
            duration: 2000,
            position: 'bottom-right',
            icon: '💔'
          });
          return { action: 'removed', result };
        }
      } else {
        // Agregar a wishlist
        const result = await addItem({
          productId,
          notifyPriceChange: true,
          notifyAvailability: true
        });

        if (result?.success) {
          toast.success('✅ Agregado a favoritos', {
            duration: 2000,
            position: 'bottom-right',
            icon: '❤️'
          });
          return { action: 'added', result };
        }
      }

      throw new Error('Error al actualizar wishlist');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    } finally {
      setIsToggling(false);
    }
  }, [isAuthenticated, navigate, addItem, removeItem, isProductInWishlist]);

  /**
   * Agregar producto a wishlist (sin toggle)
   */
  const addProductToWishlist = useCallback(async (product) => {
    if (!isAuthenticated) {
      toast.error('Debes iniciar sesión', {
        duration: 3000,
        position: 'bottom-right'
      });
      navigate('/auth/login');
      return null;
    }

    const productId = product._id || product;
    
    try {
      setIsToggling(true);

      const result = await addItem({
        productId,
        notifyPriceChange: true,
        notifyAvailability: true
      });

      if (result?.success) {
        toast.success('✅ Agregado a favoritos', {
          duration: 2000,
          position: 'bottom-right',
          icon: '❤️'
        });
        return result;
      }

      throw new Error('Error al agregar');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    } finally {
      setIsToggling(false);
    }
  }, [isAuthenticated, navigate, addItem]);

  /**
   * Quitar producto de wishlist
   */
  const removeProductFromWishlist = useCallback(async (product) => {
    const productId = product._id || product;
    
    try {
      setIsToggling(true);

      const result = await removeItem(productId);

      if (result?.success) {
        toast.success('❌ Eliminado de favoritos', {
          duration: 2000,
          position: 'bottom-right',
          icon: '💔'
        });
        return result;
      }

      throw new Error('Error al eliminar');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right'
      });
      return null;
    } finally {
      setIsToggling(false);
    }
  }, [removeItem]);

  return {
    // Acciones
    toggleProductWishlist,
    addProductToWishlist,
    removeProductFromWishlist,

    // Queries
    isProductInWishlist,

    // Estado
    loading: isToggling || wishlistLoading
  };
};

export default useProductWishlist;