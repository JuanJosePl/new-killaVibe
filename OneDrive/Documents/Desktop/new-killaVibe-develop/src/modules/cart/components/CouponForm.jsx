import React, { useState } from 'react';
import { CART_LIMITS } from '../types/cart.types';

/**
 * @component CouponForm
 * @description Formulario para aplicar cupones de descuento
 * 
 * PROPS:
 * @param {Function} onApply - Callback al aplicar cupón
 * @param {Object} appliedCoupon - Cupón aplicado actualmente
 * @param {boolean} loading - Estado de carga
 * @param {string} error - Mensaje de error
 */
const CouponForm = ({
  onApply,
  appliedCoupon = null,
  loading = false,
  error = null
}) => {
  const [code, setCode] = useState('');
  const [showForm, setShowForm] = useState(!appliedCoupon);

  const hasCoupon = !!appliedCoupon;

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!code.trim()) {
      return;
    }

    if (code.length > CART_LIMITS.MAX_COUPON_LENGTH) {
      return;
    }

    await onApply(code.trim().toUpperCase());
    setCode('');
  };

  const handleToggle = () => {
    setShowForm(!showForm);
    setCode('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 className="font-semibold text-gray-900">
            Cupón de Descuento
          </h3>
        </div>

        {hasCoupon && (
          <button
            onClick={handleToggle}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            {showForm ? 'Ocultar' : 'Cambiar'}
          </button>
        )}
      </div>

      {/* Cupón Aplicado */}
      {hasCoupon && !showForm && (
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800">
                {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-600">
                {appliedCoupon.type === 'percentage' && `${appliedCoupon.discount}% de descuento`}
                {appliedCoupon.type === 'fixed' && `$${appliedCoupon.discount} de descuento`}
                {appliedCoupon.type === 'shipping' && 'Envío gratis'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa tu cupón"
              disabled={loading}
              maxLength={CART_LIMITS.MAX_COUPON_LENGTH}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
            />

            <button
              onClick={handleSubmit}
              disabled={loading || !code.trim()}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Aplicar'
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Los cupones se aplican automáticamente al total
          </p>
        </div>
      )}

      {/* Cupones Populares (Opcional) */}
      {!hasCoupon && showForm && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">
            Cupones disponibles:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCode('WELCOME10')}
              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"
            >
              WELCOME10
            </button>
            <button
              onClick={() => setCode('SAVE20')}
              className="px-3 py-1 text-xs font-medium text-green-600 bg-green-50 rounded-full hover:bg-green-100 transition-colors"
            >
              SAVE20
            </button>
            <button
              onClick={() => setCode('SHIP50')}
              className="px-3 py-1 text-xs font-medium text-purple-600 bg-purple-50 rounded-full hover:bg-purple-100 transition-colors"
            >
              SHIP50
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponForm;