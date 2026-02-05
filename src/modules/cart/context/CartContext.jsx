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

const CartContext = createContext(null);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext debe usarse dentro de CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  // ============================================================================
  // ESTADO
  // ============================================================================
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [cache, setCache] = useState({ data: null, timestamp: null });

  // ============================================================================
  // HELPERS INTERNOS
  // ============================================================================

  const isCacheValid = useCallback(() => {
    if (!cache.data || !cache.timestamp) return false;
    return Date.now() - cache.timestamp < CART_CACHE_CONFIG.TTL;
  }, [cache]);

  const updateCache = useCallback((data) => {
    setCache({ data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null });
  }, []);

  // Helper para calcular totales localmente (Modo Invitado)
  const calculateLocalCartTotals = (items) => {
    const total = items.reduce((acc, item) => {
      const price = Number(item.product?.price || item.price || 0);
      const qty = Number(item.quantity || 0);
      return acc + price * qty;
    }, 0);
    return { items, total };
  };

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  const fetchCart = useCallback(
    async (forceRefresh = false) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        const saved = localStorage.getItem("killavibes_cart_guest");
        const cartData = saved
          ? calculateLocalCartTotals(JSON.parse(saved))
          : { items: [], total: 0 };
        setCart(cartData);
        setInitialized(true);
        return cartData;
      }

      try {
        if (!forceRefresh && isCacheValid()) {
          setCart(cache.data);
          return cache.data;
        }

        setLoading(true);
        const response = await cartAPI.getCart();
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response.data;
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setCart({ items: [], total: 0 });
        } else {
          setError(err.response?.data?.message || "Error al cargar el carrito");
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [isCacheValid, cache.data, updateCache]
  );

  const addItem = useCallback(
    async (productData, quantity = 1) => {
      if (!productData) return;
      const productId =
        productData._id || productData.id || productData.productId;
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        setLoading(true);
        try {
          const saved = localStorage.getItem("killavibes_cart_guest");
          let currentItems = saved ? JSON.parse(saved) : [];
          if (!Array.isArray(currentItems)) currentItems = [];

          const existingIdx = currentItems.findIndex(
            (i) => i.product?._id === productId || i.product?.id === productId
          );

          if (existingIdx > -1) {
            currentItems[existingIdx].quantity += quantity;
          } else {
            currentItems.push({
              product: {
                _id: productId,
                name: productData.name || "Producto",
                price: Number(productData.price) || 0,
                images:
                  productData.images ||
                  (productData.image ? [productData.image] : []),
                slug: productData.slug || "",
              },
              quantity,
              price: Number(productData.price) || 0,
            });
          }

          const updatedCart = calculateLocalCartTotals(currentItems);
          localStorage.setItem(
            "killavibes_cart_guest",
            JSON.stringify(updatedCart.items)
          );
          setCart(updatedCart);
          updateCache(updatedCart);
          return { success: true, data: updatedCart };
        } finally {
          setLoading(false);
        }
      }

      try {
        setLoading(true);
        const response = await cartAPI.addToCart({ productId, quantity });
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error al agregar");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const updateItem = useCallback(
    async (productId, updateData) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        const saved = localStorage.getItem("killavibes_cart_guest");
        let currentItems = saved ? JSON.parse(saved) : [];
        const idx = currentItems.findIndex((i) => i.product?._id === productId);

        if (idx > -1) {
          currentItems[idx].quantity = Number(updateData.quantity);
          const updatedCart = calculateLocalCartTotals(currentItems);
          localStorage.setItem(
            "killavibes_cart_guest",
            JSON.stringify(updatedCart.items)
          );
          setCart(updatedCart);
          updateCache(updatedCart);
          return { success: true, data: updatedCart };
        }
        return;
      }

      try {
        setLoading(true);
        const response = await cartAPI.updateCartItem(productId, updateData);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError("Error al actualizar");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const removeItem = useCallback(
    async (productId) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        const saved = localStorage.getItem("killavibes_cart_guest");
        const currentItems = saved ? JSON.parse(saved) : [];
        const filteredItems = currentItems.filter(
          (item) => item.product?._id !== productId
        );
        const updatedCart = calculateLocalCartTotals(filteredItems);

        localStorage.setItem(
          "killavibes_cart_guest",
          JSON.stringify(updatedCart.items)
        );
        setCart(updatedCart);
        updateCache(updatedCart);
        return { success: true, data: updatedCart };
      }

      try {
        setLoading(true);
        const response = await cartAPI.removeFromCart(productId);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError("Error al eliminar");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const clearCartItems = useCallback(async () => {
    const auth = localStorage.getItem("killavibes_auth");
    if (!auth) {
      localStorage.removeItem("killavibes_cart_guest");
      const emptyCart = { items: [], total: 0 };
      setCart(emptyCart);
      updateCache(emptyCart);
      return { success: true };
    }

    try {
      setLoading(true);
      const response = await cartAPI.clearCart();
      if (response.success) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      setError("Error al vaciar");
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const applyCoupon = useCallback(
    async (code) => {
      try {
        setLoading(true);
        const response = await cartAPI.applyCoupon(code);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Cupón inválido");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );


  const updateShippingAddress = useCallback(
    async (addressData) => {
      try {
        setLoading(true);
        const response = await cartAPI.updateShippingAddress(addressData);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError("Error en dirección");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const updateShippingMethod = useCallback(
    async (shippingData) => {
      try {
        setLoading(true);
        const response = await cartAPI.updateShippingMethod(shippingData);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError("Error en método envío");
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  // ============================================================================
  // HELPERS DE VISTA
  // ============================================================================
  const refreshCart = useCallback(() => fetchCart(true), [fetchCart]);

  const getItemCount = useCallback(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce(
      (acc, item) => acc + (Number(item.quantity) || 0),
      0
    );
  }, [cart]);

  const isEmpty = useCallback(() => isCartEmpty(cart), [cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ============================================================================
  // 🆕 FUNCIONES DE MIGRACIÓN (Agregar ANTES del return de CartProvider)
  // ============================================================================

  /**
   * Migra el carrito de invitado al usuario autenticado
   * Llamada desde syncManager post-login
   */
  const migrateGuestCartToUser = useCallback(async () => {
    console.log("[CartContext] 🔄 Migrando carrito de invitado...");

    try {
      // 1. Obtener carrito local
      const guestCartRaw = localStorage.getItem("killavibes_cart_guest");
      if (!guestCartRaw) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      let guestItems = [];
      try {
        guestItems = JSON.parse(guestCartRaw);
      } catch (e) {
        console.error("[CartContext] Error parsing guest cart:", e);
        return { success: false, error: "Carrito local corrupto" };
      }

      if (!Array.isArray(guestItems) || guestItems.length === 0) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      console.log(`[CartContext] Migrando ${guestItems.length} items...`);

      // 2. Migrar cada item al backend
      let migratedCount = 0;
      let failedCount = 0;

      for (const item of guestItems) {
        try {
          const productId =
            item.product?._id || item.product?.id || item.productId;
          const quantity = Number(item.quantity) || 1;

          if (!productId) {
            console.warn("[CartContext] Item sin productId, saltando:", item);
            failedCount++;
            continue;
          }

          // Llamar a API para agregar
          await cartAPI.addToCart({ productId, quantity });
          migratedCount++;
        } catch (error) {
          console.error("[CartContext] Error migrando item:", error);
          failedCount++;
        }
      }

      // 3. Refrescar carrito desde backend
      await fetchCart(true);

      console.log(
        `[CartContext] ✅ Migración completa: ${migratedCount} exitosos, ${failedCount} fallidos`
      );

      return {
        success: true,
        migratedCount,
        failedCount,
      };
    } catch (error) {
      console.error("[CartContext] ❌ Error en migración:", error);
      return {
        success: false,
        error: error.message,
        migratedCount: 0,
        failedCount: 0,
      };
    }
  }, [fetchCart]);

  /**
   * Limpia el carrito de invitado del localStorage
   */
  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem("killavibes_cart_guest");
      console.log("[CartContext] 🧹 Carrito de invitado eliminado");
    } catch (error) {
      console.error("[CartContext] Error limpiando carrito local:", error);
    }
  }, []);

  /**
   * Función wrapper para UI - sincroniza carrito después del login
   * Usada por LoginPage
   */
  const syncCartAfterLogin = useCallback(async () => {
    console.log("[CartContext] 🔄 Iniciando sincronización post-login...");

    try {
      // Migrar datos
      const result = await migrateGuestCartToUser();

      // Limpiar localStorage si la migración fue exitosa
      if (result.success && result.migratedCount > 0) {
        clearGuestCart();
      }

      return result;
    } catch (error) {
      console.error("[CartContext] Error en sincronización:", error);
      return { success: false, error: error.message };
    }
  }, [migrateGuestCartToUser, clearGuestCart]);

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

    // 🆕 FUNCIONES DE SINCRONIZACIÓN
    syncCartAfterLogin,
    migrateGuestCartToUser,
    clearGuestCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
