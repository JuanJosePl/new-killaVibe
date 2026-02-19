/**
 * @hook useProductCart
 * @description Bridge de integración entre el dominio Products y el dominio Cart.
 *
 * CAPA: integration/ (no es parte del core de Products)
 *
 * RESPONSABILIDAD:
 * - Adaptar la interfaz del dominio Cart al lenguaje del dominio Products.
 * - Aplicar validaciones de dominio (product.availability) antes de agregar al carrito.
 * - Gestionar toasts de error/éxito.
 *
 * REGLA: Solo este archivo conoce ambos dominios.
 * El resto del módulo Products NO importa de modules/cart/.
 *
 * CONTRATO: useCartActions.addToCart acepta el objeto producto completo.
 * useCartActions detecta presencia de `_id` para identificarlo como objeto completo.
 */

import { useCallback } from 'react';
import { toast } from 'react-toastify';

// Dominio Products
import {
  canPurchase,
  canAddQuantity,
  getRemainingStock,
} from '../domain/product.availability';
import { AVAILABILITY_MESSAGES, AVAILABILITY_STATUS } from '../types/product.types';

// Dominio Cart (ya migrado)
import { useCartActions } from '../../cart/hooks/useCartActions';
import { useCart } from '../../cart/hooks/useCart';
import { useAuth } from '../../../core/hooks/useAuth';

// ─────────────────────────────────────────────
// HELPERS INTERNOS
// ─────────────────────────────────────────────

/**
 * Obtiene el ID de un item del carrito de forma robusta.
 * Cubre formatos guest (productId) y auth (product._id / product.id).
 */
const getCartItemId = (item) =>
  item?.product?._id ?? item?.product?.id ?? item?.productId ?? null;

// ─────────────────────────────────────────────
// HOOK PRINCIPAL
// ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  // VERIFICADORES
  // ─────────────────────────────────────────────

  const isProductInCart = useCallback(
    (productId) => {
      if (!productId || !items?.length) return false;
      return items.some((item) => getCartItemId(item) === productId);
    },
    [items]
  );

  const getProductQuantity = useCallback(
    (productId) => {
      if (!productId || !items?.length) return 0;
      const item = items.find((item) => getCartItemId(item) === productId);
      return item ? Number(item.quantity) || 0 : 0;
    },
    [items]
  );

  const getCartItem = useCallback(
    (productId) => {
      if (!productId || !items?.length) return null;
      return items.find((item) => getCartItemId(item) === productId) ?? null;
    },
    [items]
  );

  // ─────────────────────────────────────────────
  // ACCIONES PRINCIPALES
  // ─────────────────────────────────────────────

  /**
   * Agrega un producto al carrito con validaciones de dominio.
   *
   * @param {import('../domain/product.entity').Product} product
   * @param {number} [quantity=1]
   * @param {Object} [attributes={}]
   * @returns {Promise<boolean>}
   */
  const addProductToCart = useCallback(
    async (product, quantity = 1, attributes = {}) => {
      // Validación: producto comprable
      if (!canPurchase(product)) {
        toast.error('Producto no disponible');
        return false;
      }

      // Validación: stock suficiente considerando lo que ya está en el carrito
      const currentQty = getProductQuantity(product._id);
      const stockCheck = canAddQuantity(product, quantity, currentQty);

      if (!stockCheck.allowed) {
        if (stockCheck.reason === 'STOCK_EXCEEDED') {
          if (stockCheck.remaining <= 0) {
            toast.error(
              `Ya tienes todas las unidades disponibles (${product.stock}) en el carrito`
            );
          } else {
            toast.error(
              `Solo puedes agregar ${stockCheck.remaining} unidad${stockCheck.remaining !== 1 ? 'es' : ''} más`
            );
          }
        } else {
          toast.error('Producto no disponible');
        }
        return false;
      }

      try {
        // Pasar objeto completo con atributos inyectados.
        // useCartActions detecta `_id` y lo trata como objeto completo.
        await addToCartAction({ ...product, attributes }, quantity);
        return true;
      } catch (error) {
        console.error('[useProductCart] Error adding to cart:', error);
        return false;
      }
    },
    [addToCartAction, getProductQuantity]
  );

  /**
   * Actualiza la cantidad de un producto en el carrito.
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

  // ─────────────────────────────────────────────
  // ACCIONES AUXILIARES
  // ─────────────────────────────────────────────

  /**
   * Incrementa en 1. Valida stock antes.
   */
  const incrementQuantity = useCallback(
    async (product) => {
      const currentQty = getProductQuantity(product._id);
      const stockCheck = canAddQuantity(product, 1, currentQty);

      if (!stockCheck.allowed) {
        toast.error(`Solo hay ${product.stock} unidades disponibles`);
        return false;
      }

      return updateProductQuantity(product._id, currentQty + 1);
    },
    [getProductQuantity, updateProductQuantity]
  );

  /**
   * Decrementa en 1. Si llega a 0, elimina el item.
   */
  const decrementQuantity = useCallback(
    async (productId) => {
      const currentQty = getProductQuantity(productId);
      if (currentQty <= 1) {
        return removeProductFromCart(productId);
      }
      return updateProductQuantity(productId, currentQty - 1);
    },
    [getProductQuantity, updateProductQuantity, removeProductFromCart]
  );

  /**
   * Agrega rápido desde cards.
   * - Si ya está en carrito → incrementa
   * - Si no → agrega con cantidad 1
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

  return {
    loading,
    isAuthenticated,

    // Verificadores
    isProductInCart,
    getProductQuantity,
    getCartItem,

    // Acciones
    addProductToCart,
    updateProductQuantity,
    removeProductFromCart,
    quickAddToCart,
    incrementQuantity,
    decrementQuantity,
  };
};

export default useProductCart;