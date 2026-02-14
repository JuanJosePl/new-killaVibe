// src/modules/customer/pages/CustomerCartPage.jsx - VERSIÓN FINAL COMPLETA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerCart } from '../context/CustomerCartContext';
import { useCustomerActivity } from '../context/CustomerActivityContext';
import { useCartOperations } from '../hooks/useCartOperations';
import { CartItemCard, CartSummary, EmptyCart } from '../components/cart';
import { ConfirmDialog, LoadingSpinner } from '../components/common';

/**
 * @page CustomerCartPage
 * @description Página premium del carrito de compras con UX extraordinaria
 * 
 * Features Premium:
 * ✅ Gestión completa de items con loading granular
 * ✅ Sistema de cupones avanzado con validación
 * ✅ Cálculos automáticos en tiempo real
 * ✅ Animaciones fluidas y microinteracciones
 * ✅ Progress bar de checkout visual
 * ✅ Diseño 100% responsive con glassmorphism
 * ✅ Trust badges y garantías
 * ✅ Notificaciones toast elegantes
 * ✅ Confirmaciones de acciones críticas
 * ✅ Tracking de eventos para analytics
 * ✅ Recomendaciones contextuales
 * ✅ Testimoniales sociales
 */
const CustomerCartPage = () => {
  const navigate = useNavigate();
  
  // Custom hook con operaciones optimizadas
  const {
    handleUpdateQuantity,
    handleRemoveItem,
    handleClearCart,
    handleApplyCoupon,
    isItemLoading,
    isClearingCart,
    isApplyingCoupon,
    cart,
  } = useCartOperations();

  const { 
    itemCount, 
    subtotal, 
    total, 
    discountAmount, 
    shippingCost, 
    isEmpty,
    isLoading: isCartLoading 
  } = useCustomerCart();

  const { trackPageView, trackCheckoutStarted } = useCustomerActivity();

  // Estados locales
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  // Track page view on mount
  useEffect(() => {
    trackPageView('Cart');
  }, [trackPageView]);

  // Show recommendations after 5 seconds
  useEffect(() => {
    if (!isEmpty) {
      const timer = setTimeout(() => setShowRecommendations(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isEmpty]);

  /**
   * Actualizar cantidad de un item
   */
  const onUpdateQuantity = async (productId, newQuantity, attributes) => {
    const result = await handleUpdateQuantity(productId, newQuantity, attributes);
    
    if (!result.success) {
      showNotification(result.error, 'error');
    } else {
      showNotification('✓ Cantidad actualizada', 'success');
    }
  };

  /**
   * Eliminar item del carrito
   */
  const onRemoveItem = async (productId, attributes) => {
    const result = await handleRemoveItem(productId, attributes);
    
    if (result.success) {
      showNotification('✅ Producto eliminado del carrito', 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  /**
   * Vaciar carrito completo
   */
  const onClearCart = async () => {
    const result = await handleClearCart();
    
    if (result.success) {
      setShowClearConfirm(false);
      showNotification('🗑️ Carrito vaciado exitosamente', 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  /**
   * Aplicar cupón de descuento
   */
  const onApplyCoupon = async (code) => {
    const result = await handleApplyCoupon(code);
    
    if (result.success) {
      showNotification('🎉 Cupón aplicado correctamente', 'success');
    } else {
      throw new Error(result.error);
    }
  };

  /**
   * Proceder al checkout
   */
  const onCheckout = () => {
    trackCheckoutStarted(total, itemCount);
    showNotification('🚀 Redirigiendo a checkout...', 'info');
    
    // Simular redirección (reemplazar con tu lógica real)
    setTimeout(() => {
      navigate('/customer/checkout');
    }, 1000);
  };

  /**
   * Continuar comprando
   */
  const onContinueShopping = () => {
    navigate('customer/products');
  };

  /**
   * Mostrar notificación toast
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Free shipping calculation
  const freeShippingThreshold = 50;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercentage = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Loading inicial
  if (isCartLoading && !cart) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <LoadingSpinner size="lg" text="Cargando tu carrito..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header con animación */}
        <div className="mb-6 sm:mb-8 animate-fade-in-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2 flex items-center gap-3">
                <span className="animate-bounce-subtle">🛒</span>
                Carrito de Compras
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                {itemCount > 0 ? (
                  <>
                    <span className="font-bold text-indigo-600">{itemCount}</span>{' '}
                    {itemCount === 1 ? 'producto' : 'productos'} en tu carrito
                  </>
                ) : (
                  'Tu carrito está vacío'
                )}
              </p>
            </div>
            
            {!isEmpty && (
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={isClearingCart}
                className="group btn btn-outline text-red-600 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto"
              >
                <svg className="w-5 h-5 transform group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">{isClearingCart ? 'Vaciando...' : 'Vaciar Carrito'}</span>
                <span className="sm:hidden">{isClearingCart ? 'Vaciando...' : 'Vaciar'}</span>
              </button>
            )}
          </div>

          {/* Progress indicator */}
          {!isEmpty && (
            <div className="glass-effect rounded-2xl p-3 sm:p-4 max-w-2xl animate-slide-up">
              <div className="flex items-center justify-between text-xs sm:text-sm mb-2 px-1">
                <span className="text-gray-600 font-medium">Progreso de compra</span>
                <span className="font-bold text-indigo-600">
                  {itemCount > 0 ? '33%' : '0%'} completado
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full gradient-primary transition-all duration-700 rounded-full relative overflow-hidden"
                  style={{ width: itemCount > 0 ? '33%' : '0%' }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>🛒 Carrito</span>
                <span>📋 Checkout</span>
                <span>✅ Confirmación</span>
              </div>
            </div>
          )}

          {/* Free Shipping Progress */}
          {!isEmpty && remainingForFreeShipping > 0 && (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 animate-slide-up delay-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-600 text-white rounded-full p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-green-900 text-sm sm:text-base">
                    ¡Agrega ${remainingForFreeShipping.toFixed(2)} más para envío gratis! 🎉
                  </p>
                </div>
              </div>
              <div className="relative w-full h-2 bg-green-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${progressPercentage}%` }}
                >
                  <div className="absolute inset-0 bg-white opacity-30 animate-shimmer"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showClearConfirm}
          title="¿Vaciar carrito?"
          message="Esto eliminará todos los productos de tu carrito. Esta acción no se puede deshacer."
          confirmText="Sí, vaciar"
          cancelText="Cancelar"
          onConfirm={onClearCart}
          onCancel={() => setShowClearConfirm(false)}
          isLoading={isClearingCart}
          type="warning"
        />

        {/* Toast Notification */}
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Content */}
        {isEmpty ? (
          <div className="animate-fade-in-up">
            <EmptyCart onContinueShopping={onContinueShopping} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items - 2/3 del espacio */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item, index) => {
                const itemKey = `${item.product._id}-${JSON.stringify(item.attributes)}`;
                const isLoading = isItemLoading(item.product._id, item.attributes);

                return (
                  <div 
                    key={itemKey}
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CartItemCard
                      item={item}
                      onUpdateQuantity={(quantity) =>
                        onUpdateQuantity(item.product._id, quantity, item.attributes)
                      }
                      onRemove={() => onRemoveItem(item.product._id, item.attributes)}
                      isLoading={isLoading}
                    />
                  </div>
                );
              })}

              {/* Recommendations Card */}
              {showRecommendations && (
                <div className="card card-glass p-6 animate-scale-in">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full p-2">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">Te podría interesar</h3>
                      <p className="text-sm text-gray-600">Productos relacionados con tu compra</p>
                    </div>
                    <button 
                      onClick={() => setShowRecommendations(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <button 
                    onClick={() => navigate('customer/products/recommended')}
                    className="w-full btn btn-gradient text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    Ver Recomendaciones
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary - 1/3 del espacio */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                <div className="animate-fade-in-up delay-300">
                  <CartSummary
                    subtotal={subtotal}
                    discountAmount={discountAmount}
                    shippingCost={shippingCost}
                    total={total}
                    coupon={cart.coupon}
                    onApplyCoupon={onApplyCoupon}
                    onCheckout={onCheckout}
                    onContinueShopping={onContinueShopping}
                    isLoading={isApplyingCoupon}
                  />
                </div>

                {/* Savings Badge */}
                {discountAmount > 0 && (
                  <div className="card bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 text-center animate-pulse-glow shadow-2xl">
                    <div className="text-5xl mb-3 animate-bounce">🎉</div>
                    <p className="font-bold text-lg mb-2">¡Estás ahorrando!</p>
                    <p className="text-4xl font-bold mb-1">${discountAmount.toFixed(2)}</p>
                    <p className="text-sm opacity-90">en esta compra</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {!isEmpty && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 animate-fade-in-up delay-500">
            <h3 className="text-center text-base sm:text-lg font-bold text-gray-700 mb-4 sm:mb-6 flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Compra con total confianza
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <TrustBadge 
                icon="🔒" 
                title="Pago Seguro" 
                description="SSL Certificado" 
              />
              <TrustBadge 
                icon="🚚" 
                title="Envío Gratis" 
                description="En compras +$50" 
              />
              <TrustBadge 
                icon="↩️" 
                title="Devoluciones" 
                description="30 días gratis" 
              />
              <TrustBadge 
                icon="💳" 
                title="Pagos" 
                description="Múltiples métodos" 
              />
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        {!isEmpty && (
          <div className="mt-8 sm:mt-12 card card-glass p-6 sm:p-8 animate-fade-in-up delay-700">
            <div className="text-center mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Lo que dicen nuestros clientes
              </h3>
              <div className="flex justify-center gap-1 text-yellow-400 text-xl sm:text-2xl">
                {'⭐'.repeat(5)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                +10,000 reseñas verificadas
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <TestimonialCard
                author="María González"
                text="Excelente servicio, llegó todo perfecto y muy rápido. El proceso de compra fue súper fácil."
                rating={5}
              />
              <TestimonialCard
                author="Juan Pérez"
                text="Productos de calidad y precios justos. El soporte al cliente es increíble. Muy recomendado."
                rating={5}
              />
              <TestimonialCard
                author="Ana Martínez"
                text="La mejor experiencia de compra online que he tenido. Todo llegó en perfectas condiciones."
                rating={5}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * ============================================
 * COMPONENTES AUXILIARES
 * ============================================
 */

/**
 * Toast Notification
 */
const Toast = ({ message, type = 'success', onClose }) => {
  const typeConfig = {
    success: {
      bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
      icon: '✅',
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600 to-pink-600',
      icon: '❌',
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-600 to-indigo-600',
      icon: 'ℹ️',
    },
  };

  const config = typeConfig[type] || typeConfig.success;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in max-w-sm">
      <div className={`${config.bg} text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm`}>
        <span className="text-2xl flex-shrink-0">{config.icon}</span>
        <p className="font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors flex-shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

/**
 * Trust Badge
 */
const TrustBadge = ({ icon, title, description }) => (
  <div className="group card card-hover text-center p-4 sm:p-6 cursor-default bg-white">
    <div className="text-3xl sm:text-4xl mb-3 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">{title}</h4>
    <p className="text-xs sm:text-sm text-gray-600">{description}</p>
  </div>
);

/**
 * Testimonial Card
 */
const TestimonialCard = ({ author, text, rating }) => (
  <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex gap-1 text-yellow-400 mb-3 text-sm">
      {'⭐'.repeat(rating)}
    </div>
    <p className="text-gray-700 mb-4 italic text-sm sm:text-base">"{text}"</p>
    <p className="font-bold text-gray-900 text-sm">- {author}</p>
  </div>
);

export default CustomerCartPage;