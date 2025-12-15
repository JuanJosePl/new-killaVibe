import React from 'react';
import { formatPrice, formatDiscount } from '../utils/cartHelpers';
import { CART_THRESHOLDS } from '../types/cart.types';

/**
 * @component CartSummary
 * @description Resumen visual de totales del carrito
 * 
 * PROPS:
 * @param {Object} summary - Objeto con totales calculados
 * @param {Object} cart - Carrito completo
 * @param {Function} onCheckout - Callback para proceder al checkout
 * @param {boolean} loading - Estado de carga
 * @param {boolean} showCheckoutButton - Mostrar botón de checkout
 */
const CartSummary = ({
  summary,
  cart,
  onCheckout,
  loading = false,
  showCheckoutButton = true
}) => {
  if (!summary) {
    return null;
  }

  const hasCoupon = cart?.coupon?.code;
  const hasShippingDiscount = summary.shippingDiscount > 0;
  const freeShippingRemaining = CART_THRESHOLDS.MIN_FREE_SHIPPING - summary.subtotal;
  const qualifiesForFreeShipping = freeShippingRemaining <= 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Resumen del Pedido
      </h2>

      {/* Subtotal */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-gray-700">
          <span>Subtotal ({summary.itemCount} items)</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>

        {/* Descuento por Cupón */}
        {hasCoupon && summary.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span className="flex items-center gap-2">
              Descuento
              <span className="text-xs bg-green-50 px-2 py-1 rounded font-medium">
                {cart.coupon.code}
              </span>
            </span>
            <span className="font-medium">
              {formatDiscount(cart.coupon)}
            </span>
          </div>
        )}

        {/* Envío */}
        <div className="flex justify-between text-gray-700">
          <span>Envío</span>
          {hasShippingDiscount ? (
            <div className="text-right">
              <span className="line-through text-gray-400 text-sm mr-2">
                {formatPrice(cart.shippingCost)}
              </span>
              <span className="font-medium text-green-600">
                {formatPrice(summary.shipping)}
              </span>
            </div>
          ) : summary.shipping === 0 ? (
            <span className="font-medium text-green-600">GRATIS</span>
          ) : (
            <span className="font-medium">{formatPrice(summary.shipping)}</span>
          )}
        </div>

        {/* Impuestos */}
        {summary.tax > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Impuestos ({cart.taxRate}%)</span>
            <span className="font-medium">{formatPrice(summary.tax)}</span>
          </div>
        )}
      </div>

      {/* Free Shipping Progress */}
      {!qualifiesForFreeShipping && freeShippingRemaining > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            ¡Agrega {formatPrice(freeShippingRemaining)} más para envío gratis!
          </p>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min(100, (summary.subtotal / CART_THRESHOLDS.MIN_FREE_SHIPPING) * 100)}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Total Savings */}
      {summary.savings > 0 && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-800 font-medium">
              Total en Ahorros
            </span>
            <span className="text-lg font-bold text-green-600">
              {formatPrice(summary.savings)}
            </span>
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-200 my-4"></div>

      {/* Total */}
      <div className="flex justify-between items-center mb-6">
        <span className="text-xl font-bold text-gray-900">Total</span>
        <span className="text-2xl font-bold text-gray-900">
          {formatPrice(summary.total)}
        </span>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <button
          onClick={onCheckout}
          disabled={loading || summary.itemCount === 0}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </span>
          ) : (
            'Proceder al Pago'
          )}
        </button>
      )}

      {/* Info Adicional */}
      <div className="mt-4 space-y-2 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Compra 100% segura</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <span>Múltiples métodos de pago</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>30 días para devoluciones</span>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;