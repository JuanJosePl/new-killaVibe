import { useCartContext } from '../context/CartContext';
import { 
  generateCartSummary, 
  isCartEmpty, 
  calculateItemCount,
  hasCouponApplied,
  qualifiesForFreeShipping,
  amountForFreeShipping
} from '../utils/cartHelpers';

/**
 * @hook useCart
 * @description Hook principal para acceder al carrito y sus datos calculados
 * 
 * CARACTERÍSTICAS:
 * - Acceso al estado del carrito
 * - Cálculos automáticos (totales, descuentos)
 * - Helpers de UI
 * - Estado de carga y errores
 * 
 * @returns {Object} Estado y métodos del carrito
 * 
 * @example
 * const {
 *   cart,
 *   loading,
 *   error,
 *   summary,
 *   isEmpty,
 *   itemCount,
 *   hasCoupon,
 *   freeShippingInfo
 * } = useCart();
 */
export const useCart = () => {
  const context = useCartContext();

  // ============================================================================
  // DATOS CALCULADOS
  // ============================================================================

  /**
   * Resumen completo del carrito
   * Incluye: subtotal, discount, shipping, tax, total, savings
   */
  const summary = context.cart ? generateCartSummary(context.cart) : null;

  /**
   * Verificar si carrito está vacío
   */
  const isEmpty = isCartEmpty(context.cart);

  /**
   * Cantidad total de items
   */
  const itemCount = context.cart ? calculateItemCount(context.cart.items) : 0;

  /**
   * Verificar si tiene cupón aplicado
   */
  const hasCoupon = hasCouponApplied(context.cart);

  /**
   * Información de envío gratis
   */
  const freeShippingInfo = {
    qualifies: context.cart ? qualifiesForFreeShipping(context.cart.subtotal) : false,
    remaining: context.cart ? amountForFreeShipping(context.cart.subtotal) : 0
  };

  /**
   * Items del carrito
   */
  const items = context.cart?.items || [];

  /**
   * Información de envío
   */
  const shippingInfo = {
    address: context.cart?.shippingAddress || null,
    method: context.cart?.shippingMethod || 'standard',
    cost: context.cart?.shippingCost || 0
  };

  /**
   * Información del cupón
   */
  const couponInfo = context.cart?.coupon || null;

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado completo
    cart: context.cart,
    loading: context.loading,
    error: context.error,
    initialized: context.initialized,

    // Datos calculados
    summary,
    isEmpty,
    itemCount,
    hasCoupon,
    freeShippingInfo,
    items,
    shippingInfo,
    couponInfo,

    // Métodos del contexto
    fetchCart: context.fetchCart,
    refreshCart: context.refreshCart,
    clearCache: context.clearCache,
    setError: context.setError
  };
};

export default useCart;