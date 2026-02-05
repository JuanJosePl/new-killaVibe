import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as wishlistAPI from "../api/wishlist.api";
import { isWishlistEmpty, getItemCount } from "../utils/wishlistHelpers";

/**
 * @context WishlistContext
 * @description Context global para Wishlist con caché en memoria
 *
 * SINCRONIZADO con CartContext (misma arquitectura)
 */

const WishlistContext = createContext(null);

// Configuración de caché
const WISHLIST_CACHE_CONFIG = {
  TTL: 5 * 60 * 1000, // 5 minutos
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
    timestamp: null,
  });

  /**
   * Verifica si el caché es válido
   */
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    const now = Date.now();
    return now - cache.timestamp < WISHLIST_CACHE_CONFIG.TTL;
  }, [cache]);

  /**
   * Actualiza el caché
   */
  const updateCache = useCallback((data) => {
    setCache({
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Limpia el caché
   */
  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: null,
    });
  }, []);

  /**
   * Obtener wishlist (con caché)
   */
  const fetchWishlist = useCallback(
    async (forceRefresh = false) => {
      try {
        const auth = localStorage.getItem("killavibes_auth");

        // MODO INVITADO: No llamar a la API
        if (!auth) {
          const saved = localStorage.getItem("killavibes_wishlist_guest");
          let guestItems = [];

          try {
            guestItems = saved ? JSON.parse(saved) : [];
          } catch (e) {
            console.error("Error parsing guest wishlist:", e);
            localStorage.removeItem("killavibes_wishlist_guest");
          }

          const wishlistData = {
            items: guestItems,
            itemCount: guestItems.length,
            user: null,
          };

          setWishlist(wishlistData);
          setInitialized(true);
          setLoading(false);
          return wishlistData;
        }

        // MODO AUTENTICADO
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
        console.error("[WishlistContext] Error fetching wishlist:", err);
        const errorMsg =
          err.response?.data?.message || "Error al cargar la wishlist";
        setError(errorMsg);

        // Inicializar con wishlist vacía en caso de error
        const emptyWishlist = { items: [], itemCount: 0 };
        setWishlist(emptyWishlist);
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    },
    [isCacheValid, cache.data, updateCache]
  );

  /**
   * Agregar item a wishlist
   */
  const addItem = useCallback(
    async (itemData) => {
      try {
        const auth = localStorage.getItem("killavibes_auth");

        // MODO INVITADO
        if (!auth) {
          const saved = localStorage.getItem("killavibes_wishlist_guest");
          let currentItems = [];

          try {
            currentItems = saved ? JSON.parse(saved) : [];
          } catch (e) {
            console.error("Error parsing guest wishlist:", e);
          }

          // Verificar si ya existe
          const exists = currentItems.find(
            (i) => i.productId === itemData.productId
          );
          if (exists) {
            throw new Error("El producto ya está en tu lista de deseos");
          }

          // Agregar con estructura completa
          const newItem = {
            productId: itemData.productId,
            notifyPriceChange: itemData.notifyPriceChange || false,
            notifyAvailability: itemData.notifyAvailability || false,
            addedAt: new Date().toISOString(),
          };

          currentItems.push(newItem);
          localStorage.setItem(
            "killavibes_wishlist_guest",
            JSON.stringify(currentItems)
          );

          const updatedWishlist = {
            items: currentItems,
            itemCount: currentItems.length,
          };
          setWishlist(updatedWishlist);

          return updatedWishlist;
        }

        // MODO AUTENTICADO
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
    [updateCache]
  );

  /**
   * Eliminar item de wishlist
   */
  const removeItem = useCallback(
    async (productId) => {
      try {
        const auth = localStorage.getItem("killavibes_auth");

        // MODO INVITADO
        if (!auth) {
          const saved = localStorage.getItem("killavibes_wishlist_guest");
          let currentItems = [];

          try {
            currentItems = saved ? JSON.parse(saved) : [];
          } catch (e) {
            console.error("Error parsing guest wishlist:", e);
          }

          const filteredItems = currentItems.filter(
            (i) => i.productId !== productId
          );
          localStorage.setItem(
            "killavibes_wishlist_guest",
            JSON.stringify(filteredItems)
          );

          const updatedWishlist = {
            items: filteredItems,
            itemCount: filteredItems.length,
          };
          setWishlist(updatedWishlist);

          return updatedWishlist;
        }

        // MODO AUTENTICADO
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
    [updateCache]
  );

  /**
   * Limpiar toda la wishlist
   */
  const clearWishlistItems = useCallback(async () => {
    try {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO INVITADO
      if (!auth) {
        localStorage.removeItem("killavibes_wishlist_guest");
        const emptyWishlist = { items: [], itemCount: 0 };
        setWishlist(emptyWishlist);
        return emptyWishlist;
      }

      // MODO AUTENTICADO
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

  /**
   * Verificar si producto está en wishlist
   */
  const checkProduct = useCallback(async (productId) => {
    try {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO INVITADO
      if (!auth) {
        const saved = localStorage.getItem("killavibes_wishlist_guest");
        let currentItems = [];

        try {
          currentItems = saved ? JSON.parse(saved) : [];
        } catch (e) {
          return false;
        }

        return currentItems.some((i) => i.productId === productId);
      }

      // MODO AUTENTICADO
      const response = await wishlistAPI.checkProduct(productId);
      return response.inWishlist;
    } catch (err) {
      console.error("[WishlistContext] Error checking product:", err);
      return false;
    }
  }, []);

  /**
   * Mover items a carrito
   */
  const moveToCart = useCallback(
    async (productIds) => {
      try {
        const auth = localStorage.getItem("killavibes_auth");

        if (!auth) {
          throw new Error(
            "Debes iniciar sesión para mover productos al carrito"
          );
        }

        setLoading(true);
        setError(null);

        const response = await wishlistAPI.moveToCart(productIds);

        // Refrescar wishlist después de mover
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

  /**
   * Obtener cambios de precio
   */
  const getPriceChanges = useCallback(async () => {
    try {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        return { data: [], count: 0 };
      }

      const response = await wishlistAPI.getPriceChanges();
      return response.data;
    } catch (err) {
      console.error("[WishlistContext] Error getting price changes:", err);
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

  // ============================================================================
  // 🆕 FUNCIONES DE MIGRACIÓN (Agregar ANTES del return de WishlistProvider)
  // ============================================================================

  /**
   * Migra la wishlist de invitado al usuario autenticado
   */
  const migrateGuestWishlistToUser = useCallback(async () => {
    console.log("[WishlistContext] 🔄 Migrando wishlist de invitado...");

    try {
      // 1. Obtener wishlist local
      const guestWishlistRaw = localStorage.getItem(
        "killavibes_wishlist_guest"
      );
      if (!guestWishlistRaw) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      let guestItems = [];
      try {
        guestItems = JSON.parse(guestWishlistRaw);
      } catch (e) {
        console.error("[WishlistContext] Error parsing guest wishlist:", e);
        return { success: false, error: "Wishlist local corrupta" };
      }

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      console.log(`[WishlistContext] Migrando ${guestItems.length} items...`);

      // 2. Migrar cada item al backend
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

          // Llamar a API para agregar
          await wishlistAPI.addItem({
            productId,
            notifyPriceChange: item.notifyPriceChange || false,
            notifyAvailability: item.notifyAvailability || false,
          });

          migratedCount++;
        } catch (error) {
          // Si el error es "ya existe", no contar como fallo
          if (error.response?.status === 409) {
            console.log(
              "[WishlistContext] Item ya existe en wishlist:",
              item.productId
            );
            migratedCount++;
          } else {
            console.error("[WishlistContext] Error migrando item:", error);
            failedCount++;
          }
        }
      }

      // 3. Refrescar wishlist desde backend
      await fetchWishlist(true);

      console.log(
        `[WishlistContext] ✅ Migración completa: ${migratedCount} exitosos, ${failedCount} fallidos`
      );

      return {
        success: true,
        migratedCount,
        failedCount,
      };
    } catch (error) {
      console.error("[WishlistContext] ❌ Error en migración:", error);
      return {
        success: false,
        error: error.message,
        migratedCount: 0,
        failedCount: 0,
      };
    }
  }, [fetchWishlist]);

  /**
   * Limpia la wishlist de invitado del localStorage
   */
  const clearGuestWishlist = useCallback(() => {
    try {
      localStorage.removeItem("killavibes_wishlist_guest");
      console.log("[WishlistContext] 🧹 Wishlist de invitado eliminada");
    } catch (error) {
      console.error("[WishlistContext] Error limpiando wishlist local:", error);
    }
  }, []);

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

/**
 * @hook useWishlistContext
 * @description Hook para acceder al context
 */
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
