// src/modules/customer/components/cart/CartSummary.jsx

import React, { useState } from 'react';

/**
 * @component CartSummary
 * @description Resumen premium del carrito con sistema de cupones avanzado
 * 
 * Features:
 * - Diseño glassmorphism sticky
 * - Sistema de cupones con validación
 * - Animaciones de aplicación
 * - Desglose detallado de precios
 * - Botones CTA destacados
 * - Indicadores de envío gratis
 * - Progress bar de beneficios
 * - Responsive perfecto
 */
const CartSummary = ({
  subtotal,
  discountAmount,
  shippingCost,
  total,
  coupon,
  onApplyCoupon,
  onCheckout,
  onContinueShopping,
  isLoading,
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);

  // Free shipping threshold
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón');
      return;
    }

    setIsApplying(true);
    setCouponError('');

    try {
      await onApplyCoupon(couponCode);
      setCouponCode('');
      setShowCouponSuccess(true);
      setTimeout(() => setShowCouponSuccess(false), 3000);
    } catch (error) {
      setCouponError(error.message || 'Cupón inválido o expirado');
    } finally {
      setIsApplying(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden sticky top-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold">Resumen</h2>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
        <p className="text-blue-100 text-sm">
          Revisa tu orden antes de continuar
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Free Shipping Progress */}
        {remainingForFreeShipping > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <p className="text-sm font-semibold text-blue-900">
                {remainingForFreeShipping > 0 
                  ? `¡Agrega $${remainingForFreeShipping.toFixed(2)} más para envío gratis!` 
                  : '¡Tienes envío gratis! 🎉'}
              </p>
            </div>
            <div className="relative w-full h-2 bg-blue-200 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Section */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Cupón de Descuento
          </label>
          
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value.toUpperCase());
                  setCouponError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="WELCOME10"
                disabled={isApplying || coupon}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all text-center font-mono font-bold tracking-wider"
              />
              {couponCode && !coupon && (
                <button
                  onClick={() => setCouponCode('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            <button
              onClick={handleApplyCoupon}
              disabled={isApplying || !couponCode.trim() || coupon}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isApplying ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>...</span>
                </div>
              ) : (
                'Aplicar'
              )}
            </button>
          </div>
          
          {/* Coupon Error */}
          {couponError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-shake">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 text-sm font-medium">{couponError}</p>
            </div>
          )}
          
          {/* Coupon Success */}
          {coupon && (
            <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg animate-scale-in">
              <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-green-800 text-sm font-bold">¡Cupón aplicado!</p>
                <p className="text-green-700 text-xs mt-0.5">Código: {coupon.code}</p>
              </div>
            </div>
          )}

          {/* Coupon Suggestions */}
          {!coupon && !couponError && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCouponCode('WELCOME10')}
                className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1.5 rounded-full font-semibold hover:from-blue-200 hover:to-indigo-200 transition-all"
              >
                WELCOME10
              </button>
              <button
                onClick={() => setCouponCode('SAVE20')}
                className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full font-semibold hover:from-purple-200 hover:to-pink-200 transition-all"
              >
                SAVE20
              </button>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 border-t border-gray-200 pt-6">
          <div className="flex justify-between text-gray-700">
            <span className="font-medium">Subtotal</span>
            <span className="font-bold">${subtotal.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600 animate-slide-in">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Descuento</span>
              </div>
              <span className="font-bold">-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between text-gray-700">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <span className="font-medium">Envío</span>
            </div>
            <span className="font-bold">
              {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : (
                <span className="text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Gratis
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center text-2xl font-bold pt-4 border-t-2 border-gray-200">
            <span className="text-gray-900">Total</span>
            <div className="text-right">
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${total.toFixed(2)}
              </span>
              {discountAmount > 0 && (
                <p className="text-xs text-gray-500 font-normal mt-1">
                  Ahorras ${discountAmount.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={onCheckout}
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  Procesando...
                </>
              ) : (
                <>
                  Proceder al Pago
                  <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-700 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </button>

          <button
            onClick={onContinueShopping}
            className="w-full bg-white border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continuar Comprando
          </button>
        </div>

        {/* Security Badges */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Compra Segura</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
              <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
            </svg>
            <span className="font-medium">Envío Rápido</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;