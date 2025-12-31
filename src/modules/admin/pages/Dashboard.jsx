// src/modules/admin/pages/Dashboard.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../../core/hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { Link } from 'react-router-dom';

/**
 * @component AdminDashboard
 * @description Dashboard principal del panel admin con métricas reales del backend
 */
export default function AdminDashboard() {
  const { user } = useAuth();
  const { getDashboardStats, loading, error } = useAdmin();
  
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar estadísticas al montar
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setRefreshing(true);
    await getDashboardStats(
      (data) => {
        console.log("DATOS RECIBIDOS DEL BACKEND:", data); // Mira la consola con F12
        setStats(data);
        console.log('[DASHBOARD] Stats cargadas:', data);
      },
      (err) => {
        console.error('[DASHBOARD] Error cargando stats:', err);
      }
    );
    setRefreshing(false);
  };

  // Loading inicial
  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={loadStats}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ====================================================================== */}
        {/* HEADER */}
        {/* ====================================================================== */}
        
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Panel Administrativo
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Bienvenido, {user?.profile?.firstName || 'Admin'} · {' '}
                <span className="text-blue-600 dark:text-blue-400 font-medium uppercase">
                  {user?.role}
                </span>
              </p>
            </div>
            
            <button
              onClick={loadStats}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span>Actualizar</span>
            </button>
          </div>
        </div>

        {/* ====================================================================== */}
        {/* STATS CARDS */}
        {/* ====================================================================== */}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Revenue Total */}
          <StatCard
            title="Ingresos Totales"
            value={`$${stats?.revenue?.total?.toLocaleString() || '0'}`}
            subtitle={`${stats?.revenue?.orderCount || 0} órdenes`}
            icon="💰"
            color="green"
          />
          
          {/* Productos */}
          <StatCard
            title="Productos"
            value={stats?.counts?.products || 0}
            subtitle={`${stats?.counts?.lowStockProducts || 0} bajo stock`}
            icon="📦"
            color="blue"
            link="/admin/products"
          />
          
          {/* Usuarios */}
          <StatCard
            title="Usuarios"
            value={stats?.counts?.users || 0}
            subtitle={`${stats?.counts?.newUsers || 0} nuevos (30d)`}
            icon="👥"
            color="purple"
            link="/admin/users"
          />
          
          {/* Órdenes Pendientes */}
          <StatCard
            title="Órdenes Pendientes"
            value={stats?.counts?.pendingOrders || 0}
            subtitle="Requieren atención"
            icon="🛒"
            color="orange"
            link="/admin/orders"
          />
          
        </div>

        {/* ====================================================================== */}
        {/* ÓRDENES RECIENTES */}
        {/* ====================================================================== */}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          
          {/* Órdenes recientes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Órdenes Recientes
              </h2>
              <Link
                to="/admin/orders"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Ver todas →
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentOrders?.length > 0 ? (
                stats.recentOrders.slice(0, 5).map((order) => (
                  <OrderItem key={order._id} order={order} />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay órdenes recientes
                </p>
              )}
            </div>
          </div>

          {/* Productos más vendidos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Productos Top
              </h2>
              <Link
                to="/admin/products"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Ver todos →
              </Link>
            </div>
            
            <div className="space-y-4">
              {stats?.topProducts?.length > 0 ? (
                stats.topProducts.slice(0, 5).map((product, index) => (
                  <TopProductItem key={product._id} product={product} rank={index + 1} />
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  No hay datos de productos
                </p>
              )}
            </div>
          </div>
          
        </div>

        {/* ====================================================================== */}
        {/* ALERTAS Y ACCIONES RÁPIDAS */}
        {/* ====================================================================== */}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Bajo stock */}
          {stats?.counts?.lowStockProducts > 0 && (
            <AlertCard
              type="warning"
              title="Productos bajo stock"
              message={`${stats.counts.lowStockProducts} productos necesitan reabastecimiento`}
              action="Ver productos"
              link="/admin/products?filter=low-stock"
            />
          )}
          
          {/* Órdenes pendientes */}
          {stats?.counts?.pendingOrders > 0 && (
            <AlertCard
              type="info"
              title="Órdenes pendientes"
              message={`${stats.counts.pendingOrders} órdenes esperando procesamiento`}
              action="Gestionar órdenes"
              link="/admin/orders?status=pending"
            />
          )}
          
          {/* Nuevos usuarios */}
          {stats?.counts?.newUsers > 0 && (
            <AlertCard
              type="success"
              title="Nuevos usuarios"
              message={`${stats.counts.newUsers} usuarios registrados en los últimos 30 días`}
              action="Ver usuarios"
              link="/admin/users?filter=new"
            />
          )}
          
        </div>

      </div>
    </div>
  );
}

// ==============================================================================
// COMPONENTES AUXILIARES
// ==============================================================================

function StatCard({ title, value, subtitle, icon, color, link }) {
  const colors = {
    green: 'from-green-500 to-green-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const Card = (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center text-2xl mb-4`}>
        {icon}
      </div>
      <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">{title}</div>
      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</div>
      <div className="text-gray-500 dark:text-gray-500 text-sm">{subtitle}</div>
    </div>
  );

  return link ? <Link to={link}>{Card}</Link> : Card;
}

function OrderItem({ order }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    shipped: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition">
      <div className="flex-1">
        <p className="font-medium text-gray-900 dark:text-white">
          Orden #{order.orderNumber || order._id?.slice(-6)}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(order.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>
      <div className="text-right mr-4">
        <p className="font-bold text-gray-900 dark:text-white">
          ${order.totalAmount?.toFixed(2) || '0.00'}
        </p>
        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[order.status]}`}>
          {statusLabels[order.status] || order.status}
        </span>
      </div>
    </div>
  );
}

function TopProductItem({ product, rank }) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
        #{rank}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-white truncate">
          {product.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {product.soldCount || 0} vendidos
        </p>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white">
          ${product.price?.toFixed(2) || '0.00'}
        </p>
      </div>
    </div>
  );
}

function AlertCard({ type, title, message, action, link }) {
  const types = {
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-700',
      icon: '⚠️',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-700',
      icon: 'ℹ️',
      button: 'bg-blue-600 hover:bg-blue-700'
    },
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-700',
      icon: '✅',
      button: 'bg-green-600 hover:bg-green-700'
    }
  };

  const style = types[type];

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-xl p-6`}>
      <div className="text-3xl mb-3">{style.icon}</div>
      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{message}</p>
      <Link
        to={link}
        className={`inline-block ${style.button} text-white px-4 py-2 rounded-lg transition text-sm font-medium`}
      >
        {action}
      </Link>
    </div>
  );
}