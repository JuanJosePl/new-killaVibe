import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
        
        // CORRECCIÓN: Extraemos los datos reales. 
        // Si response es { success: true, data: { items: [...] } }, queremos response.data
        const wishlistData = response?.data || response;

        if (mountedRef.current) {
          setWishlist(wishlistData);
          updateCache(wishlistData);
        }

        return wishlistData;
      } catch (err) {
        console.error("[WishlistContext] Error fetching wishlist:", err);
        const statusCode = err.response?.status;

        if (statusCode === 401) {
          if (mountedRef.current) {
            setError(null);
            setWishlist(null);
          }
          return null;
        }

        if (mountedRef.current) {
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
      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.addItem(itemData);
        
        // CORRECCIÓN: Asegurar que guardamos la data procesada
        const updatedData = response?.data || response;

        if (updatedData && mountedRef.current) {
          setWishlist(updatedData);
          updateCache(updatedData);
          return response;
        }

        return null;
      } catch (err) {
        // CORRECCIÓN: El error 500 se captura aquí. 
        // No seteamos Wishlist a null para no borrar lo que ya se ve en pantalla.
        const errorMsg = err.response?.data?.message || "Error al agregar producto";
        console.error("[WishlistContext] Error adding item:", err);
        
        if (mountedRef.current) {
          setError(errorMsg);
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [updateCache]
  );

  const removeItem = useCallback(
    async (productId) => {
      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.removeItem(productId);
        const updatedData = response?.data || response;

        if (updatedData && mountedRef.current) {
          setWishlist(updatedData);
          updateCache(updatedData);
          return response;
        }

        return null;
      } catch (err) {
        if (mountedRef.current) {
          setError(err.response?.data?.message || "Error al eliminar producto");
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [updateCache]
  );

  const clearWishlistItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await wishlistAPI.clearWishlist();
      const updatedData = response?.data || response;

      if (updatedData && mountedRef.current) {
        setWishlist(updatedData);
        updateCache(updatedData);
        return response;
      }

      return null;
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.message || "Error al vaciar wishlist");
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [updateCache]);

  const moveToCart = useCallback(
    async (productIds) => {
      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.moveToCart(productIds);
        // Refrescamos para obtener la lista limpia después de mover al carrito
        await fetchWishlist(true);

        return response?.data ?? null;
      } catch (err) {
        if (mountedRef.current) {
          setError(err.response?.data?.message || "Error al mover productos");
        }
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [fetchWishlist]
  );

  // ... resto de métodos (checkProduct, getPriceChanges, etc) se mantienen igual

  useEffect(() => {
    mountedRef.current = true;
    if (initializedOnceRef.current) return;

    initializedOnceRef.current = true;
    const timer = setTimeout(() => {
      if (mountedRef.current) fetchWishlist();
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, [fetchWishlist]);

  // ============================================================================
  // COMPUTED
  // ============================================================================
  const isEmpty = isWishlistEmpty(wishlist);
  const itemCount = calculateItemCount(wishlist);

  const value = {
    wishlist,
    loading,
    error,
    initialized,
    isEmpty,
    itemCount,
    fetchWishlist,
    addItem,
    removeItem,
    clearWishlistItems,
    moveToCart,
    refreshWishlist: () => fetchWishlist(true),
    clearCache,
    setError,
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