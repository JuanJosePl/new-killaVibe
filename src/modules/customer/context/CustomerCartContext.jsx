import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import customerCartApi from '../api/customerCart.api';

/**
 * @context CustomerCartContext
 * @description Estado global del carrito de compras
 * 
 * Responsabilidades:
 * - CRUD completo del carrito
 * - Gestión de cupones
 * - Dirección y método de envío
 * - Cálculos automáticos (subtotal, total, descuentos)
 * 
 * Contrato Backend:
 * - GET /api/cart
 * - POST /api/cart/items
 * - PUT /api/cart/items/:productId
 * - DELETE /api/cart/items/:productId
 * - DELETE /api/cart
 * - POST /api/cart/coupon
 * - PUT /api/cart/shipping-address
 * - PUT /api/cart/shipping-method
 */

const CustomerCartContext = createContext(null);

export const CustomerCartProvider = ({ children }) => {
  // Estado principal
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Inicializar carrito al montar
  useEffect(() => {
    if (!initialized) {
      loadCart();
      setInitialized(true);
    }
  }, [initialized]);

  /**
   * Cargar carrito del backend
   */
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerCartApi.getCart();
      setCart(data);
    } catch (err) {
      setError(err);
      console.error('Error loading cart:', err);
      
      // Si el error es 404, crear carrito vacío local
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

  /**
   * Agregar item al carrito
   * 
   * @param {string} productId - ID del producto
   * @param {number} quantity - Cantidad (default: 1)
   * @param {Object} attributes - Atributos opcionales (size, color, material)
   * @returns {Promise<Object>} Carrito actualizado
   * 
   * @throws {400} Stock insuficiente
   * @throws {404} Producto no encontrado
   */
  const addItem = useCallback(async (productId, quantity = 1, attributes = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.addToCart(productId, quantity, attributes);
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar cantidad de un item
   * 
   * @param {string} productId - ID del producto
   * @param {number} quantity - Nueva cantidad (min: 1)
   * @param {Object} attributes - Atributos para identificar variante
   * @returns {Promise<Object>} Carrito actualizado
   * 
   * @throws {400} Cantidad inválida o stock insuficiente
   */
  const updateItem = useCallback(async (productId, quantity, attributes = {}) => {
    if (quantity < 1) {
      throw new Error('La cantidad mínima es 1');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.updateCartItem(productId, quantity, attributes);
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error updating cart item:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar item del carrito
   * 
   * @param {string} productId - ID del producto
   * @param {Object} attributes - Atributos para identificar variante
   * @returns {Promise<Object>} Carrito actualizado
   */
  const removeItem = useCallback(async (productId, attributes = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.removeFromCart(productId, attributes);
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error removing from cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Vaciar carrito completo
   * 
   * @returns {Promise<Object>} Carrito vacío
   */
  const clearCart = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.clearCart();
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error clearing cart:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Aplicar cupón de descuento
   * 
   * Cupones disponibles (hardcoded en backend):
   * - WELCOME10: 10% descuento
   * - SAVE20: 20% descuento (min $50)
   * - SHIP50: 50% descuento en envío
   * 
   * @param {string} code - Código del cupón
   * @returns {Promise<Object>} Carrito con descuento aplicado
   * 
   * @throws {400} Cupón inválido o expirado
   */
  const applyCoupon = useCallback(async (code) => {
    if (!code || code.trim().length === 0) {
      throw new Error('El código de cupón es requerido');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.applyCoupon(code.toUpperCase());
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error applying coupon:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar dirección de envío
   * 
   * @param {Object} address - Dirección completa
   * @param {string} address.firstName - Nombre
   * @param {string} address.lastName - Apellido
   * @param {string} address.email - Email
   * @param {string} address.phone - Teléfono
   * @param {string} address.street - Calle
   * @param {string} address.city - Ciudad
   * @param {string} address.state - Estado/Departamento
   * @param {string} address.zipCode - Código postal
   * @param {string} address.country - País
   * @returns {Promise<Object>} Carrito actualizado
   */
  const updateShippingAddress = useCallback(async (address) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.updateShippingAddress(address);
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error updating shipping address:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar método de envío
   * 
   * @param {string} method - Método ('standard', 'express', 'overnight', 'pickup')
   * @param {number} cost - Costo del envío
   * @returns {Promise<Object>} Carrito actualizado
   */
  const updateShippingMethod = useCallback(async (method, cost) => {
    const validMethods = ['standard', 'express', 'overnight', 'pickup'];
    if (!validMethods.includes(method)) {
      throw new Error('Método de envío inválido');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const data = await customerCartApi.updateShippingMethod(method, cost);
      setCart(data);
      
      return data;
    } catch (err) {
      setError(err);
      console.error('Error updating shipping method:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Verificar si un producto está en el carrito
   * 
   * @param {string} productId - ID del producto
   * @returns {boolean}
   */
  const isInCart = useCallback((productId) => {
    if (!cart || !cart.items) return false;
    return cart.items.some(item => item.product?._id === productId || item.product === productId);
  }, [cart]);

  /**
   * Obtener cantidad de un producto en el carrito
   * 
   * @param {string} productId - ID del producto
   * @returns {number}
   */
  const getItemQuantity = useCallback((productId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find(item => 
      item.product?._id === productId || item.product === productId
    );
    return item?.quantity || 0;
  }, [cart]);

  /**
   * Recargar carrito (útil después de cambios externos)
   */
  const refreshCart = useCallback(() => {
    return loadCart();
  }, [loadCart]);

  // Valores computados
  const itemCount = cart?.itemCount || 0;
  const subtotal = cart?.subtotal || 0;
  const total = cart?.total || 0;
  const discountAmount = cart?.discountAmount || 0;
  const shippingCost = cart?.shippingCost || 0;
  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  const value = {
    // Estado
    cart,
    isLoading,
    error,
    initialized,
    
    // Valores computados
    itemCount,
    subtotal,
    total,
    discountAmount,
    shippingCost,
    isEmpty,
    
    // Métodos
    loadCart,
    addItem,
    updateItem,
    removeItem,
    clearCart,
    applyCoupon,
    updateShippingAddress,
    updateShippingMethod,
    isInCart,
    getItemQuantity,
    refreshCart,
  };

  return (
    <CustomerCartContext.Provider value={value}>
      {children}
    </CustomerCartContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerCart = () => {
  const context = useContext(CustomerCartContext);
  if (!context) {
    throw new Error('useCustomerCart must be used within CustomerCartProvider');
  }
  return context;
};

export default CustomerCartContext;