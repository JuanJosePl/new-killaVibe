import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from "react";

import * as wishlistAPI from "../api/wishlist.api";
import {
  isWishlistEmpty,
  getItemCount as calculateItemCount,
} from "../utils/wishlistHelpers";

const WishlistContext = createContext(null);

const WISHLIST_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
};

export const WishlistProvider = ({ children }) => {
  // ============================================================================
  // STATE
  // ============================================================================
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  const [cache, setCache] = useState({
    data: null,
    timestamp: null,
  });

  const fetchInProgressRef = useRef(false);
  const initializedOnceRef = useRef(false);
  const mountedRef = useRef(true);

  // ============================================================================
  // CACHE HELPERS
  // ============================================================================
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    return Date.now() - cache.timestamp < WISHLIST_CACHE_CONFIG.TTL;
  }, [cache.data, cache.timestamp]);

  const updateCache = useCallback((data) => {
    setCache({
      data,
      timestamp: Date.now(),
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: null,
    });
  }, []);

  // ============================================================================
  // CORE ACTIONS
  // ============================================================================
  const fetchWishlist = useCallback(
    async (forceRefresh = false) => {
      if (fetchInProgressRef.current) return wishlist;

      if (!forceRefresh && isCacheValid()) {
        setWishlist(cache.data);
        return cache.data;
      }

      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await wishlistAPI.getWishlist();
        const wishlistData = response.data || response;

        if (mountedRef.current) {
          setWishlist(wishlistData);
          updateCache(wishlistData);
        }
        return wishlistData;
      } catch (err) {
        if (err.response?.status === 401) {
          setWishlist(null);
        } else if (mountedRef.current) {
          setError(err.response?.data?.message || "Error al cargar la wishlist");
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
        fetchInProgressRef.current = false;
      }
    },
    [isCacheValid, updateCache, cache.data, wishlist]
  );

  const addItem = useCallback(
    async (itemData) => {
      const productId = itemData.productId || itemData._id || itemData.id;
      const itemsList = wishlist?.items || [];
      const alreadyExists = itemsList.some(item => {
        const idInItem = item.product?._id || item.product?.id || item.product;
        return idInItem === productId;
      });

      if (alreadyExists) return { data: wishlist, status: 'already_exists' };

      try {
        setLoading(true);
        const response = await wishlistAPI.addItem({ productId });
        if (response?.data && mountedRef.current) {
          setWishlist(response.data);
          updateCache(response.data);
        }
        return response;
      } catch (err) {
        if (err.response?.status === 500 || err.response?.data?.message?.includes("ya está")) {
          return await fetchWishlist(true);
        }
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [wishlist, updateCache, fetchWishlist]
  );

  const removeItem = useCallback(
    async (productId) => {
      try {
        setLoading(true);
        const response = await wishlistAPI.removeItem(productId);
        if (response?.data && mountedRef.current) {
          setWishlist(response.data);
          updateCache(response.data);
        }
        return response;
      } catch (err) {
        return null;
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [updateCache]
  );

  const moveToCart = useCallback(
    async (productIds) => {
      try {
        setLoading(true);
        setError(null);
        const response = await wishlistAPI.moveToCart(productIds);
        // Forzamos actualización para quitar los items movidos de la lista
        await fetchWishlist(true);
        return response?.data ?? response;
      } catch (err) {
        console.error("[WishlistContext] Error moving to cart:", err);
        if (mountedRef.current) {
          setError(err.response?.data?.message || "Error al mover productos");
        }
        throw err; // Re-lanzamos para que useWishlistActions lo capture
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [fetchWishlist]
  );

  const clearWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.clearWishlist();
      if (response?.data && mountedRef.current) {
        setWishlist(response.data);
        updateCache(response.data);
      }
      return response;
    } catch (err) {
      return null;
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [updateCache]);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================
  useEffect(() => {
    mountedRef.current = true;
    if (!initializedOnceRef.current) {
      initializedOnceRef.current = true;
      fetchWishlist();
    }
    return () => { mountedRef.current = false; };
  }, [fetchWishlist]);

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const items = useMemo(() => wishlist?.items || [], [wishlist]);
  const itemCount = useMemo(() => calculateItemCount(wishlist), [wishlist]);
  const isEmpty = useMemo(() => isWishlistEmpty(wishlist), [wishlist]);

  const summary = useMemo(() => ({
    itemCount,
    availableCount: items.filter(i => i.product?.stock > 0).length,
    totalValue: items.reduce((acc, curr) => acc + (curr.product?.price || 0), 0)
  }), [items, itemCount]);

  const value = {
    wishlist,
    items,
    summary,
    loading,
    error,
    initialized,
    isEmpty,
    itemCount,

    // Acciones principales
    fetchWishlist,
    addItem,
    removeItem,
    moveToCart, // ✅ ESTO FALTABA Y CAUSABA TU ERROR
    clearWishlistItems,
    refreshWishlist: () => fetchWishlist(true),
    
    // Helpers
    clearCache,
    setError
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlistContext debe usarse dentro de WishlistProvider");
  return context;
};

export default WishlistContext;