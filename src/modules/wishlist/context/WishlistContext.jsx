// wishlist/context/WishlistContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import * as wishlistAPI from "../api/wishlist.api";
import { isWishlistEmpty, getItemCount } from "../utils/wishlistHelpers";

const WishlistContext = createContext(null);

const WISHLIST_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
};

const WISHLIST_STORAGE_KEY = "killavibes_wishlist_guest";

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [cache, setCache] = useState({ data: null, timestamp: null });

  const fetchAbortController = useRef(null);

  // ============================================================================
  // HELPERS INTERNOS
  // ============================================================================

  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    return Date.now() - cache.timestamp < WISHLIST_CACHE_CONFIG.TTL;
  }, [cache]);

  const updateCache = useCallback((data) => {
    setCache({ data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null });
  }, []);

  /**
   * 🆕 GUARDAR WISHLIST GUEST EN LOCALSTORAGE
   */
  const saveGuestWishlist = useCallback((items) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("[WishlistContext] Error guardando wishlist guest:", error);
    }
  }, []);

  /**
   * 🆕 CARGAR WISHLIST GUEST DE LOCALSTORAGE
   */
  const loadGuestWishlist = useCallback(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (!saved) return [];

      const parsed = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        console.warn(
          "[WishlistContext] Wishlist guest corrupta, inicializando vacía"
        );
        return [];
      }

      return parsed;
    } catch (error) {
      console.error("[WishlistContext] Error cargando wishlist guest:", error);
      return [];
    }
  }, []);

  /**
   * 🆕 NORMALIZAR ESTRUCTURA WISHLIST
   */
  const normalizeWishlistStructure = useCallback((items) => {
    return {
      items: items || [],
      itemCount: items?.length || 0,
      user: null,
    };
  }, []);

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  const fetchWishlist = useCallback(
    async (forceRefresh = false) => {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        const guestItems = loadGuestWishlist();
        const wishlistData = normalizeWishlistStructure(guestItems);
        setWishlist(wishlistData);
        setInitialized(true);
        return wishlistData;
      }

      // MODO AUTENTICADO
      try {
        if (fetchAbortController.current) {
          fetchAbortController.current.abort();
        }

        if (!forceRefresh && isCacheValid()) {
          setWishlist(cache.data);
          setInitialized(true);
          return cache.data;
        }

        setLoading(true);
        fetchAbortController.current = new AbortController();

        const response = await wishlistAPI.getWishlist();
        const wishlistData = response.data;

        setWishlist(wishlistData);
        updateCache(wishlistData);
        setInitialized(true);
        return wishlistData;
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[WishlistContext] Request abortado");
          return;
        }

        console.error("[WishlistContext] Error fetching wishlist:", err);
        const errorMsg =
          err.response?.data?.message || "Error al cargar la wishlist";
        setError(errorMsg);

        const emptyWishlist = { items: [], itemCount: 0 };
        setWishlist(emptyWishlist);
        setInitialized(true);
      } finally {
        setLoading(false);
        fetchAbortController.current = null;
      }
    },
    [
      isCacheValid,
      cache.data,
      updateCache,
      loadGuestWishlist,
      normalizeWishlistStructure,
    ]
  );

  const addItem = useCallback(
    async (itemData) => {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        setLoading(true);
        try {
          const currentItems = loadGuestWishlist();

          // Verificar duplicado
          const exists = currentItems.find(
            (i) => i.productId === itemData.productId
          );
          if (exists) {
            throw new Error("El producto ya está en tu lista de deseos");
          }

          const newItem = {
            productId: itemData.productId,
            notifyPriceChange: itemData.notifyPriceChange || false,
            notifyAvailability: itemData.notifyAvailability || false,
            addedAt: new Date().toISOString(),
          };

          const updatedItems = [...currentItems, newItem];
          saveGuestWishlist(updatedItems);

          const updatedWishlist = normalizeWishlistStructure(updatedItems);
          setWishlist(updatedWishlist);
          updateCache(updatedWishlist);

          return updatedWishlist;
        } finally {
          setLoading(false);
        }
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
        console.error("[WishlistContext] Error adding item:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error al agregar producto";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      loadGuestWishlist,
      saveGuestWishlist,
      normalizeWishlistStructure,
      updateCache,
    ]
  );

  const removeItem = useCallback(
    async (productId) => {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        setLoading(true);
        try {
          const currentItems = loadGuestWishlist();
          const filteredItems = currentItems.filter(
            (i) => i.productId !== productId
          );

          saveGuestWishlist(filteredItems);

          const updatedWishlist = normalizeWishlistStructure(filteredItems);
          setWishlist(updatedWishlist);
          updateCache(updatedWishlist);

          return updatedWishlist;
        } finally {
          setLoading(false);
        }
      }

      // MODO AUTENTICADO
      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.removeItem(productId);
        const updatedWishlist = response.data;

        setWishlist(updatedWishlist);
        updateCache(updatedWishlist);

        return updatedWishlist;
      } catch (err) {
        console.error("[WishlistContext] Error removing item:", err);
        const errorMsg =
          err.response?.data?.message || "Error al eliminar producto";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      loadGuestWishlist,
      saveGuestWishlist,
      normalizeWishlistStructure,
      updateCache,
    ]
  );

  const clearWishlistItems = useCallback(async () => {
    const auth = localStorage.getItem("killavibes_auth");

    // MODO GUEST
    if (!auth) {
      setLoading(true);
      try {
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
        const emptyWishlist = { items: [], itemCount: 0 };
        setWishlist(emptyWishlist);
        updateCache(emptyWishlist);
        return emptyWishlist;
      } finally {
        setLoading(false);
      }
    }

    // MODO AUTENTICADO
    try {
      setLoading(true);
      setError(null);

      const response = await wishlistAPI.clearWishlist();
      const updatedWishlist = response.data;

      setWishlist(updatedWishlist);
      updateCache(updatedWishlist);

      return updatedWishlist;
    } catch (err) {
      console.error("[WishlistContext] Error clearing wishlist:", err);
      const errorMsg =
        err.response?.data?.message || "Error al vaciar wishlist";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const checkProduct = useCallback(
    async (productId) => {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        const currentItems = loadGuestWishlist();
        return currentItems.some((i) => i.productId === productId);
      }

      // MODO AUTENTICADO
      try {
        const response = await wishlistAPI.checkProduct(productId);
        return response.inWishlist;
      } catch (err) {
        console.error("[WishlistContext] Error checking product:", err);
        return false;
      }
    },
    [loadGuestWishlist]
  );

  const moveToCart = useCallback(
    async (productIds) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        throw new Error("Debes iniciar sesión para mover productos al carrito");
      }

      try {
        setLoading(true);
        setError(null);

        const response = await wishlistAPI.moveToCart(productIds);

        // Refrescar wishlist
        await fetchWishlist(true);

        return response.data;
      } catch (err) {
        console.error("[WishlistContext] Error moving to cart:", err);
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error al mover productos";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchWishlist]
  );

  const getPriceChanges = useCallback(async () => {
    const auth = localStorage.getItem("killavibes_auth");

    if (!auth) {
      return { data: [], count: 0 };
    }

    try {
      const response = await wishlistAPI.getPriceChanges();
      return response.data;
    } catch (err) {
      console.error("[WishlistContext] Error getting price changes:", err);
      throw err;
    }
  }, []);

  const refreshWishlist = useCallback(async () => {
    return await fetchWishlist(true);
  }, [fetchWishlist]);

  // ============================================================================
  // 🆕 FUNCIONES DE MIGRACIÓN
  // ============================================================================

  const migrateGuestWishlistToUser = useCallback(async () => {
    console.log("[WishlistContext] 🔄 Migrando wishlist de invitado...");

    try {
      const guestItems = loadGuestWishlist();

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      console.log(`[WishlistContext] Migrando ${guestItems.length} items...`);

      let migratedCount = 0;
      let failedCount = 0;

      for (const item of guestItems) {
        try {
          const productId = item.productId;

          if (!productId) {
            console.warn(
              "[WishlistContext] Item sin productId, saltando:",
              item
            );
            failedCount++;
            continue;
          }

          await wishlistAPI.addItem({
            productId,
            notifyPriceChange: item.notifyPriceChange || false,
            notifyAvailability: item.notifyAvailability || false,
          });

          migratedCount++;
        } catch (error) {
          // Error 409 = ya existe, no es fallo real
          if (error.response?.status === 409) {
            console.log(
              "[WishlistContext] Item ya existe, continuando:",
              item.productId
            );
            migratedCount++;
          } else {
            console.error("[WishlistContext] Error migrando item:", error);
            failedCount++;
          }
        }
      }

      // Refrescar desde backend
      await fetchWishlist(true);

      console.log(
        `[WishlistContext] ✅ Migración completa: ${migratedCount} exitosos, ${failedCount} fallidos`
      );

      return { success: true, migratedCount, failedCount };
    } catch (error) {
      console.error("[WishlistContext] ❌ Error en migración:", error);
      return {
        success: false,
        error: error.message,
        migratedCount: 0,
        failedCount: 0,
      };
    }
  }, [loadGuestWishlist, fetchWishlist]);

  const clearGuestWishlist = useCallback(() => {
    try {
      localStorage.removeItem(WISHLIST_STORAGE_KEY);
      console.log("[WishlistContext] 🧹 Wishlist de invitado eliminada");
    } catch (error) {
      console.error("[WishlistContext] Error limpiando wishlist local:", error);
    }
  }, []);

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    if (!initialized) {
      fetchWishlist();
    }
  }, [initialized, fetchWishlist]);

  // ============================================================================
  // HELPERS COMPUTADOS
  // ============================================================================

  const isEmpty = isWishlistEmpty(wishlist);
  const itemCount = getItemCount(wishlist);

  // ============================================================================
  // VALUE
  // ============================================================================

  const value = {
    // Estado
    wishlist,
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
    clearWishlistItems,
    checkProduct,
    moveToCart,
    getPriceChanges,
    refreshWishlist,

    // Caché / utils
    clearCache,
    setError,

    // 🆕 FUNCIONES DE SINCRONIZACIÓN
    migrateGuestWishlistToUser,
    clearGuestWishlist,
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
