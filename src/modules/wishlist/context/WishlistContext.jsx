import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as wishlistAPI from '../api/wishlist.api';
import { isWishlistEmpty, getItemCount } from '../utils/wishlistHelpers';

const WishlistContext = createContext(null);

const WISHLIST_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000 
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ items: [], itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [cache, setCache] = useState({ data: null, timestamp: null });

  // --- Manejo de Caché ---
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    return (Date.now() - cache.timestamp) < WISHLIST_CACHE_CONFIG.TTL;
  }, [cache]);

  const updateCache = useCallback((data) => {
    setCache({ data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null });
  }, []);

  /**
   * ✅ isInWishlist - Verificación robusta
   */
  const isInWishlist = useCallback((productId) => {
    if (!wishlist?.items || !productId) return false;
    
    return wishlist.items.some(item => {
      const idEnLista = item.product?._id || item.product?.id || item.productId || item._id || item.id;
      return String(idEnLista) === String(productId);
    });
  }, [wishlist]);

  /**
   * ✅ fetchWishlist - Normalización garantizada
   */
  const fetchWishlist = useCallback(async (forceRefresh = false) => {
    const auth = localStorage.getItem('killavibes_auth');

    // MODO INVITADO
    if (!auth) {
      try {
        const saved = localStorage.getItem('killavibes_wishlist_guest');
        const items = saved ? JSON.parse(saved) : [];
        
        // ✅ Normalización forzada
        const normalizedItems = items.map(item => {
          const productData = item.product || item;
          return {
            _id: item._id || `temp-${Date.now()}-${Math.random()}`,
            product: {
              _id: productData._id || productData.id || item.productId,
              id: productData._id || productData.id || item.productId,
              name: productData.name || "Producto",
              slug: productData.slug || (productData._id || productData.id),
              price: productData.price || 0,
              comparePrice: productData.comparePrice || productData.originalPrice || 0,
              images: Array.isArray(productData.images) ? productData.images : (productData.image ? [productData.image] : []),
              mainCategory: productData.mainCategory || productData.category || null,
              stock: productData.stock ?? 0,
              rating: productData.rating || null,
              isFeatured: productData.isFeatured || productData.featured || false
            },
            addedAt: item.addedAt || new Date().toISOString()
          };
        });

        const data = { items: normalizedItems, itemCount: normalizedItems.length };
        setWishlist(data);
        setInitialized(true);
        return data;
      } catch (err) {
        console.error('[WishlistContext] Error loading guest wishlist:', err);
        setInitialized(true);
        return { items: [], itemCount: 0 };
      }
    }

    // MODO AUTENTICADO
    try {
      if (!forceRefresh && isCacheValid()) {
        setWishlist(cache.data);
        setInitialized(true);
        return cache.data;
      }
      
      setLoading(true);
      const response = await wishlistAPI.getWishlist();
      
      // ✅ Normalizar también respuesta del backend (por si acaso)
      const normalizedData = {
        ...response.data,
        items: (response.data.items || []).map(item => ({
          ...item,
          product: {
            ...item.product,
            id: item.product._id || item.product.id,
            images: Array.isArray(item.product.images) ? item.product.images : []
          }
        }))
      };
      
      setWishlist(normalizedData);
      updateCache(normalizedData);
      return normalizedData;
    } catch (err) {
      console.error('[WishlistContext] Error fetching wishlist:', err);
      setError(err.response?.data?.message || 'Error al cargar');
      return { items: [], itemCount: 0 };
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [isCacheValid, cache.data, updateCache]);

  /**
   * ✅ addItem - Guardar producto COMPLETO
   */
  const addItem = useCallback(async (incomingData) => {
    const auth = localStorage.getItem('killavibes_auth');
    
    if (!incomingData) {
      console.error('[WishlistContext] addItem: No se proporcionó producto');
      return { success: false, message: 'Producto inválido' };
    }

    const pId = incomingData._id || incomingData.id || incomingData.productId;

    if (!pId) {
      console.error('[WishlistContext] addItem: Producto sin ID', incomingData);
      return { success: false, message: 'Producto sin ID' };
    }

    if (!auth) {
      // ✅ MODO INVITADO: Guardar producto COMPLETO
      try {
        const saved = localStorage.getItem('killavibes_wishlist_guest');
        let currentItems = saved ? JSON.parse(saved) : [];
        
        const exists = currentItems.some(i => {
          const id = i.productId || i.product?._id || i.product?.id || i._id;
          return String(id) === String(pId);
        });
        
        if (exists) {
          return { success: false, message: 'Ya está en favoritos' };
        }
        
        // ✅ ESTRUCTURA COMPLETA para localStorage
        const newItem = {
          _id: `temp-${Date.now()}-${Math.random()}`,
          productId: pId,
          product: {
            _id: pId,
            id: pId,
            name: incomingData.name || "Producto",
            slug: incomingData.slug || pId,
            price: incomingData.price || 0,
            comparePrice: incomingData.comparePrice || incomingData.originalPrice || 0,
            images: Array.isArray(incomingData.images) ? incomingData.images : (incomingData.image ? [incomingData.image] : []),
            mainCategory: incomingData.mainCategory || incomingData.category || null,
            stock: incomingData.stock ?? 0,
            rating: incomingData.rating || null,
            isFeatured: incomingData.isFeatured || incomingData.featured || false
          },
          addedAt: new Date().toISOString()
        };
        
        currentItems.push(newItem);
        localStorage.setItem('killavibes_wishlist_guest', JSON.stringify(currentItems));
        setWishlist({ items: currentItems, itemCount: currentItems.length });
        
        return { success: true, message: 'Agregado a favoritos' };
      } catch (err) {
        console.error('[WishlistContext] Error adding to guest wishlist:', err);
        throw err;
      }
    }

    // MODO API
    try {
      setLoading(true);
      const response = await wishlistAPI.addItem({ productId: pId });
      
      // Normalizar respuesta
      const normalizedData = {
        ...response.data,
        items: (response.data.items || []).map(item => ({
          ...item,
          product: {
            ...item.product,
            id: item.product._id || item.product.id
          }
        }))
      };
      
      setWishlist(normalizedData);
      updateCache(normalizedData);
      return { success: true, ...response };
    } catch (err) {
      console.error('[WishlistContext] Error adding to API wishlist:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  /**
   * ✅ removeItem
   */
  const removeItem = useCallback(async (productId) => {
    const auth = localStorage.getItem('killavibes_auth');

    if (!auth) {
      const saved = localStorage.getItem('killavibes_wishlist_guest');
      let currentItems = saved ? JSON.parse(saved) : [];
      const filtered = currentItems.filter(i => {
        const id = i.productId || i.product?._id || i.product?.id || i._id;
        return String(id) !== String(productId);
      });
      localStorage.setItem('killavibes_wishlist_guest', JSON.stringify(filtered));
      setWishlist({ items: filtered, itemCount: filtered.length });
      return { success: true };
    }

    try {
      setLoading(true);
      const response = await wishlistAPI.removeItem(productId);
      setWishlist(response.data);
      updateCache(response.data);
      return response.data;
    } catch (err) {
      console.error('[WishlistContext] Error removing item:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  /**
   * Otros métodos (sin cambios)
   */
  const clearWishlistItems = useCallback(async () => {
    const auth = localStorage.getItem('killavibes_auth');
    if (!auth) {
      localStorage.removeItem('killavibes_wishlist_guest');
      setWishlist({ items: [], itemCount: 0 });
      return;
    }
    try {
      const response = await wishlistAPI.clearWishlist();
      setWishlist(response.data);
      updateCache(response.data);
    } catch (err) { throw err; }
  }, [updateCache]);

  const moveToCart = useCallback(async (productIds) => {
    const response = await wishlistAPI.moveToCart(productIds);
    await fetchWishlist(true);
    return response.data;
  }, [fetchWishlist]);

  const checkProduct = useCallback(async (productId) => {
    try {
      const response = await wishlistAPI.checkProduct(productId);
      return response.inWishlist;
    } catch (err) { return false; }
  }, []);

  const getPriceChanges = useCallback(async () => {
    const response = await wishlistAPI.getPriceChanges();
    return response.data;
  }, []);

  const refreshWishlist = useCallback(() => fetchWishlist(true), [fetchWishlist]);

  useEffect(() => {
    if (!initialized) fetchWishlist();
  }, [initialized, fetchWishlist]);

  const isEmpty = isWishlistEmpty(wishlist);
  const itemCount = getItemCount(wishlist);

  const value = {
    wishlist,
    loading,
    error,
    initialized,
    isEmpty,
    itemCount,
    isInWishlist,
    fetchWishlist,
    addItem,
    removeItem,
    clearWishlistItems,
    checkProduct,
    moveToCart,
    getPriceChanges,
    refreshWishlist,
    clearCache,
    setError
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlistContext debe usarse dentro de WishlistProvider');
  return context;
};

export default WishlistContext;

// ============================================================================
// HELPERS ESTÁTICOS PARA syncManager (migración invitado → usuario)
// ============================================================================

/**
 * Migra la wishlist guardada en localStorage (modo invitado)
 * a la wishlist del usuario autenticado mediante la API.
 *
 * @returns {Promise<{success: boolean, migratedCount: number, failedCount: number}>}
 */
export const migrateGuestWishlistToUser = async () => {
  try {
    const raw = localStorage.getItem("killavibes_wishlist_guest");
    const guestItems = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(guestItems) || guestItems.length === 0) {
      return { success: true, migratedCount: 0, failedCount: 0 };
    }

    let migratedCount = 0;
    let failedCount = 0;

    for (const item of guestItems) {
      try {
        const product = item.product || item;
        const productId =
          item.productId ||
          product?._id ||
          product?.id ||
          item._id ||
          item.id;

        if (!productId) {
          failedCount += 1;
          continue;
        }

        await wishlistAPI.addItem({ productId });
        migratedCount += 1;
      } catch (err) {
        console.error("[WishlistContext] Error migrando item invitado:", err);
        failedCount += 1;
      }
    }

    // Limpiar wishlist de invitado tras migración
    localStorage.removeItem("killavibes_wishlist_guest");

    return { success: true, migratedCount, failedCount };
  } catch (error) {
    console.error("[WishlistContext] Error migrando wishlist invitado:", error);
    return { success: false, migratedCount: 0, failedCount: 0 };
  }
};

/**
 * Limpia completamente la wishlist de invitado del localStorage.
 * Usado por syncManager.clearAllGuestData.
 */
export const clearGuestWishlist = () => {
  try {
    localStorage.removeItem("killavibes_wishlist_guest");
  } catch (error) {
    console.error("[WishlistContext] Error limpiando wishlist invitado:", error);
  }
};