// src/modules/products/hooks/useProductCart.js
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../core/hooks/useAuth';
import { useCartActions } from '../../cart/hooks/useCartActions';
import { useCart } from '../../cart/hooks/useCart';
import { isProductAvailable } from '../utils/productHelpers';

/**
 * @hook useProductCart
 * @description Hook especializado para manejar Cart desde el módulo Products
 * 
 * FUNCIONALIDADES:
 * ✅ Agregar producto con validaciones
 * ✅ Verificar si producto está en carrito
 * ✅ Obtener cantidad de producto en carrito
 * ✅ Actualizar cantidad
 * ✅ Remover producto
 * ✅ Validaciones de auth y disponibilidad
 * ✅ Loading states
 * ✅ Error handling con toasts
 * 
 * @returns {Object} Funciones y estados del cart para productos
 */
export const useProductCart = () => {
  const { isAuthenticated } = useAuth();
  const { items, loading: cartStateLoading } = useCart();

  // Cart Actions con callbacks personalizados
  const {
    addToCart: addToCartAction,
    updateQuantity: updateQuantityAction,
    removeFromCart: removeFromCartAction,
    loading: cartActionLoading,
  } = useCartActions(
    (message) => toast.success(message),
    (error) => toast.error(error)
  );

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const loading = cartStateLoading || cartActionLoading;

  /**
   * Verifica si un producto está en el carrito
   */
  const isProductInCart = useCallback(
    (productId) => {
      if (!items || items.length === 0) return false;
      return items.some((item) => item.product?._id === productId);
    },
    [items]
  );

  /**
   * Obtiene la cantidad de un producto en el carrito
   */
  const getProductQuantity = useCallback(
    (productId) => {
      if (!items || items.length === 0) return 0;
      const item = items.find((item) => item.product?._id === productId);
      return item?.quantity || 0;
    },
    [items]
  );

  /**
   * Obtiene el item completo del carrito para un producto
   */
  const getCartItem = useCallback(
    (productId) => {
      if (!items || items.length === 0) return null;
      return items.find((item) => item.product?._id === productId) || null;
    },
    [items]
  );

  // ============================================================================
  // ACCIONES
  // ============================================================================

  /**
   * Agregar producto al carrito con validaciones
   * @param {Object} product - Producto completo
   * @param {number} quantity - Cantidad a agregar
   * @param {Object} attributes - Atributos opcionales (size, color, etc)
   */
  const addProductToCart = useCallback(
    async (product, quantity = 1, attributes = {}) => {
    
      // Validación: Producto disponible
      if (!isProductAvailable(product)) {
        toast.error('Producto no disponible');
        return false;
      }

      // Validación: Stock suficiente
      if (product.trackQuantity && quantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`);
        return false;
      }

      try {
        await addToCartAction({
          productId: product._id,
          quantity,
          attributes,
        });
        return true;
      } catch (error) {
        console.error('[useProductCart] Error adding to cart:', error);
        return false;
      }
    },
    [isAuthenticated, addToCartAction]
  );

  /**
   * Actualizar cantidad de producto en carrito
   * @param {string} productId - ID del producto
   * @param {number} newQuantity - Nueva cantidad
   * @param {Object} attributes - Atributos del item
   */
  const updateProductQuantity = useCallback(
    async (productId, newQuantity, attributes = {}) => {
      if (newQuantity < 1) {
        toast.error('La cantidad debe ser mayor a 0');
        return false;
      }

      try {
        await updateQuantityAction(productId, newQuantity, attributes);
        return true;
      } catch (error) {
        console.error('[useProductCart] Error updating quantity:', error);
        return false;
      }
    },
    [updateQuantityAction]
  );

  /**
   * Remover producto del carrito
   * @param {string} productId - ID del producto
   * @param {Object} attributes - Atributos del item
   */
  const removeProductFromCart = useCallback(
    async (productId, attributes = {}) => {
      try {
        await removeFromCartAction(productId, attributes);
        return true;
      } catch (error) {
        console.error('[useProductCart] Error removing from cart:', error);
        return false;
      }
    },
    [removeFromCartAction]
  );

  /**
   * Incrementar cantidad de producto
   * @param {Object} product - Producto completo
   */
  const incrementQuantity = useCallback(
    async (product) => {
      const currentQuantity = getProductQuantity(product._id);
      const newQuantity = currentQuantity + 1;

      // Validar stock
      if (product.trackQuantity && newQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`);
        return false;
      }

      return updateProductQuantity(product._id, newQuantity);
    },
    [getProductQuantity, updateProductQuantity]
  );

  /**
   * Decrementar cantidad de producto
   * @param {string} productId - ID del producto
   */
  const decrementQuantity = useCallback(
    async (productId) => {
      const currentQuantity = getProductQuantity(productId);

      if (currentQuantity <= 1) {
        // Si es 1, remover en lugar de decrementar
        return removeProductFromCart(productId);
      }

      return updateProductQuantity(productId, currentQuantity - 1);
    },
    [getProductQuantity, updateProductQuantity, removeProductFromCart]
  );

  /**
   * Agregar rápido (1 unidad) con validaciones automáticas
   * @param {Object} product - Producto completo
   */
  const quickAddToCart = useCallback(
    async (product) => {
      // Si ya está en carrito, incrementar
      if (isProductInCart(product._id)) {
        return incrementQuantity(product);
      }

      // Si no está, agregar
      return addProductToCart(product, 1);
    },
    [isProductInCart, incrementQuantity, addProductToCart]
  );

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estados
    loading,
    isAuthenticated,

    // Verificadores
    isProductInCart,
    getProductQuantity,
    getCartItem,

    // Acciones principales
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    quickAddToCart,

    // Acciones auxiliares
    incrementQuantity,
    decrementQuantity,
  };
};

export default useProductCart;