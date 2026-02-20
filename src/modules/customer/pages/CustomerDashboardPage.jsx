// src/modules/customer/pages/CustomerDashboardPage.jsx - VERSIÓN ACTUALIZADA

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../context/CustomerProfileContext';
import { useCustomerCart } from '../context/CustomerCartContext';
import { useCustomerWishlist } from '../context/CustomerWishlistContext';
import { useCustomerActivity } from '../context/CustomerActivityContext';
import { useCustomerProducts } from '../context/CustomerProductsContext'; // ✅ NUEVO
import customerOrdersApi from '../../orders/customerOrders.api';
import customerActivityApi from '../api/customerActivity.api';
import {
  WelcomeHeader,
  StatCard,
  QuickActionButton,
  OrderItem,
  ProductPreview,
  ActivityItem,
} from '../components/dashboard';
import { LoadingSpinner, GlassCard } from '../components/common';

/**
 * @page CustomerDashboardPage
 * @description Dashboard premium con integración de Products
 * 
 * ✅ NUEVAS FEATURES:
 * - Quick action para explorar productos
 * - Card promocional de productos destacados
 * - Integración con ProductsContext
 * - Stats actualizados
 */
const CustomerDashboardPage = () => {
  const navigate = useNavigate();
  const { profile } = useCustomerProfile();
  const { itemCount: cartItems } = useCustomerCart();
  const { itemCount: wishlistItems } = useCustomerWishlist();
  const { trackPageView } = useCustomerActivity();
  const { featuredProducts, recentlyViewed } = useCustomerProducts(); // ✅ NUEVO

  // Estados
  const [recentOrders, setRecentOrders] = useState([]);
  const [productViews, setProductViews] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingSection, setLoadingSection] = useState('');

  useEffect(() => {
    trackPageView('Dashboard');
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      setLoadingSection('orders');
      const ordersData = await customerOrdersApi
        .getUserOrders({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' })
        .catch(() => ({ orders: [] }));
      setRecentOrders(ordersData.orders || []);

      setLoadingSection('products');
      const viewsData = await customerActivityApi
        .getProductViews(30)
        .catch(() => []);
      setProductViews(viewsData.slice(0, 6) || []);

      setLoadingSection('activity');
      const activityData = await customerActivityApi
        .getRecentActivity(15)
        .catch(() => []);
      setRecentActivity(activityData || []);

      setLoadingSection('stats');
      const statsData = await customerActivityApi
        .getUserStats(30)
        .catch(() => null);
      setUserStats(statsData);

      setLoadingSection('');
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const daysSinceRegistration = profile?.createdAt
    ? Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const getInitials = () => {
    if (!profile) return '?';
    const first = profile.firstName?.[0] || '';
    const last = profile.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: '¡Buenos días', emoji: '☀️' };
    if (hour < 18) return { text: '¡Buenas tardes', emoji: '🌤️' };
    return { text: '¡Buenas noches', emoji: '🌙' };
  };

  // ✅ NUEVO: Tip contextual mejorado con productos
  const getContextualTip = () => {
    if (featuredProducts && featuredProducts.length > 0 && cartItems === 0 && wishlistItems === 0) {
      return {
        icon: '🎁',
        title: '¡Nuevos Productos!',
        message: `Descubre ${featuredProducts.length} productos destacados seleccionados especialmente para ti.`,
        action: 'Explorar Ahora',
        onClick: () => navigate('/customer/products'),
        color: 'from-purple-400 to-pink-500',
      };
    }

    if (wishlistItems > 0 && cartItems === 0) {
      return {
        icon: '💡',
        title: 'Tip del Día',
        message: `Tienes ${wishlistItems} producto${wishlistItems > 1 ? 's' : ''} en favoritos. ¡Revisa si hay descuentos!`,
        action: 'Ver Favoritos',
        onClick: () => navigate('/customer/wishlist'),
        color: 'from-yellow-400 to-orange-500',
      };
    }

    if (cartItems > 0) {
      return {
        icon: '🛒',
        title: '¡Tu carrito te espera!',
        message: `Tienes ${cartItems} producto${cartItems > 1 ? 's' : ''} esperando. Completa tu compra.`,
        action: 'Ir al Carrito',
        onClick: () => navigate('/customer/cart'),
        color: 'from-green-400 to-emerald-500',
      };
    }

    if (recentOrders.length === 0) {
      return {
        icon: '🛍️',
        title: '¡Bienvenido!',
        message: 'Explora nuestro catálogo premium y descubre productos increíbles.',
        action: 'Ver Productos',
        onClick: () => navigate('/customer/products'),
        color: 'from-blue-400 to-indigo-500',
      };
    }

    return {
      icon: '⭐',
      title: 'Comparte tu experiencia',
      message: '¿Ya recibiste tu pedido? Comparte tu opinión.',
      action: 'Mis Reseñas',
      onClick: () => navigate('/customer/reviews'),
      color: 'from-purple-400 to-pink-500',
    };
  };

  const tip = getContextualTip();
  const greeting = getGreeting();

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative mb-6">
            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl animate-bounce">📊</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Cargando tu dashboard...</h3>
          <p className="text-gray-600">Preparando tu experiencia personalizada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container-custom py-6 sm:py-8">
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl p-8">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-pulse-slow"></div>

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                <div className="relative w-24 h-24 rounded-full bg-white shadow-2xl ring-4 ring-white/30 overflow-hidden transition-transform group-hover:scale-110 duration-300">
                  {profile?.avatar ? (
                    <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-blue-600 text-3xl font-bold animate-bounce-subtle">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-400 w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center animate-pulse">
                  <span className="text-xs">✓</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white animate-slide-in">
                    {greeting.text}, {profile?.firstName || 'Usuario'}!
                  </h1>
                  <span className="text-4xl animate-bounce-subtle">{greeting.emoji}</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold animate-slide-in delay-100">
                    <span className="text-xl">👑</span>
                    <span>Miembro {daysSinceRegistration >= 365 ? 'VIP' : daysSinceRegistration >= 180 ? 'Gold' : 'Silver'}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold animate-slide-in delay-200">
                    <span className="text-xl">📅</span>
                    <span>{daysSinceRegistration} día{daysSinceRegistration !== 1 ? 's' : ''} con nosotros</span>
                  </span>
                </div>

                <p className="text-blue-100 text-sm sm:text-base animate-fade-in delay-300">
                  ¡Qué bueno tenerte de vuelta! Descubre las novedades de hoy 🎁
                </p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient"></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="animate-slide-up delay-100">
            <StatCard
              title="Órdenes"
              value={recentOrders.length}
              subtitle="Compras realizadas"
              icon="📦"
              color="blue"
              onClick={() => navigate('/customer/orders')}
              isLoading={isLoading && loadingSection === 'orders'}
            />
          </div>
          <div className="animate-slide-up delay-200">
            <StatCard
              title="En Carrito"
              value={cartItems}
              subtitle="Productos listos"
              icon="🛒"
              color="green"
              onClick={() => navigate('/customer/cart')}
            />
          </div>
          <div className="animate-slide-up delay-300">
            <StatCard
              title="Favoritos"
              value={wishlistItems}
              subtitle="Productos guardados"
              icon="❤️"
              color="red"
              onClick={() => navigate('/customer/wishlist')}
            />
          </div>
          <div className="animate-slide-up delay-400">
            <StatCard
              title="Actividad"
              value={userStats?.totalActivities || 0}
              subtitle="Últimos 30 días"
              icon="📊"
              color="purple"
              isLoading={isLoading && loadingSection === 'stats'}
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* ✅ NUEVO: Banner promocional de productos */}
            {featuredProducts && featuredProducts.length > 0 && (
              <div className="animate-fade-in delay-400">
                <div
                  onClick={() => navigate('/customer/products')}
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 cursor-pointer group"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-4xl animate-bounce-subtle">🛍️</span>
                        <h3 className="text-2xl font-bold text-white">Productos Destacados</h3>
                      </div>
                      <p className="text-white/90 mb-4">
                        {featuredProducts.length} productos seleccionados para ti
                      </p>
                      <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-semibold">
                        <span>Explorar ahora</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                    <div className="hidden sm:block text-8xl opacity-20 transform group-hover:scale-110 transition-transform">
                      🎁
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="animate-fade-in delay-500">
              <GlassCard title="⚡ Acciones Rápidas">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <QuickActionButton
                    icon="🛍️"
                    title="Explorar Productos"
                    badge="Nuevo"
                    onClick={() => navigate('/customer/products')}
                    featured
                  />
                  <QuickActionButton
                    icon="🛒"
                    title="Mi Carrito"
                    badge={cartItems > 0 ? cartItems : null}
                    onClick={() => navigate('/customer/cart')}
                  />
                  <QuickActionButton
                    icon="❤️"
                    title="Favoritos"
                    badge={wishlistItems > 0 ? wishlistItems : null}
                    onClick={() => navigate('/customer/wishlist')}
                  />
                  <QuickActionButton
                    icon="📦"
                    title="Mis Órdenes"
                    badge={recentOrders.length > 0 ? recentOrders.length : null}
                    onClick={() => navigate('/customer/orders')}
                  />
                  <QuickActionButton
                    icon="⭐"
                    title="Reseñas"
                    onClick={() => navigate('/customer/reviews')}
                  />
                  <QuickActionButton
                    icon="👤"
                    title="Mi Perfil"
                    onClick={() => navigate('/customer/profile')}
                  />
                </div>
              </GlassCard>
            </div>

            {/* Recent Orders */}
            <div className="animate-fade-in delay-700">
              <GlassCard
                title="📦 Órdenes Recientes"
                action={
                  recentOrders.length > 0
                    ? { label: 'Ver todas', onClick: () => navigate('/customer/orders') }
                    : undefined
                }
              >
                {isLoading && loadingSection === 'orders' ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="md" text="Cargando órdenes..." />
                  </div>
                ) : recentOrders.length === 0 ? (
                  <EmptyState
                    icon="📦"
                    message="Aún no tienes órdenes"
                    actionText="Explorar Productos"
                    onAction={() => navigate('/customer/products')}
                  />
                ) : (
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <div key={order._id} className="animate-slide-in" style={{ animationDelay: `${index * 50}ms` }}>
                        <OrderItem order={order} onClick={() => navigate(`/customer/orders/${order._id}`)} />
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Recent Activity */}
            {recentActivity.length > 0 && (
              <div className="animate-fade-in delay-1000">
                <GlassCard title="🕐 Actividad Reciente">
                  {isLoading && loadingSection === 'activity' ? (
                    <div className="text-center py-8">
                      <LoadingSpinner size="md" text="Cargando actividad..." />
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                      {recentActivity.map((activity, index) => (
                        <div key={activity._id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                          <ActivityItem activity={activity} compact />
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Contextual Tip */}
            <div className="animate-fade-in delay-600">
              <div className={`relative overflow-hidden bg-gradient-to-br ${tip.color} rounded-3xl shadow-xl p-6 border border-white/20`}>
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl animate-pulse-slow"></div>
                </div>

                <div className="relative">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-5xl animate-float">{tip.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{tip.title}</h3>
                      <p className="text-white/90 text-sm leading-relaxed">{tip.message}</p>
                    </div>
                  </div>

                  <button
                    onClick={tip.onClick}
                    className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white py-3 px-4 rounded-xl font-semibold text-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                  >
                    <span>{tip.action}</span>
                    <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Viewed */}
            <div className="animate-fade-in delay-800">
              <GlassCard
                title="👁️ Vistos Recientemente"
                action={
                  productViews.length > 0
                    ? { label: 'Ver más', onClick: () => navigate('/customer/products') }
                    : undefined
                }
              >
                {isLoading && loadingSection === 'products' ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size="md" text="Cargando productos..." />
                  </div>
                ) : productViews.length === 0 ? (
                  <EmptyState
                    icon="👁️"
                    message="No has visto productos aún"
                    actionText="Explorar"
                    onAction={() => navigate('/customer/products')}
                  />
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {productViews.map((view, index) => (
                      <div key={view.productId} className="animate-slide-in" style={{ animationDelay: `${index * 40}ms` }}>
                        <ProductPreview
                          product={{
                            ...view,
                            _id: view.productId,
                            name: view.productName,
                          }}
                          onClick={() => navigate(`/customer/products/${view.productSlug}`)}
                          showPrice={false}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Stats Summary */}
            {userStats && (
              <div className="animate-fade-in delay-1000">
                <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-3xl shadow-xl p-6 border border-purple-200">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse-slow"></div>
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                  </div>

                  <div className="relative">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📊</span>
                      <span>Tu Actividad</span>
                    </h3>

                    <div className="space-y-3">
                      <StatRow
                        icon="👁️"
                        label="Productos vistos"
                        value={userStats.activities?.product_view || 0}
                        color="text-blue-600"
                      />
                      <StatRow
                        icon="🛒"
                        label="Agregados al carrito"
                        value={userStats.activities?.add_to_cart || 0}
                        color="text-green-600"
                      />
                      <StatRow
                        icon="❤️"
                        label="Agregados a wishlist"
                        value={userStats.activities?.add_to_wishlist || 0}
                        color="text-red-600"
                      />
                      <StatRow
                        icon="🔍"
                        label="Búsquedas realizadas"
                        value={userStats.activities?.search || 0}
                        color="text-yellow-600"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * ============================================
 * COMPONENTES AUXILIARES
 * ============================================
 */

const EmptyState = ({ icon, message, actionText, onAction }) => (
  <div className="text-center py-12">
    <div className="text-7xl mb-4 animate-bounce-subtle">{icon}</div>
    <p className="text-gray-600 mb-6 text-base">{message}</p>
    {actionText && onAction && (
      <button
        onClick={onAction}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl hover:scale-105 transition-all duration-300 inline-flex items-center gap-2 group"
      >
        <span>{actionText}</span>
        <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>
    )}
  </div>
);

const StatRow = ({ icon, label, value, color = 'text-gray-900' }) => (
  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/50 transition-colors group">
    <div className="flex items-center gap-3">
      <span className="text-2xl transform group-hover:scale-125 transition-transform">{icon}</span>
      <span className="text-sm text-gray-700 font-semibold">{label}</span>
    </div>
    <span className={`text-xl font-black ${color} transform group-hover:scale-110 transition-transform`}>
      {value}
    </span>
  </div>
);

export default CustomerDashboardPage;