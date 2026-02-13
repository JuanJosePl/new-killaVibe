// cart/context/CartContext.jsx

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import * as cartAPI from "../api/cart.api";
import {
  CART_CACHE_CONFIG,
  CART_STORAGE_KEYS,
  EMPTY_CART_STRUCTURE,
  CART_LIMITS,
} from "../types/cart.types";
import {
  isCartEmpty,
  calculateItemCount,
  normalizeCartStructure,
  calculateLocalCartTotals,
  isProductInCart as isProductInCartHelper,
  findCartItem,
  generateCartItemKey,
} from "../utils/cartHelpers";

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
  const [cart, setCart] = useState(EMPTY_CART_STRUCTURE);
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
    return Date.now() - cache.timestamp < CART_CACHE_CONFIG.TTL;
  }, [cache]);

  const updateCache = useCallback((data) => {
    setCache({ data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null });
  }, []);

  /**
   * Guarda el carrito guest en localStorage.
   */
  const saveGuestCart = useCallback((cartData) => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEYS.GUEST_CART,
        JSON.stringify(cartData)
      );
    } catch (err) {
      console.error("[CartContext] Error guardando cart guest:", err);
    }
  }, []);

  /**
   * Carga el carrito guest con compatibilidad hacia atrás.
   */
  const loadGuestCart = useCallback(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEYS.GUEST_CART);
      if (!saved) return EMPTY_CART_STRUCTURE;

      const parsed = JSON.parse(saved);

      // Formato nuevo: objeto con .items
      if (
        parsed &&
        typeof parsed === "object" &&
        !Array.isArray(parsed) &&
        Array.isArray(parsed.items)
      ) {
        return parsed;
      }

      // Formato legado: array plano de items
      if (Array.isArray(parsed)) {
        console.log(
          "[CartContext] Formato legacy detectado, recalculando totales..."
        );
        return calculateLocalCartTotals(parsed);
      }

      console.warn("[CartContext] Cart guest corrupto, inicializando vacío");
      return EMPTY_CART_STRUCTURE;
    } catch (err) {
      console.error("[CartContext] Error cargando cart guest:", err);
      return EMPTY_CART_STRUCTURE;
    }
  }, []);

  // ============================================================================
  // OPERACIONES GUEST MODE
  // ============================================================================

  const addItemGuest = useCallback(
    (productData, quantity = 1) => {
      const currentCart = loadGuestCart();

      const productId =
        productData._id || productData.id || productData.productId;

      if (!productId) {
        throw new Error("ID de producto inválido");
      }

      const qty = Number(quantity);
      if (qty < CART_LIMITS.MIN_QUANTITY || qty > CART_LIMITS.MAX_QUANTITY) {
        throw new Error(
          `Cantidad debe estar entre ${CART_LIMITS.MIN_QUANTITY} y ${CART_LIMITS.MAX_QUANTITY}`
        );
      }

      const availableStock = productData.stock || 99;

      const newItems = [...currentCart.items];

      // Buscar si ya existe en el carrito
      const existingIndex = newItems.findIndex((item) => {
        const itemProductId = item.product?._id || item.product?.id;
        return String(itemProductId) === String(productId);
      });

      if (existingIndex > -1) {
        const currentQty = newItems[existingIndex].quantity;
        const newQty = currentQty + qty;

        if (newQty > CART_LIMITS.MAX_QUANTITY) {
          throw new Error(
            `Cantidad máxima permitida: ${CART_LIMITS.MAX_QUANTITY}`
          );
        }
        if (productData.trackQuantity && newQty > availableStock) {
          throw new Error(`Solo hay ${availableStock} unidades disponibles`);
        }

        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newQty,
        };
      } else {
        if (productData.trackQuantity && qty > availableStock) {
          throw new Error(`Solo hay ${availableStock} unidades disponibles`);
        }

        newItems.push({
          product: {
            _id: productId,
            id: productId,
            name: productData.name || "Producto",
            price: Number(productData.price) || 0,
            comparePrice: Number(productData.comparePrice) || 0,
            images:
              productData.images ||
              (productData.image ? [{ url: productData.image }] : []),
            slug: productData.slug || "",
            stock: availableStock,
            trackQuantity: productData.trackQuantity || false,
            mainCategory:
              productData.mainCategory || productData.category || null,
            rating: productData.rating || null,
            isFeatured: productData.isFeatured || productData.featured || false,
          },
          quantity: qty,
          price: Number(productData.price) || 0,
          attributes: productData.attributes || {},
          options: productData.attributes || {},
        });
      }

      const updatedCart = calculateLocalCartTotals(newItems);

      saveGuestCart(updatedCart);
      setCart(updatedCart);
      updateCache(updatedCart);

      return { success: true, data: updatedCart };
    },
    [loadGuestCart, saveGuestCart, updateCache]
  );

  const updateItemGuest = useCallback(
    (productId, updateData) => {
      const currentCart = loadGuestCart();
      const newItems = [...currentCart.items];

      const index = newItems.findIndex((item) => {
        const itemProductId = item.product?._id || item.product?.id;
        return String(itemProductId) === String(productId);
      });

      if (index === -1) {
        throw new Error("Producto no encontrado en el carrito");
      }

      const qty = Number(updateData.quantity);
      if (qty < CART_LIMITS.MIN_QUANTITY || qty > CART_LIMITS.MAX_QUANTITY) {
        throw new Error(
          `Cantidad debe estar entre ${CART_LIMITS.MIN_QUANTITY} y ${CART_LIMITS.MAX_QUANTITY}`
        );
      }

      const product = newItems[index].product;
      if (product.trackQuantity && product.stock < qty) {
        throw new Error(`Solo hay ${product.stock} unidades disponibles`);
      }

      newItems[index] = { ...newItems[index], quantity: qty };

      const updatedCart = calculateLocalCartTotals(newItems);

      saveGuestCart(updatedCart);
      setCart(updatedCart);
      updateCache(updatedCart);

      return { success: true, data: updatedCart };
    },
    [loadGuestCart, saveGuestCart, updateCache]
  );

  const removeItemGuest = useCallback(
    (productId) => {
      const currentCart = loadGuestCart();
      const newItems = currentCart.items.filter((item) => {
        const itemProductId = item.product?._id || item.product?.id;
        return String(itemProductId) !== String(productId);
      });

      const updatedCart = calculateLocalCartTotals(newItems);

      saveGuestCart(updatedCart);
      setCart(updatedCart);
      updateCache(updatedCart);

      return { success: true, data: updatedCart };
    },
    [loadGuestCart, saveGuestCart, updateCache]
  );

  const clearCartGuest = useCallback(() => {
    localStorage.removeItem(CART_STORAGE_KEYS.GUEST_CART);
    setCart(EMPTY_CART_STRUCTURE);
    updateCache(EMPTY_CART_STRUCTURE);
    return { success: true, data: EMPTY_CART_STRUCTURE };
  }, [updateCache]);

  // ============================================================================
  // OPERACIONES CRUD (DUAL MODE)
  // ============================================================================

  const fetchCart = useCallback(
    async (forceRefresh = false) => {
      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        const guestCart = loadGuestCart();
        setCart(guestCart);
        setInitialized(true);
        return guestCart;
      }

      // MODO AUTENTICADO
      try {
        if (fetchAbortController.current) {
          fetchAbortController.current.abort();
        }

        if (!forceRefresh && isCacheValid()) {
          setCart(cache.data);
          setInitialized(true);
          return cache.data;
        }

        setLoading(true);
        fetchAbortController.current = new AbortController();

        const response = await cartAPI.getCart();

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          setInitialized(true);
          return response.data;
        }
      } catch (err) {
        if (err.name === "AbortError") {
          console.log("[CartContext] Request abortado");
          return;
        }
        if (err.response?.status === 401) {
          setCart(EMPTY_CART_STRUCTURE);
        } else {
          setError(err.response?.data?.message || "Error al cargar el carrito");
        }
      } finally {
        setLoading(false);
        setInitialized(true);
        fetchAbortController.current = null;
      }
    },
    [isCacheValid, cache.data, updateCache, loadGuestCart]
  );

  const addItem = useCallback(
    async (productData, quantity = 1, options = {}) => {
      if (!productData) {
        const err = new Error("Datos de producto requeridos");
        setError(err.message);
        throw err;
      }

      const auth = localStorage.getItem("killavibes_auth");

      // MODO GUEST
      if (!auth) {
        setLoading(true);
        try {
          const productWithOptions =
            options && Object.keys(options).length > 0
              ? { ...productData, attributes: options }
              : productData;
          return addItemGuest(productWithOptions, quantity);
        } finally {
          setLoading(false);
        }
      }

      // MODO AUTENTICADO
      const productId =
        productData._id || productData.id || productData.productId;

      if (!productId) {
        const err = new Error("ID de producto inválido");
        setError(err.message);
        throw err;
      }

      try {
        setLoading(true);
        const response = await cartAPI.addToCart({
          productId,
          quantity: Number(quantity),
          ...options,
        });

        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          console.log(
            "[CartContext] ✅ Producto agregado al carrito (API):",
            productData.name
          );
          return response;
        }

        throw new Error(response.message || "Error al agregar al carrito");
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          err.message ||
          "Error al agregar al carrito";
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [addItemGuest, updateCache]
  );

  const updateItem = useCallback(
    async (productId, updateData) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        setLoading(true);
        try {
          return updateItemGuest(productId, updateData);
        } finally {
          setLoading(false);
        }
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
        setError(err.response?.data?.message || "Error al actualizar");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateItemGuest, updateCache]
  );

  const removeItem = useCallback(
    async (productId) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        setLoading(true);
        try {
          return removeItemGuest(productId);
        } finally {
          setLoading(false);
        }
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
        setError(err.response?.data?.message || "Error al eliminar");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [removeItemGuest, updateCache]
  );

  const clearCartItems = useCallback(async () => {
    const auth = localStorage.getItem("killavibes_auth");

    if (!auth) {
      setLoading(true);
      try {
        return clearCartGuest();
      } finally {
        setLoading(false);
      }
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
      setError(err.response?.data?.message || "Error al vaciar");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [clearCartGuest, updateCache]);

  const applyCoupon = useCallback(
    async (code) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        throw new Error("Debes iniciar sesión para aplicar cupones");
      }

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
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const updateShippingAddress = useCallback(
    async (addressData) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        throw new Error("Debes iniciar sesión para guardar direcciones");
      }

      try {
        setLoading(true);
        const response = await cartAPI.updateShippingAddress(addressData);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error en dirección");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  const updateShippingMethod = useCallback(
    async (shippingData) => {
      const auth = localStorage.getItem("killavibes_auth");

      if (!auth) {
        throw new Error(
          "Debes iniciar sesión para seleccionar método de envío"
        );
      }

      try {
        setLoading(true);
        const response = await cartAPI.updateShippingMethod(shippingData);
        if (response.success) {
          setCart(response.data);
          updateCache(response.data);
          return response;
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error en método envío");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateCache]
  );

  // ============================================================================
  // FUNCIONES DE MIGRACIÓN
  // ============================================================================

  const migrateGuestCartToUser = useCallback(async () => {
    console.log("[CartContext] 🔄 Migrando carrito de invitado...");

    try {
      const guestCart = loadGuestCart();

      if (!guestCart.items || guestCart.items.length === 0) {
        return { success: true, migratedCount: 0, failedCount: 0 };
      }

      console.log(`[CartContext] Migrando ${guestCart.items.length} items...`);

      let migratedCount = 0;
      let failedCount = 0;

      for (const item of guestCart.items) {
        try {
          const productId =
            item.product?._id || item.product?.id || item.productId;
          const quantity = Number(item.quantity) || 1;

          if (!productId) {
            console.warn("[CartContext] Item sin productId, saltando:", item);
            failedCount++;
            continue;
          }

          await cartAPI.addToCart({ productId, quantity });
          migratedCount++;
        } catch (err) {
          console.error("[CartContext] Error migrando item:", err);
          failedCount++;
        }
      }

      await fetchCart(true);

      console.log(
        `[CartContext] ✅ Migración completa: ${migratedCount} exitosos, ${failedCount} fallidos`
      );

      return { success: true, migratedCount, failedCount };
    } catch (err) {
      console.error("[CartContext] ❌ Error en migración:", err);
      return {
        success: false,
        error: err.message,
        migratedCount: 0,
        failedCount: 0,
      };
    }
  }, [loadGuestCart, fetchCart]);

  const clearGuestCart = useCallback(() => {
    try {
      localStorage.removeItem(CART_STORAGE_KEYS.GUEST_CART);
      console.log("[CartContext] 🧹 Carrito de invitado eliminado");
    } catch (err) {
      console.error("[CartContext] Error limpiando carrito local:", err);
    }
  }, []);

  // ============================================================================
  // ✅ FUNCIONES DE VERIFICACIÓN (NUEVAS)
  // ============================================================================

  /**
   * Verifica si un producto está en el carrito
   * @param {string} productId - ID del producto
   * @param {Object} attributes - Atributos del producto (opcional)
   * @returns {boolean}
   */
  const isProductInCart = useCallback(
    (productId, attributes = {}) => {
      if (!productId || !cart?.items) return false;
      return isProductInCartHelper(cart.items, productId, attributes);
    },
    [cart]
  );

  /**
   * Obtiene la cantidad de un producto en el carrito
   * @param {string} productId - ID del producto
   * @param {Object} attributes - Atributos del producto (opcional)
   * @returns {number}
   */
  const getProductQuantity = useCallback(
    (productId, attributes = {}) => {
      if (!productId || !cart?.items) return 0;
      
      const item = findCartItem(cart.items, productId, attributes);
      return item ? Number(item.quantity) || 0 : 0;
    },
    [cart]
  );

  // ============================================================================
  // HELPERS DE VISTA
  // ============================================================================

  const refreshCart = useCallback(() => fetchCart(true), [fetchCart]);

  const getItemCount = useCallback(() => {
    return calculateItemCount(cart?.items || []);
  }, [cart]);

  const isEmpty = useCallback(() => isCartEmpty(cart), [cart]);

  // ============================================================================
  // INICIALIZACIÓN
  // ============================================================================

  useEffect(() => {
    if (!initialized) {
      fetchCart();
    }
  }, [initialized, fetchCart]);

  // ============================================================================
  // VALUE
  // ============================================================================

  const value = {
    cart,
    loading,
    error,
    initialized,
    
    itemCount: calculateItemCount(cart.items),

    // CRUD
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
    setError: (err) => setError(err),

    // ✅ FUNCIONES DE VERIFICACIÓN
    isProductInCart,
    getProductQuantity,

    // Migración
    migrateGuestCartToUser,
    clearGuestCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;