import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as cartAPI from '../api/cart.api';
import { CART_CACHE_CONFIG } from '../types/cart.types';
import { isCartEmpty, calculateItemCount } from '../utils/cartHelpers';

const CartContext = createContext(null);

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext debe usarse dentro de CartProvider');
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
    return (Date.now() - cache.timestamp) < CART_CACHE_CONFIG.TTL;
  }, [cache]);

  const updateCache = useCallback((data) => {
    setCache({ data, timestamp: Date.now() });
  }, []);

  const clearCache = useCallback(() => {
    setCache({ data: null, timestamp: null });
  }, []);

  // Helper para calcular totales localmente (Modo Invitado)
  const calculateLocalCartTotals = (items) => {
  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.product?.price || item.price || 0);
    const qty = Number(item.quantity || 0);
    return acc + (price * qty);
  }, 0);

  // LÓGICA DE ENVÍO: Gratis a partir de 150.000
  const shippingCost = subtotal >= 150000 ? 0 : 15000; // 15k precio base si no llega
  
  // LÓGICA DE IMPUESTOS (Ejemplo 19% IVA)
  const taxRate = 0.19;
  const tax = subtotal * taxRate;
  
  const total = subtotal + shippingCost; // El subtotal suele ya incluir el IVA en Colombia, o sumarlo aquí según tu backend

  return { 
    items, 
    subtotal, 
    tax, 
    shippingCost, 
    total 
  };
};

  // ============================================================================
  // OPERACIONES CRUD
  // ============================================================================

  const fetchCart = useCallback(async (forceRefresh = false) => {
    const auth = localStorage.getItem('killavibes_auth');

    if (!auth) {
      const saved = localStorage.getItem('killavibes_cart_guest');
      const parsed = saved ? JSON.parse(saved) : [];

      // Normalización de items invitados (asegurar estructura de producto e imágenes)
      const normalizedItems = Array.isArray(parsed)
        ? parsed.map((item) => {
            const productData = item.product || item || {};

            // Normalizar imágenes: usar cualquier campo disponible
            let images = productData.images;
            if (!Array.isArray(images) || images.length === 0) {
              const singleImage =
                productData.image ||
                productData.primaryImage ||
                productData.mainImage ||
                productData.mainImageUrl ||
                productData.thumbnail ||
                null;

              if (singleImage) {
                images = [singleImage];
              } else {
                images = [];
              }
            }

            return {
              ...item,
              product: {
                ...productData,
                images,
              },
            };
          })
        : [];

      const cartData = calculateLocalCartTotals(normalizedItems);

      // Guardar versión normalizada
      localStorage.setItem(
        'killavibes_cart_guest',
        JSON.stringify(cartData.items)
      );

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
        setError(err.response?.data?.message || 'Error al cargar el carrito');
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [isCacheValid, cache.data, updateCache]);

  const addItem = useCallback(async (productData, quantity = 1, options = {}) => {
  // Validación inicial
  if (!productData) {
    console.error('[CartContext] addItem: Producto inválido');
    const error = new Error('Producto inválido');
    setError(error.message);
    throw error;
  }

  const productId = productData._id || productData.id;
  const availableStock = productData.stock || 99;
  
  // Verificar si hay autenticación
  const auth = localStorage.getItem('killavibes_auth');

  // ============================================================================
  // MODO INVITADO (GUEST) - SIN AUTENTICACIÓN
  // ============================================================================
  if (!auth) {
    setLoading(true);
    
    try {
      const saved = localStorage.getItem('killavibes_cart_guest');
      let currentItems = saved ? JSON.parse(saved) : [];
      
      // Buscar si el producto ya existe
      const existingIdx = currentItems.findIndex(i => {
        const id = i.product?._id || i.product?.id;
        return String(id) === String(productId);
      });

      if (existingIdx > -1) {
        // Producto ya existe: incrementar cantidad
        const currentQty = currentItems[existingIdx].quantity;
        
        // Validar stock disponible
        if (currentQty + quantity > availableStock) {
          throw new Error(`Solo hay ${availableStock} unidades disponibles`);
        }
        
        currentItems[existingIdx].quantity += quantity;
      } else {
        // Producto nuevo: agregar
        if (quantity > availableStock) {
          throw new Error(`Solo hay ${availableStock} unidades disponibles`);
        }

        // Normalizar imágenes del producto fuente
        let images = productData.images;
        if (!Array.isArray(images) || images.length === 0) {
          const singleImage =
            productData.image ||
            productData.primaryImage ||
            productData.mainImage ||
            productData.mainImageUrl ||
            productData.thumbnail ||
            null;

          if (singleImage) {
            images = [singleImage];
          } else {
            images = [];
          }
        }

        // ✅ ESTRUCTURA COMPLETA del item (con todas las propiedades necesarias)
        currentItems.push({
          product: {
            _id: productId,
            id: productId,
            name: productData.name || 'Producto',
            slug: productData.slug || productId,
            price: Number(productData.price) || 0,
            comparePrice: Number(productData.comparePrice) || 0,
            images,
            stock: availableStock,
            mainCategory: productData.mainCategory || productData.category || null,
            rating: productData.rating || null,
            isFeatured: productData.isFeatured || productData.featured || false
          },
          quantity: Number(quantity),
          price: Number(productData.price) || 0,
          options: options || {}
        });
      }

      // Calcular totales localmente
      const updatedCart = calculateLocalCartTotals(currentItems);
      
      // Guardar en localStorage
      localStorage.setItem('killavibes_cart_guest', JSON.stringify(updatedCart.items));
      
      // Actualizar estado
      setCart(updatedCart);
      updateCache(updatedCart);
      
      console.log('[CartContext] ✅ Producto agregado al carrito (guest):', productData.name);
      
      return { success: true, data: updatedCart };
    } catch (err) {
      console.error('[CartContext] Error adding to guest cart:', err);
      setError(err.message || 'Error al agregar al carrito');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  // ============================================================================
  // MODO AUTENTICADO (API)
  // ============================================================================
  try {
    setLoading(true);
    
    // Llamada a la API
    const response = await cartAPI.addToCart({
      productId,
      quantity,
      ...options
    });
    
    if (response.success) {
      setCart(response.data);
      updateCache(response.data);
      
      console.log('[CartContext] ✅ Producto agregado al carrito (API):', productData.name);
      
      return response;
    }
    
    throw new Error(response.message || 'Error al agregar al carrito');
  } catch (err) {
    console.error('[CartContext] Error adding to API cart:', err);
    
    const errorMsg = err.response?.data?.message || err.message || 'Error al agregar al carrito';
    setError(errorMsg);
    
    throw err;
  } finally {
    setLoading(false);
  }
}, [updateCache]);

  const updateItem = useCallback(async (productId, updateData) => {
    const auth = localStorage.getItem('killavibes_auth');

    if (!auth) {
      const saved = localStorage.getItem('killavibes_cart_guest');
      let currentItems = saved ? JSON.parse(saved) : [];
      const idx = currentItems.findIndex(i => i.product?._id === productId);

      if (idx > -1) {
        currentItems[idx].quantity = Number(updateData.quantity);
        const updatedCart = calculateLocalCartTotals(currentItems);
        localStorage.setItem('killavibes_cart_guest', JSON.stringify(updatedCart.items));
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
      setError('Error al actualizar');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const removeItem = useCallback(async (productId) => {
    const auth = localStorage.getItem('killavibes_auth');

    if (!auth) {
      const saved = localStorage.getItem('killavibes_cart_guest');
      const currentItems = saved ? JSON.parse(saved) : [];
      const filteredItems = currentItems.filter(item => item.product?._id !== productId);
      const updatedCart = calculateLocalCartTotals(filteredItems);

      localStorage.setItem('killavibes_cart_guest', JSON.stringify(updatedCart.items));
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
      setError('Error al eliminar');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const clearCartItems = useCallback(async () => {
    const auth = localStorage.getItem('killavibes_auth');
    if (!auth) {
      localStorage.removeItem('killavibes_cart_guest');
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
      setError('Error al vaciar');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const applyCoupon = useCallback(async (code) => {
    try {
      setLoading(true);
      const response = await cartAPI.applyCoupon(code);
      if (response.success) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cupón inválido');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const updateShippingAddress = useCallback(async (addressData) => {
    try {
      setLoading(true);
      const response = await cartAPI.updateShippingAddress(addressData);
      if (response.success) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      setError('Error en dirección');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  const updateShippingMethod = useCallback(async (shippingData) => {
    try {
      setLoading(true);
      const response = await cartAPI.updateShippingMethod(shippingData);
      if (response.success) {
        setCart(response.data);
        updateCache(response.data);
        return response;
      }
    } catch (err) {
      setError('Error en método envío');
    } finally {
      setLoading(false);
    }
  }, [updateCache]);

  // ============================================================================
  // HELPERS DE VISTA
  // ============================================================================
  const refreshCart = useCallback(() => fetchCart(true), [fetchCart]);
  
  const getItemCount = useCallback(() => {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc, item) => acc + (Number(item.quantity) || 0), 0);
  }, [cart]);

  const isEmpty = useCallback(() => isCartEmpty(cart), [cart]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const value = {
    cart,
    loading,
    error,
    initialized,
    
    itemCount: calculateItemCount(cart.items),

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
    setError: (err) => setError(err)
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;

// ============================================================================
// HELPERS ESTÁTICOS PARA syncManager (migración invitado → usuario)
// ============================================================================

/**
 * Migra el carrito guardado en localStorage (modo invitado)
 * al carrito del usuario autenticado mediante la API.
 *
 * @returns {Promise<{success: boolean, migratedCount: number, failedCount: number}>}
 */
export const migrateGuestCartToUser = async () => {
  try {
    const raw = localStorage.getItem("killavibes_cart_guest");
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
          product?._id || product?.id || item.productId || item._id || item.id;

        if (!productId) {
          failedCount += 1;
          continue;
        }

        const quantity = Number(item.quantity || 1);

        await cartAPI.addToCart({
          productId,
          quantity,
          attributes: item.options || {},
        });

        migratedCount += 1;
      } catch (err) {
        console.error("[CartContext] Error migrando item de invitado:", err);
        failedCount += 1;
      }
    }

    // Limpiar carrito de invitado tras migración
    localStorage.removeItem("killavibes_cart_guest");

    return { success: true, migratedCount, failedCount };
  } catch (error) {
    console.error("[CartContext] Error migrando carrito invitado:", error);
    return { success: false, migratedCount: 0, failedCount: 0 };
  }
};

/**
 * Limpia completamente el carrito de invitado del localStorage.
 * Usado por syncManager.clearAllGuestData.
 */
export const clearGuestCart = () => {
  try {
    localStorage.removeItem("killavibes_cart_guest");
  } catch (error) {
    console.error("[CartContext] Error limpiando carrito invitado:", error);
  }
};