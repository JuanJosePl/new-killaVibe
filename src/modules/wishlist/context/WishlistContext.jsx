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

  // Caché en memoria
  const [cache, setCache] = useState({
    data: null,
    timestamp: null,
  });

  // ✅ PROTECCIÓN: Refs para evitar loops
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
      // ✅ GUARD 1: Prevenir llamadas simultáneas
      if (fetchInProgressRef.current) {
        console.log("[WishlistContext] Fetch ya en progreso, ignorando...");
        return wishlist;
      }

      // ✅ GUARD 2: Usar caché si es válido
      if (!forceRefresh && isCacheValid()) {
        console.log("[WishlistContext] Usando caché válido");
        setWishlist(cache.data);
        return cache.data;
      }

      fetchInProgressRef.current = true;
      setLoading(true);
      setError(null);

      try {
        const response = await wishlistAPI.getWishlist();
        const wishlistData = response.data;

        if (mountedRef.current) {
          setWishlist(wishlistData);
          updateCache(wishlistData);
        }

        return wishlistData;
      } catch (err) {
        console.error("[WishlistContext] Error fetching wishlist:", err);

        const statusCode = err.response?.status;

        // ✅ GUARD 3: No mostrar errores de auth
        if (statusCode === 401) {
          if (mountedRef.current) {
            setError(null);
            setWishlist(null);
          }
          return null;
        } else if (statusCode === 429) {
          if (mountedRef.current) {
            setError("Demasiadas peticiones. Intenta en unos minutos.");
            if (cache.data) {
              setWishlist(cache.data);
              return cache.data;
            }
          }
          return null;
        }

        if (mountedRef.current) {
          setError(
            err.response?.data?.message || "Error al cargar la wishlist"
          );
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

        if (response?.data && mountedRef.current) {
          setWishlist(response.data);
          updateCache(response.data);
          return response;
        }

        return null;
      } catch (err) {
        console.error("[WishlistContext] Error adding item:", err);
        if (mountedRef.current) {
          setError(err.response?.data?.message || "Error al agregar producto");
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

        if (response?.data && mountedRef.current) {
          setWishlist(response.data);
          updateCache(response.data);
          return response;
        }

        return null;
      } catch (err) {
        console.error("[WishlistContext] Error removing item:", err);
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

      if (response?.data && mountedRef.current) {
        setWishlist(response.data);
        updateCache(response.data);
        return response;
      }

      return null;
    } catch (err) {
      console.error("[WishlistContext] Error clearing wishlist:", err);
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

  const checkProduct = useCallback(async (productId) => {
    try {
      const response = await wishlistAPI.checkProduct(productId);
      return response?.inWishlist ?? false;
    } catch {
      return false;
    }
  }, []);

  const moveToCart = useCallback(
    async (productIds) => {
      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.moveToCart(productIds);
        await fetchWishlist(true);

        return response?.data ?? null;
      } catch (err) {
        console.error("[WishlistContext] Error moving to cart:", err);
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

  const getPriceChanges = useCallback(async () => {
    try {
      const response = await wishlistAPI.getPriceChanges();
      return response?.data ?? [];
    } catch {
      return [];
    }
  }, []);

  const refreshWishlist = useCallback(() => {
    return fetchWishlist(true);
  }, [fetchWishlist]);

  // ============================================================================
  // INITIALIZATION - ✅ SOLO UNA VEZ
  // ============================================================================
  useEffect(() => {
    mountedRef.current = true;

    // ✅ GUARD: Solo ejecutar una vez
    if (initializedOnceRef.current) {
      console.log("[WishlistContext] Ya inicializado, ignorando...");
      return;
    }

    initializedOnceRef.current = true;
    console.log("[WishlistContext] Inicializando por primera vez...");

    // ✅ Delay mínimo para evitar race conditions
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        fetchWishlist();
      }
    }, 100);

    return () => {
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []); // ✅ ARRAY VACÍO - Solo al montar

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
    checkProduct,
    moveToCart,
    getPriceChanges,
    refreshWishlist,

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
  if (!context) {
    throw new Error(
      "useWishlistContext debe usarse dentro de WishlistProvider"
    );
  }
  return context;
};

export default WishlistContext;
