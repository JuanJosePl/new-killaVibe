// src/modules/customer/pages/CustomerWishlistPage.jsx - VERSIÓN FINAL COMPLETA

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerWishlist } from '../context/CustomerWishlistContext';
import { useCustomerActivity } from '../context/CustomerActivityContext';
import { useWishlistOperations } from '../hooks/useWishlistOperations';
import { WishlistItem, WishlistAlerts, EmptyWishlist } from '../components/wishlist';
import { LoadingSpinner, ConfirmDialog } from '../components/common';

/**
 * @page CustomerWishlistPage
 * @description Página premium de lista de deseos con UX extraordinaria
 * 
 * Features Premium:
 * ✅ Gestión completa de wishlist
 * ✅ Alertas inteligentes de precios
 * ✅ Notificaciones de disponibilidad
 * ✅ Sistema de filtros avanzado
 * ✅ Move to cart individual y masivo
 * ✅ Animaciones románticas y acogedoras
 * ✅ Diseño 100% responsive
 * ✅ Tema rosa/rojo acogedor
 * ✅ Stats en tiempo real
 * ✅ Info cards de beneficios
 * ✅ Empty state atractivo
 */
const CustomerWishlistPage = () => {
  const navigate = useNavigate();
  
  const {
    handleRemoveItem,
    handleMoveToCart,
    handleMoveAllToCart,
    filterItems,
    getStats,
    isItemLoading,
    isMovingAll,
    wishlist,
  } = useWishlistOperations();

  const { trackPageView } = useCustomerActivity();

  // Estados locales
  const [filter, setFilter] = useState('all');
  const [showMoveAllConfirm, setShowMoveAllConfirm] = useState(false);
  const [notification, setNotification] = useState(null);
  const [view, setView] = useState('grid'); // grid o list

  useEffect(() => {
    trackPageView('Wishlist');
  }, [trackPageView]);

  /**
   * Eliminar item de wishlist
   */
  const onRemoveItem = async (productId) => {
    const result = await handleRemoveItem(productId);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  /**
   * Mover item al carrito
   */
  const onMoveToCart = async (productId) => {
    const result = await handleMoveToCart(productId);
    if (result.success) {
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  /**
   * Mover todos al carrito
   */
  const onMoveAllToCart = async () => {
    const result = await handleMoveAllToCart();
    if (result.success) {
      setShowMoveAllConfirm(false);
      showNotification(result.message, 'success');
    } else {
      showNotification(result.error, 'error');
    }
  };

  /**
   * Mostrar notificación
   */
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredItems = filterItems(filter);
  const stats = getStats();
  const isEmpty = !wishlist || !wishlist.items || wishlist.items.length === 0;

  // Loading inicial
  if (!wishlist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-red-50 to-purple-50">
        <LoadingSpinner size="lg" text="Cargando tu lista de deseos..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-purple-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in-down">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold gradient-text mb-2 flex items-center gap-3">
                <span className="animate-pulse-slow">❤️</span>
                Lista de Deseos
              </h1>
              <p className="text-base sm:text-lg text-gray-600">
                {stats.total > 0 ? (
                  <>
                    <span className="font-bold text-pink-600">{stats.total}</span>{' '}
                    {stats.total === 1 ? 'producto guardado' : 'productos guardados'}
                    {stats.withDiscount > 0 && (
                      <span className="ml-2 text-red-600 font-semibold inline-flex items-center gap-1">
                        • {stats.withDiscount} con descuento 
                        <span className="animate-bounce">🔥</span>
                      </span>
                    )}
                  </>
                ) : (
                  'Tu lista de deseos está vacía'
                )}
              </p>
            </div>
            
            {!isEmpty && stats.available > 0 && (
              <button
                onClick={() => setShowMoveAllConfirm(true)}
                disabled={isMovingAll}
                className="btn btn-gradient flex items-center gap-2 shadow-glow-primary self-start sm:self-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="hidden sm:inline">{isMovingAll ? 'Moviendo...' : 'Mover Todo al Carrito'}</span>
                <span className="sm:hidden">{isMovingAll ? 'Moviendo...' : 'Mover Todo'}</span>
              </button>
            )}
          </div>

          {/* Alerts */}
          {!isEmpty && (
            <WishlistAlerts
              priceChangesCount={stats.withDiscount}
              unavailableCount={stats.unavailable}
            />
          )}
        </div>

        {/* Confirmation Modal */}
        <ConfirmDialog
          isOpen={showMoveAllConfirm}
          title="¿Mover todo al carrito?"
          message={`Esto agregará ${stats.available} productos disponibles a tu carrito.`}
          onConfirm={onMoveAllToCart}
          onCancel={() => setShowMoveAllConfirm(false)}
          confirmText="Sí, mover todo"
          cancelText="Cancelar"
          isLoading={isMovingAll}
          type="info"
        />

        {/* Toast Notification */}
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Filters & View Toggle */}
        {!isEmpty && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <FilterTab
                active={filter === 'all'}
                onClick={() => setFilter('all')}
                count={stats.total}
              >
                Todos
              </FilterTab>
              <FilterTab
                active={filter === 'available'}
                onClick={() => setFilter('available')}
                count={stats.available}
                icon="✓"
              >
                Disponibles
              </FilterTab>
              {stats.withDiscount > 0 && (
                <FilterTab
                  active={filter === 'discount'}
                  onClick={() => setFilter('discount')}
                  count={stats.withDiscount}
                  icon="🔥"
                  highlight
                >
                  Con Descuento
                </FilterTab>
              )}
              {stats.unavailable > 0 && (
                <FilterTab
                  active={filter === 'unavailable'}
                  onClick={() => setFilter('unavailable')}
                  count={stats.unavailable}
                  icon="⚠️"
                >
                  Sin Stock
                </FilterTab>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex gap-2 bg-white rounded-xl p-1 shadow-sm border border-gray-200 self-start sm:self-auto">
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'grid'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  view === 'list'
                    ? 'bg-pink-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {isEmpty ? (
          <div className="animate-fade-in-up">
            <EmptyWishlist onContinueShopping={() => navigate('/products')} />
          </div>
        ) : (
          <>
            {/* Items Grid */}
            <div className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'
                : 'grid grid-cols-1 gap-4'
            }>
              {filteredItems.map((item, index) => {
                const isLoading = isItemLoading(item.product._id);

                return (
                  <div
                    key={item.product._id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <WishlistItem
                      item={item}
                      onRemove={() => onRemoveItem(item.product._id)}
                      onMoveToCart={() => onMoveToCart(item.product._id)}
                      isLoading={isLoading}
                    />
                  </div>
                );
              })}
            </div>

            {/* Empty Filter Result */}
            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <div className="text-6xl mb-4 animate-bounce">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  No hay productos en esta categoría
                </h3>
                <p className="text-gray-600 mb-4">Intenta con otro filtro</p>
                <button
                  onClick={() => setFilter('all')}
                  className="btn btn-outline"
                >
                  Ver todos los productos
                </button>
              </div>
            )}
          </>
        )}

        {/* Info Cards */}
        {!isEmpty && (
          <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-200 animate-fade-in-up delay-500">
            <h3 className="text-center text-base sm:text-lg font-bold text-gray-700 mb-4 sm:mb-6 flex items-center justify-center gap-2">
              <span className="text-2xl">✨</span>
              Beneficios de tu lista de deseos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              <InfoCard
                icon="🔔"
                title="Notificaciones Automáticas"
                description="Te avisamos cuando tus productos bajen de precio o estén disponibles"
              />
              <InfoCard
                icon="💰"
                title="Ahorra Dinero"
                description="Espera el mejor momento para comprar y aprovecha las ofertas especiales"
              />
              <InfoCard
                icon="🚀"
                title="Compra Rápido"
                description="Mueve productos al carrito con un solo clic cuando estés listo"
              />
            </div>
          </div>
        )}

        {/* Stats Card */}
        {!isEmpty && (
          <div className="mt-8 card bg-gradient-to-r from-pink-600 to-red-600 text-white p-6 sm:p-8 text-center shadow-2xl animate-fade-in-up delay-700">
            <h3 className="text-2xl font-bold mb-4">Tu Resumen</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{stats.total}</div>
                <div className="text-sm opacity-90">Total guardados</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{stats.available}</div>
                <div className="text-sm opacity-90">Disponibles</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">{stats.withDiscount}</div>
                <div className="text-sm opacity-90">Con descuento</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold mb-2">
                  {stats.total > 0 ? Math.round((stats.available / stats.total) * 100) : 0}%
                </div>
                <div className="text-sm opacity-90">Disponibilidad</div>
              </div>
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
 * Filter Tab
 */
const FilterTab = ({ active, onClick, count, icon, highlight, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
      active
        ? highlight
          ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
          : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg'
        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
    }`}
  >
    {icon && <span>{icon}</span>}
    <span>{children}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white bg-opacity-20' : 'bg-gray-100'}`}>
      {count}
    </span>
  </button>
);

/**
 * Info Card
 */
const InfoCard = ({ icon, title, description }) => (
  <div className="card card-hover p-4 sm:p-6 bg-white">
    <div className="text-4xl mb-3 transform hover:scale-110 transition-transform">{icon}</div>
    <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

export default CustomerWishlistPage;