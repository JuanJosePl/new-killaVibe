// src/modules/admin/pages/Orders/OrdersList.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';
import adminAPI from '../../api/admin.api';

export default function OrdersList() {
  const { getOrders, updateOrderStatus, loading } = useAdmin();
  
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    try {
      const response = await adminAPI.getOrders(filters);
      const ordersData = Array.isArray(response) ? response : (response.orders || response.data || []);
      setOrders(ordersData);
      
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error cargando órdenes:", error);
      setOrders([]);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await updateOrderStatus(
      orderId,
      newStatus,
      `Estado actualizado a ${newStatus} por administrador`,
      () => {
        loadOrders();
        alert('Estado actualizado exitosamente');
      },
      (err) => alert('Error: ' + err)
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      
      {/* Header con diseño moderno */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Gestión de Órdenes
            </h1>
            <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
              Total: <span className="text-blue-600 dark:text-blue-400 font-bold">{pagination?.total || orders.length || 0}</span> órdenes
            </p>
          </div>
        </div>
      </div>

      {/* Filters con diseño glassmorphism */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search con icono */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por número de orden..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
            />
          </div>

          {/* Status filter con gradiente */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none cursor-pointer font-medium"
          >
            <option value="">📋 Todos los estados</option>
            <option value="pending">⏳ Pendiente</option>
            <option value="processing">⚙️ Procesando</option>
            <option value="shipped">🚚 Enviado</option>
            <option value="delivered">✅ Entregado</option>
            <option value="cancelled">❌ Cancelado</option>
          </select>

          {/* Sort con estilo mejorado */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none cursor-pointer font-medium"
          >
            <option value="createdAt-desc">🕐 Más recientes</option>
            <option value="createdAt-asc">📅 Más antiguos</option>
            <option value="totalAmount-desc">💰 Mayor monto</option>
            <option value="totalAmount-asc">💵 Menor monto</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
            <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
          </div>
        </div>
      ) : (!orders || orders.length === 0) ? (
        <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-16 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🛒</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No hay órdenes</h3>
          <p className="text-gray-600 dark:text-gray-400">No se encontraron órdenes con los filtros seleccionados</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onStatusChange={handleStatusChange}
            />
          ))}

          {/* Pagination mejorada */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={pagination.current === 1}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg disabled:hover:scale-100"
              >
                ← Anterior
              </button>
              <div className="px-6 py-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-white">
                  {pagination.current}
                </span>
                <span className="text-gray-500 dark:text-gray-400 mx-2">/</span>
                <span className="text-gray-600 dark:text-gray-400">{pagination.pages}</span>
              </div>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={pagination.current === pagination.pages}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all shadow-lg disabled:hover:scale-100"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// ORDER CARD COMPONENT - Diseño mejorado
// ==============================================================================

function OrderCard({ order, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      icon: '⏳',
      gradient: 'from-yellow-400 to-orange-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800',
      nextStates: ['processing', 'cancelled']
    },
    processing: {
      label: 'Procesando',
      icon: '⚙️',
      gradient: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      nextStates: ['shipped', 'cancelled']
    },
    shipped: {
      label: 'Enviado',
      icon: '🚚',
      gradient: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      nextStates: ['delivered']
    },
    delivered: {
      label: 'Entregado',
      icon: '✅',
      gradient: 'from-green-400 to-emerald-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
      nextStates: []
    },
    cancelled: {
      label: 'Cancelado',
      icon: '❌',
      gradient: 'from-red-400 to-rose-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      nextStates: []
    }
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-1">
      
      {/* Header con gradiente sutil */}
      <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent dark:from-transparent dark:via-gray-700/30 dark:to-transparent">
        <div className="flex items-center justify-between">
          
          {/* Order info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${currentStatus.gradient} rounded-2xl flex items-center justify-center shadow-lg transform rotate-3`}>
                <span className="text-xl">{currentStatus.icon}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                  #{order.orderNumber || order._id?.slice(-6)}
                </h3>
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${currentStatus.bg} ${currentStatus.text} border-2 ${currentStatus.border}`}>
                  {currentStatus.label}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="font-medium">{new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="font-medium">{order.user?.email || 'Usuario desconocido'}</span>
              </div>
            </div>
          </div>

          {/* Amount con diseño destacado */}
          <div className="text-right mr-6">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-bold uppercase tracking-wider">Total</p>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg">
              <p className="text-3xl font-black">
                ${order.totalAmount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>

          {/* Expand button con animación */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all transform hover:scale-110"
          >
            <svg
              className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded content con animación */}
      {isExpanded && (
        <div className="p-6 bg-gradient-to-br from-gray-50/50 to-blue-50/50 dark:from-gray-700/30 dark:to-gray-800/30">
          
          {/* Items con tarjetas mejoradas */}
          <div className="mb-6">
            <h4 className="font-black text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
              <span className="text-2xl">📦</span>
              Productos
            </h4>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-md border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {item.product?.name || 'Producto'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-bold">
                        Cantidad: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping info con icono */}
          {order.shippingAddress && (
            <div className="mb-6">
              <h4 className="font-black text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                <span className="text-2xl">🏠</span>
                Dirección de envío
              </h4>
              <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md border-2 border-gray-100 dark:border-gray-700">
                <p className="text-gray-900 dark:text-white font-bold text-lg">
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {order.shippingAddress.state}, {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* Status actions con botones mejorados */}
          {currentStatus.nextStates.length > 0 && (
            <div>
              <h4 className="font-black text-gray-900 dark:text-white mb-4 text-lg flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                Acciones
              </h4>
              <div className="flex flex-wrap gap-3">
                {currentStatus.nextStates.map((nextState) => (
                  <button
                    key={nextState}
                    onClick={() => onStatusChange(order._id, nextState)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 text-sm font-black shadow-lg"
                  >
                    Marcar como {statusConfig[nextState].label}
                  </button>
                ))}
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all transform hover:scale-105 text-sm font-black shadow-lg"
                >
                  Ver detalles completos →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}