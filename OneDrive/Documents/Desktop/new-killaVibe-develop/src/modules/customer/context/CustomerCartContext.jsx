// src/modules/customer/context/CustomerCartContext.jsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import customerCartApi from "../api/customerCart.api";

const CustomerCartContext = createContext(null);

export const CustomerCartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadCart();
      setInitialized(true);
    }
  }, [initialized]);

  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.getCart();
      setCart(data);
    } catch (err) {
      setError(err);
      console.error("Error loading cart:", err);
      if (err.statusCode === 404) {
        setCart({
          items: [],
          subtotal: 0,
          total: 0,
          itemCount: 0,
          discountAmount: 0,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addItem = useCallback(
    async (productId, quantity = 1, attributes = {}) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await customerCartApi.addToCart(
          productId,
          quantity,
          attributes
        );
        setCart(data);
        return data;
      } catch (err) {
        setError(err);
        console.error("Error adding to cart:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const updateItem = useCallback(
    async (productId, quantity, attributes = {}) => {
      if (quantity < 1) {
        throw new Error("La cantidad mínima es 1");
      }
      try {
        setIsLoading(true);
        setError(null);
        const data = await customerCartApi.updateCartItem(
          productId,
          quantity,
          attributes
        );
        setCart(data);
        return data;
      } catch (err) {
        setError(err);
        console.error("Error updating cart item:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const removeItem = useCallback(async (productId, attributes = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.removeFromCart(productId, attributes);
      setCart(data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error removing from cart:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.clearCart();
      setCart(data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error clearing cart:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const applyCoupon = useCallback(async (code) => {
    if (!code || code.trim().length === 0) {
      throw new Error("El código de cupón es requerido");
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.applyCoupon(code.toUpperCase());
      setCart(data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error applying coupon:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateShippingAddress = useCallback(async (address) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.updateShippingAddress(address);
      setCart(data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error updating shipping address:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateShippingMethod = useCallback(async (method, cost) => {
    const validMethods = ["standard", "express", "overnight", "pickup"];
    if (!validMethods.includes(method)) {
      throw new Error("Método de envío inválido");
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.updateShippingMethod(method, cost);
      setCart(data);
      return data;
    } catch (err) {
      setError(err);
      console.error("Error updating shipping method:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const isInCart = useCallback(
    (productId) => {
      if (!cart || !cart.items) return false;
      return cart.items.some(
        (item) => item.product?._id === productId || item.product === productId
      );
    },
    [cart]
  );

  const isItemInCart = useCallback(
    (productId) => {
      return isInCart(productId);
    },
    [isInCart]
  );

  const getItemQuantity = useCallback(
    (productId) => {
      if (!cart || !cart.items) return 0;
      const item = cart.items.find(
        (item) => item.product?._id === productId || item.product === productId
      );
      return item?.quantity || 0;
    },
    [cart]
  );

  const refreshCart = useCallback(() => {
    return loadCart();
  }, [loadCart]);

  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;
  const discountAmount = cart?.discountAmount || 0;
  const shippingCost = cart?.shippingCost || 0;
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  const value = {
    cart,
    isLoading,
    error,
    initialized,
    itemCount,
    subtotal,
    total,
    discountAmount,
    shippingCost,
    isEmpty,
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,
    isInCart,
    isItemInCart,
    getItemQuantity,
    refreshCart,
  };

  return (
    <CustomerCartContext.Provider value={value}>
      {children}
    </CustomerCartContext.Provider>
  );
};

export const useCustomerCart = () => {
  const context = useContext(CustomerCartContext);
  if (!context) {
    throw new Error("useCustomerCart must be used within CustomerCartProvider");
  }
  return context;
};

export default CustomerCartContext;
