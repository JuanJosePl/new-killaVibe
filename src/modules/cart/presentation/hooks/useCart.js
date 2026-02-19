/**
 * @hook useCart
 * @description Hook de solo lectura para el módulo Cart.
 *
 * Expone:
 * - Estado del carrito
 * - Valores derivados (summary, isEmpty, hasCoupon, etc.)
 * - Selectores granulares (isItemLoading, isProductInCart)
 *
 * NO expone ninguna acción de escritura.
 * NO accede al store directamente — usa selectores atómicos.
 */

import { useMemo } from 'react';
import { useCartStore, cartSelectors } from '../store/cart.store';
import {
  generateCartSummary,
  CartMode,
  CartSyncStatus,
} from '../../domain/cart.model';
import {
  isCartEmpty,
  hasCouponApplied,
  qualifiesForFreeShipping,
  amountForFreeShipping,
  isProductInCart,
  findCartItem,
  hasLowStockItems,
  hasOutOfStockItems,
} from '../../domain/cart.rules';

const useCart = () => {
  // ── ESTADO ATÓMICO DEL STORE ──────────────────────────────────────────────
  const items          = useCartStore(cartSelectors.items);
  const itemCount      = useCartStore(cartSelectors.itemCount);
  const subtotal       = useCartStore(cartSelectors.subtotal);
  const total          = useCartStore(cartSelectors.total);
  const discount       = useCartStore(cartSelectors.discount);
  const shipping       = useCartStore(cartSelectors.shipping);
  const shippingCost   = useCartStore(cartSelectors.shippingCost);
  const tax            = useCartStore(cartSelectors.tax);
  const coupon         = useCartStore(cartSelectors.coupon);
  const shippingMethod = useCartStore(cartSelectors.shippingMethod);
  const shippingAddress = useCartStore(cartSelectors.shippingAddress);
  const loadingGlobal  = useCartStore(cartSelectors.loadingGlobal);
  const loadingItems   = useCartStore(cartSelectors.loadingItems);
  const error          = useCartStore(cartSelectors.error);
  const initialized    = useCartStore(cartSelectors.initialized);
  const mode           = useCartStore(cartSelectors.mode);
  const syncStatus     = useCartStore(cartSelectors.syncStatus);

  // ── VALORES DERIVADOS (memoizados) ────────────────────────────────────────

  const cart = useCartStore(s => s.cart);

  const summary = useMemo(
    () => generateCartSummary(cart),
    [cart]
  );

  const isEmpty = useMemo(() => isCartEmpty(cart), [items]);

  const hasCoupon = useMemo(() => hasCouponApplied(cart), [coupon]);

  const freeShippingInfo = useMemo(() => ({
    qualifies:  qualifiesForFreeShipping(subtotal),
    remaining:  amountForFreeShipping(subtotal),
  }), [subtotal]);

  const shippingInfo = useMemo(() => ({
    address: shippingAddress,
    method:  shippingMethod,
    cost:    shippingCost,
  }), [shippingAddress, shippingMethod, shippingCost]);

  const hasLowStock  = useMemo(() => hasLowStockItems(items),  [items]);
  const hasOutOfStock = useMemo(() => hasOutOfStockItems(items), [items]);

  const isAuthenticated = mode === CartMode.AUTHENTICATED;
  const isSyncing       = syncStatus === CartSyncStatus.IN_PROGRESS;

  // ── FUNCIONES DE LECTURA COMPUTADA ─────────────────────────────────────────

  /**
   * ¿El producto está en el carrito?
   * Cálculo local — sin llamada al backend.
   *
   * @param {string} productId
   * @param {Object} [attributes]
   */
  const isInCart = (productId, attributes = {}) =>
    isProductInCart(items, productId, attributes);

  /**
   * Cantidad de un producto específico en el carrito.
   *
   * @param {string} productId
   * @param {Object} [attributes]
   */
  const getProductQuantity = (productId, attributes = {}) => {
    const item = findCartItem(items, productId, attributes);
    return item ? item.quantity : 0;
  };

  /**
   * ¿Está cargando un item específico?
   * Muestra spinner individual sin bloquear la lista.
   *
   * @param {string} productId
   */
  const isItemLoading = (productId) =>
    loadingItems instanceof Set ? loadingItems.has(productId) : false;

  // ── RETURN ────────────────────────────────────────────────────────────────

  return {
    // Estado raw
    cart,
    items,
    loading: {
      global: loadingGlobal,
      items:  loadingItems,
    },
    error,
    initialized,
    mode,
    syncStatus,

    // Valores derivados
    summary,
    isEmpty,
    itemCount,
    subtotal,
    total,
    discount,
    shipping,
    tax,
    coupon,
    hasCoupon,
    shippingInfo,
    freeShippingInfo,
    hasLowStock,
    hasOutOfStock,
    isAuthenticated,
    isSyncing,

    // Funciones de lectura local
    isInCart,
    getProductQuantity,
    isItemLoading,
  };
};

export default useCart;