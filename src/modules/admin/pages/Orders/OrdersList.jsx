// src/modules/admin/pages/Orders/OrdersList.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

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
    await getOrders(
      filters,
      (data) => {
        setOrders(data.orders);
        setPagination(data.pagination);
      },
      (err) => console.error('Error cargando órdenes:', err)
    );
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
    <div className="p-6">
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Gestión de Órdenes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Total: {pagination?.total || 0} órdenes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Buscar por número de orden..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {/* Sort */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setFilters({ ...filters, sortBy, sortOrder, page: 1 });
            }}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt-desc">Más recientes</option>
            <option value="createdAt-asc">Más antiguos</option>
            <option value="totalAmount-desc">Mayor monto</option>
            <option value="totalAmount-asc">Menor monto</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-600 dark:text-gray-400">No se encontraron órdenes</p>
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

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                disabled={pagination.current === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                Página {pagination.current} de {pagination.pages}
              </span>
              <button
                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                disabled={pagination.current === pagination.pages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==============================================================================
// ORDER CARD COMPONENT
// ==============================================================================

function OrderCard({ order, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusConfig = {
    pending: {
      label: 'Pendiente',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      nextStates: ['processing', 'cancelled']
    },
    processing: {
      label: 'Procesando',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      nextStates: ['shipped', 'cancelled']
    },
    shipped: {
      label: 'Enviado',
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      nextStates: ['delivered']
    },
    delivered: {
      label: 'Entregado',
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      nextStates: []
    },
    cancelled: {
      label: 'Cancelado',
      color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      nextStates: []
    }
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          
          {/* Order info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Orden #{order.orderNumber || order._id?.slice(-6)}
              </h3>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 {new Date(order.createdAt).toLocaleDateString('es-ES')}</span>
              <span>👤 {order.user?.email || 'Usuario desconocido'}</span>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right mr-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${order.totalAmount?.toFixed(2) || '0.00'}
            </p>
          </div>

          {/* Expand button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <svg
              className={`w-6 h-6 text-gray-600 dark:text-gray-400 transition-transform ${
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

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-6 bg-gray-50 dark:bg-gray-700">
          
          {/* Items */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 dark:text-white mb-3">Productos</h4>
            <div className="space-y-2">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.product?.name || 'Producto'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Cantidad: {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping info */}
          {order.shippingAddress && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Dirección de envío</h4>
              <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <p className="text-gray-900 dark:text-white">
                  {order.shippingAddress.street}, {order.shippingAddress.city}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.shippingAddress.state}, {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>
          )}

          {/* Status actions */}
          {currentStatus.nextStates.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-3">Acciones</h4>
              <div className="flex gap-2">
                {currentStatus.nextStates.map((nextState) => (
                  <button
                    key={nextState}
                    onClick={() => onStatusChange(order._id, nextState)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Marcar como {statusConfig[nextState].label}
                  </button>
                ))}
                <Link
                  to={`/admin/orders/${order._id}`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium"
                >
                  Ver detalles completos
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}