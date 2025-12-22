import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import * as cartAPI from "../api/cart.api";
import { CART_CACHE_CONFIG } from "../types/cart.types";
import { isCartEmpty, calculateItemCount } from "../utils/cartHelpers";
import { useAuth } from "../../../core/providers/AuthProvider";

const CartContext = createContext(null);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe usarse dentro de CartProvider");
  }
  return context;
};

/**
 * ✅ CORRECCIÓN: Provider optimizado sin loops ni llamadas duplicadas
 */
export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  // ============================================================================
  // STATE
  // ============================================================================
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Caché
  const [cache, setCache] = useState({
    data: null,
    timestamp: null,
  });

  // ✅ PROTECCIÓN: Refs
  const fetchInProgressRef = useRef(false);
  const mountedRef = useRef(true);
  const initializedOnceRef = useRef(false);

  // ============================================================================
  // CACHE HELPERS
  // ============================================================================
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    const now = Date.now();
    return now - cache.timestamp < CART_CACHE_CONFIG.TTL;
  }, [cache]);

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
  // FETCH CART - ✅ OPTIMIZADO
  // ============================================================================
  const fetchCart = useCallback(
    async (forceRefresh = false) => {

      // ✅ GUARD 2: Prevenir fetch simultáneo
      if (fetchInProgressRef.current) {
        console.log("[CartContext] Fetch ya en progreso, ignorando...");
        return cart;
      }

      // ✅ GUARD 3: Usar caché si es válido
      if (!forceRefresh && isCacheValid()) {
        console.log("[CartContext] Usando caché válido");
        setCart(cache.data);
        return cache.data;
      }

      fetchInProgressRef.current = true;

      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.getCart();

        if (!mountedRef.current) return null;

        if (response?.success) {
          setCart(response.data);
          updateCache(response.data);
          return response.data;
        }
      } catch (err) {
        if (!mountedRef.current) return null;

        // ✅ No mostrar error para 401
        if (err.response?.status === 401) {
          setCart(null);
          return null;
        }

        const errorMessage =
          err.response?.data?.message || "Error al cargar el carrito";
        setError(errorMessage);
        console.error("[CartContext] Error fetching cart:", err);

        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
          setInitialized(true);
        }
        fetchInProgressRef.current = false;
      }
    },
    [ isCacheValid, updateCache ]
  );

  const addItem = useCallback(
    async (itemData) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.addToCart(itemData);

        if (response?.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }

        return null;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al agregar producto";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error adding item:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  const updateItem = useCallback(
    async (productId, updateData) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.updateCartItem(productId, updateData);

        if (response.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar cantidad";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error updating item:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  const removeItem = useCallback(
    async (productId, attributes = {}) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.removeFromCart(productId, attributes);

        if (response.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al eliminar producto";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error removing item:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  const clearCartItems = useCallback(async () => {
    if (!token) {
      console.warn("[CartContext] Usuario no autenticado");
      return null;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await cartAPI.clearCart();

      if (response.success && mountedRef.current) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al vaciar carrito";
      if (mountedRef.current) {
        setError(errorMessage);
      }
      console.error("[CartContext] Error clearing cart:", err);
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [token, updateCache]);

  const applyCoupon = useCallback(
    async (code) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.applyCoupon(code);

        if (response.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al aplicar cupón";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error applying coupon:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  const updateShippingAddress = useCallback(
    async (addressData) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.updateShippingAddress(addressData);

        if (response.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar dirección";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error updating address:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  const updateShippingMethod = useCallback(
    async (shippingData) => {
      if (!token) {
        console.warn("[CartContext] Usuario no autenticado");
        return null;
      }
      try {
        setLoading(true);
        setError(null);

        const response = await cartAPI.updateShippingMethod(shippingData);

        if (response.success && mountedRef.current) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar método de envío";
        if (mountedRef.current) {
          setError(errorMessage);
        }
        console.error("[CartContext] Error updating shipping method:", err);
        return null;
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [token, updateCache]
  );

  // ============================================================================
  // HELPERS
  // ============================================================================
  const refreshCart = useCallback(() => {
    return fetchCart(true);
  }, [fetchCart]);

  const getItemCount = useCallback(() => {
    if (!cart || !cart.items) return 0;
    return calculateItemCount(cart.items);
  }, [cart]);

  const isEmpty = useCallback(() => {
    return isCartEmpty(cart);
  }, [cart]);

  // ============================================================================
  // INITIALIZATION - ✅ SOLO UNA VEZ
  // ============================================================================

  useEffect(() => {
  mountedRef.current = true;

  if (isAuthenticated) {
    // CASO A: El usuario acaba de loguearse o la app carga logueada
    console.log("[CartContext] Usuario autenticado, cargando carrito...");
    fetchCart(false); 
  } else {
    // CASO B: No hay usuario (Logout o carga inicial anónima)
    setCart(null);
    setInitialized(true);
    clearCache();
    // Reseteamos la guarda para que si alguien se loguea, permita un nuevo fetch
    initializedOnceRef.current = false;
  }

  return () => {
    mountedRef.current = false;
  };
}, [isAuthenticated]); // 👈 El único disparador real

  // ============================================================================
  // VALUE
  // ============================================================================
  const value = {
    cart,
    loading,
    error,
    initialized,

    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,

    refreshCart,
    getItemCount,
    isEmpty,
    clearCache,

    setError: (err) => setError(err),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
