import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as wishlistAPI from '../api/wishlist.api';
import { isWishlistEmpty, getItemCount } from '../utils/wishlistHelpers';

/**
 * @context WishlistContext
 * @description Context global para Wishlist con caché en memoria
 * 
 * SINCRONIZADO con CartContext (misma arquitectura)
 */

const WishlistContext = createContext(null);

// Configuración de caché
const WISHLIST_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000 // 5 minutos
};

/**
 * @provider WishlistProvider
 * @description Provider global de Wishlist
 */
export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Caché en memoria (NO usar localStorage - no disponible en artifacts)
  const [cache, setCache] = useState({
    data: null,
    timestamp: null
  });

  /**
   * Verifica si el caché es válido
   */
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    const now = Date.now();
    return (now - cache.timestamp) < WISHLIST_CACHE_CONFIG.TTL;
  }, [cache]);

  /**
   * Actualiza el caché
   */
  const updateCache = useCallback((data) => {
    setCache({
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Limpia el caché
   */
  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: null
    });
  }, []);

  /**
   * Obtener wishlist (con caché)
   */
  const fetchWishlist = useCallback(async (forceRefresh = false) => {
  const auth = localStorage.getItem('killavibes_auth');

  // MODO INVITADO: No llamar a la API
  if (!auth) {
    const saved = localStorage.getItem('killavibes_wishlist_guest');
    const wishlistData = { items: saved ? JSON.parse(saved) : [] };
    setWishlist(wishlistData);
    setInitialized(true);
    return wishlistData;
  }

  try {
    if (!forceRefresh && isCacheValid()) {
      setWishlist(cache.data);
      setInitialized(true);
      return cache.data;
    }

    setLoading(true);
    setError(null);

    const response = await wishlistAPI.getWishlist();
    const wishlistData = response.data;

    setWishlist(wishlistData);
    updateCache(wishlistData);
    setInitialized(true);
    return wishlistData;
  } catch (err) {
    console.error('[WishlistContext] Error fetching wishlist:', err);
    // No lanzamos throw para evitar el Uncaught in promise en el mount
    setError(err.response?.data?.message || 'Error al cargar la wishlist');
  } finally {
    setLoading(false);
  }
}, [isCacheValid, cache.data, updateCache]);

const addItem = useCallback(async (itemData) => {
  const auth = localStorage.getItem('killavibes_auth');

  // MODO INVITADO
  if (!auth) {
    const saved = localStorage.getItem('killavibes_wishlist_guest');
    let currentItems = saved ? JSON.parse(saved) : [];
    
    if (!currentItems.find(i => i.productId === itemData.productId)) {
      currentItems.push(itemData);
      localStorage.setItem('killavibes_wishlist_guest', JSON.stringify(currentItems));
      setWishlist({ items: currentItems });
    }
    return { success: true };
  }

  // MODO AUTENTICADO
  try {
    setLoading(true);
    setError(null);
    const response = await wishlistAPI.addItem(itemData);
    const updatedWishlist = response.data;
    setWishlist(updatedWishlist);
    updateCache(updatedWishlist);
    return updatedWishlist;
  } catch (err) {
    console.error('[WishlistContext] Error adding item:', err);
    setError(err.response?.data?.message || 'Error al agregar producto');
    throw err;
  } finally {
    setLoading(false);
  }
}, [updateCache]);

  /**
   * Eliminar item de wishlist
   */
  const removeItem = useCallback(async (productId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await wishlistAPI.removeItem(productId);
      const updatedWishlist = response.data;

      setWishlist(updatedWishlist);
      updateCache(updatedWishlist);

      return updatedWishlist;
    } catch (err) {
      console.error('[WishlistContext] Error removing item:', err);
      const errorMsg = err.response?.data?.message || 'Error al eliminar producto';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  /**
   * Limpiar toda la wishlist
   */
  const clearWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await wishlistAPI.clearWishlist();
      const updatedWishlist = response.data;

      setWishlist(updatedWishlist);
      updateCache(updatedWishlist);

      return updatedWishlist;
    } catch (err) {
      console.error('[WishlistContext] Error clearing wishlist:', err);
      const errorMsg = err.response?.data?.message || 'Error al vaciar wishlist';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  /**
   * Verificar si producto está en wishlist
   */
  const checkProduct = useCallback(async (productId) => {
    try {
      const response = await wishlistAPI.checkProduct(productId);
      return response.inWishlist;
    } catch (err) {
      console.error('[WishlistContext] Error checking product:', err);
      return false;
    }
  }, []);

  /**
   * Mover items a carrito
   */
  const moveToCart = useCallback(async (productIds) => {
    try {
      setLoading(true);
      setError(null);

      const response = await wishlistAPI.moveToCart(productIds);

      // Refrescar wishlist después de mover
      await fetchWishlist(true);

      return response.data;
    } catch (err) {
      console.error('[WishlistContext] Error moving to cart:', err);
      const errorMsg = err.response?.data?.message || 'Error al mover productos';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchWishlist]);

  /**
   * Obtener cambios de precio
   */
  const getPriceChanges = useCallback(async () => {
    try {
      const response = await wishlistAPI.getPriceChanges();
      return response.data;
    } catch (err) {
      console.error('[WishlistContext] Error getting price changes:', err);
      throw err;
    }
  }, []);

  /**
   * Refrescar wishlist (force)
   */
  const refreshWishlist = useCallback(async () => {
    return await fetchWishlist(true);
  }, [fetchWishlist]);

  /**
   * Cargar wishlist inicial
   */
  useEffect(() => {
    if (!initialized) {
      fetchWishlist();
    }
  }, [initialized, fetchWishlist]);

  // Helpers computados
  const isEmpty = isWishlistEmpty(wishlist);
  const itemCount = getItemCount(wishlist);

  const value = {
    // Estado
    wishlist,
    items,
    summary,
    loading,
    error,
    initialized,

    // Helpers
    isEmpty,
    itemCount,

    // Acciones
    fetchWishlist,
    addItem,
    removeItem,
    moveToCart, // ✅ ESTO FALTABA Y CAUSABA TU ERROR
    clearWishlistItems,
    checkProduct,
    moveToCart,
    getPriceChanges,
    refreshWishlist,

    // Caché
    clearCache,
    setError
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

/**
 * @hook useWishlistContext
 * @description Hook para acceder al context
 */
export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  
  if (!context) {
    throw new Error('useWishlistContext debe usarse dentro de WishlistProvider');
  }
  
  return context;
};

export default WishlistContext;