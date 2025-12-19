import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as cartAPI from "../api/cart.api";
import { CART_CACHE_CONFIG } from "../types/cart.types";
import { isCartEmpty, calculateItemCount } from "../utils/cartHelpers";
import { useAuth } from "../../../core/providers/AuthProvider";

/**
 * @context CartContext
 * @description Context global para gestión de carrito con caché
 *
 * CARACTERÍSTICAS:
 * - Estado global del carrito
 * - Caché en memoria
 * - Sincronización con backend
 * - Optimistic updates
 * - Error handling robusto
 */

const CartContext = createContext(null);

/**
 * Hook para acceder al CartContext
 * @throws {Error} Si se usa fuera del provider
 */
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe usarse dentro de CartProvider");
  }
  return context;
};

/**
 * @component CartProvider
 * @description Provider del contexto de carrito
 */
export const CartProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  // ============================================================================
  // ESTADO
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

  // ============================================================================
  // HELPERS DE CACHÉ
  // ============================================================================

  /**
   * Verifica si el caché es válido
   */
  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    const now = Date.now();
    return now - cache.timestamp < CART_CACHE_CONFIG.TTL;
  }, [cache]);

  /**
   * Actualiza caché
   */
  const updateCache = useCallback((data) => {
    setCache({
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Limpia caché
   */
  const clearCache = useCallback(() => {
    setCache({
      data: null,
      timestamp: null,
    });
  }, []);

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  /**
   * Obtener carrito
   * Usa caché si está disponible y válido
   */
  const fetchCart = useCallback(
    async (forceRefresh = false) => {
      if (!token) {
        setCart(null);
        setInitialized(true);
        return null;
      }

      try {
        if (!forceRefresh && isCacheValid()) {
          setCart(cache.data);
          return cache.data;
        }

        setLoading(true);
        setError(null);

        const response = await cartAPI.getCart();

        if (response?.success) {
          setCart(response.data);
          updateCache(response.data);
          return response.data;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          // Usuario no autenticado → no es error real
          setCart(null);
          return null;
        }

        const errorMessage =
          err.response?.data?.message || "Error al cargar el carrito";

        setError(errorMessage);
        console.error("[CartContext] Error fetching cart:", err);

        return null; // 🚫 NO throw
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [token, isCacheValid, updateCache]
  );

  /**
   * Agregar item al carrito
   * Con optimistic update
   */
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

        if (response?.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }

        return null;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al agregar producto";

        setError(errorMessage);
        console.error("[CartContext] Error adding item:", err);
        return null; // 🚫 NO throw
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  /**
   * Actualizar cantidad de item
   */
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

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar cantidad";
        setError(errorMessage);
        console.error("[CartContext] Error updating item:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  /**
   * Eliminar item del carrito
   */
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

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al eliminar producto";
        setError(errorMessage);
        console.error("[CartContext] Error removing item:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  /**
   * Vaciar carrito
   */
  const clearCartItems = useCallback(async () => {
    if (!token) {
      console.warn("[CartContext] Usuario no autenticado");
      return null;
    }
    try {
      setLoading(true);
      setError(null);

      const response = await cartAPI.clearCart();

      if (response.success) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Error al vaciar carrito";
      setError(errorMessage);
      console.error("[CartContext] Error clearing cart:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token, updateCache]);

  /**
   * Aplicar cupón
   */
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

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al aplicar cupón";
        setError(errorMessage);
        console.error("[CartContext] Error applying coupon:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  /**
   * Actualizar dirección de envío
   */
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

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar dirección";
        setError(errorMessage);
        console.error("[CartContext] Error updating address:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  /**
   * Actualizar método de envío
   */
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

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Error al actualizar método de envío";
        setError(errorMessage);
        console.error("[CartContext] Error updating shipping method:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [token, updateCache]
  );

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Refrescar carrito desde servidor
   */
  const refreshCart = useCallback(() => {
    return fetchCart(true);
  }, [fetchCart]);

  /**
   * Obtener cantidad total de items
   */
  const getItemCount = useCallback(() => {
    if (!cart || !cart.items) return 0;
    return calculateItemCount(cart.items);
  }, [cart]);

  /**
   * Verificar si carrito está vacío
   */
  const isEmpty = useCallback(() => {
    return isCartEmpty(cart);
  }, [cart]);

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(null);
      setInitialized(true);
      clearCache();
      return;
    }

    // llamada directa, sin depender de fetchCart
    (async () => {
      await fetchCart(false);
    })();
  }, [isAuthenticated]); // 👈 SOLO auth

  // ============================================================================
  // VALOR DEL CONTEXTO
  // ============================================================================

  const value = {
    // Estado
    cart,
    loading,
    error,
    initialized,

    // Operaciones CRUD
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clearCartItems,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,

    // Helpers
    refreshCart,
    getItemCount,
    isEmpty,
    clearCache,

    // Métodos de utilidad
    setError: (err) => setError(err),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
