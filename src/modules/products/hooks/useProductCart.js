// src/modules/products/hooks/useProductCart.js
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../../core/hooks/useAuth';
import { useCartActions } from '../../cart/hooks/useCartActions';
import { useCart } from '../../cart/hooks/useCart';
import { isProductAvailable } from '../utils/productHelpers';

/**
 * @hook useProductCart
 * @description Puente entre el módulo Products y el sistema Cart.
 *
 * CONTRATO CON useCartActions (post-fix):
 * - addToCart(productObject, quantity) → acepta objeto producto completo
 * - addToCart({ productId, quantity, attributes }) → acepta payload directo
 *
 * Este hook usa la forma directa { productId, quantity, attributes }
 * porque useCartActions.addToCart la reconoce por la presencia de `productId`.
 * El objeto producto completo se pasa en paralelo para que CartContext
 * pueda construir el item en modo guest correctamente.
 *
 * SOLUCIÓN DEFINITIVA:
 * Se pasa el producto completo a addToCartAction en lugar del payload reducido.
 * useCartActions normaliza internamente y extrae productId cuando necesita la API.
 * Esto garantiza que en modo guest el item tenga name, price, images, slug, etc.
 */
export const useProductCart = () => {
  const { isAuthenticated } = useAuth();
  const { items, loading: cartStateLoading } = useCart();

  const {
    addToCart: addToCartAction,
    updateQuantity: updateQuantityAction,
    removeFromCart: removeFromCartAction,
    loading: cartActionLoading,
  } = useCartActions(
    (message) => toast.success(message),
    (error) => toast.error(error)
  );

  const loading = cartStateLoading || cartActionLoading;

  // ============================================================================
  // VERIFICADORES
  // ============================================================================

  /**
   * Verifica si un producto está en el carrito.
   * ✅ FIX: cubre _id, id y productId para compatibilidad guest/auth.
   */
  const isProductInCart = useCallback(
    (productId) => {
      if (!productId || !items?.length) return false;
      return items.some((item) => {
        const itemId =
          item.product?._id ||
          item.product?.id ||
          item.productId;
        return itemId === productId;
      });
    },
    [items]
  );

  /**
   * Obtiene la cantidad actual de un producto en el carrito.
   * ✅ FIX: misma normalización de ID que isProductInCart.
   */
  const getProductQuantity = useCallback(
    (productId) => {
      if (!productId || !items?.length) return 0;
      const item = items.find((item) => {
        const itemId =
          item.product?._id ||
          item.product?.id ||
          item.productId;
        return itemId === productId;
      });
      return item ? Number(item.quantity) || 0 : 0;
    },
    [items]
  );

  /**
   * Obtiene el item completo del carrito para un producto.
   * ✅ FIX: misma normalización de ID.
   */
  const getCartItem = useCallback(
    (productId) => {
      if (!productId || !items?.length) return null;
      return (
        items.find((item) => {
          const itemId =
            item.product?._id ||
            item.product?.id ||
            item.productId;
          return itemId === productId;
        }) || null
      );
    },
    [items]
  );

  // ============================================================================
  // ACCIONES
  // ============================================================================

  /**
   * Agrega un producto al carrito.
   *
   * ✅ FIX PRINCIPAL: pasa el objeto `product` completo a addToCartAction,
   * no un payload reducido { productId, quantity, attributes }.
   *
   * Razón: useCartActions.addToCart detecta objeto completo por presencia
   * de `_id` y lo pasa íntegro a CartContext.addItem, que lo necesita
   * completo para construir el item en modo guest (name, price, images...).
   *
   * Los atributos se inyectan en el objeto producto antes de pasarlo,
   * para que CartContext los lea desde productData.attributes.
   *
   * @param {Object} product   - Objeto producto completo del catálogo
   * @param {number} quantity  - Cantidad a agregar (default: 1)
   * @param {Object} attributes - Atributos opcionales { size, color, ... }
   */
  const addProductToCart = useCallback(
    async (product, quantity = 1, attributes = {}) => {
      // Validación: producto disponible
      if (!isProductAvailable(product)) {
        toast.error('Producto no disponible');
        return false;
      }

      // Validación: stock suficiente para la cantidad solicitada
      if (product.trackQuantity) {
        const currentQty = getProductQuantity(product._id);
        const totalQty = currentQty + quantity;

        if (totalQty > product.stock) {
          const remaining = product.stock - currentQty;
          if (remaining <= 0) {
            toast.error(`Solo hay ${product.stock} unidades disponibles y ya las tienes en el carrito`);
          } else {
            toast.error(`Solo puedes agregar ${remaining} unidad${remaining !== 1 ? 'es' : ''} más`);
          }
          return false;
        }
      }

      try {
        // ✅ Pasar objeto completo con atributos inyectados
        // useCartActions reconoce objeto completo por presencia de `_id`
        const productWithAttributes = {
          ...product,
          attributes,
        };

        await addToCartAction(productWithAttributes, quantity);
        return true;
      } catch (error) {
        // El error ya fue notificado por useCartActions (onError callback)
        console.error('[useProductCart] Error adding to cart:', error);
        return false;
      }
    },
    [addToCartAction, getProductQuantity]
  );

  /**
   * Actualiza la cantidad de un producto en el carrito.
   * @param {string} productId
   * @param {number} newQuantity
   * @param {Object} attributes
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
   * Elimina un producto del carrito.
   * @param {string} productId
   * @param {Object} attributes
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
   * Incrementa en 1 la cantidad de un producto ya en el carrito.
   * Valida stock antes de incrementar.
   * @param {Object} product - Objeto producto completo
   */
  const incrementQuantity = useCallback(
    async (product) => {
      const currentQuantity = getProductQuantity(product._id);
      const newQuantity = currentQuantity + 1;

      if (product.trackQuantity && newQuantity > product.stock) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`);
        return false;
      }

      return updateProductQuantity(product._id, newQuantity);
    },
    [getProductQuantity, updateProductQuantity]
  );

  /**
   * Decrementa en 1 la cantidad. Si llega a 0, elimina el item.
   * @param {string} productId
   */
  const decrementQuantity = useCallback(
    async (productId) => {
      const currentQuantity = getProductQuantity(productId);

      if (currentQuantity <= 1) {
        return removeProductFromCart(productId);
      }

      return updateProductQuantity(productId, currentQuantity - 1);
    },
    [getProductQuantity, updateProductQuantity, removeProductFromCart]
  );

  /**
   * Agrega rápido desde cards de producto.
   * - Si ya está en carrito → incrementa cantidad (vía updateProductQuantity,
   *   no addProductToCart, para evitar duplicar la validación de stock acumulado)
   * - Si no está → agrega con addProductToCart
   *
   * @param {Object} product - Objeto producto completo
   */
  const quickAddToCart = useCallback(
    async (product) => {
      if (isProductInCart(product._id)) {
        return incrementQuantity(product);
      }
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