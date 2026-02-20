// modules/orders/pages/OrdersPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders }       from '../presentation/hooks/useOrders.js';
import { useOrderActions } from '../presentation/hooks/useOrderActions.js';
import { OrderCard }       from '../presentation/components/OrderCard.jsx';
import { EmptyOrders }     from '../presentation/components/EmptyOrders.jsx';
import { ORDER_STATUS, ORDER_STATUS_LABELS } from '../domain/order.model.js';

// Tabs del filtro de estado
const STATUS_TABS = [
  { value: null,                         label: 'Todas'      },
  { value: ORDER_STATUS.PENDING,         label: ORDER_STATUS_LABELS.pending    },
  { value: ORDER_STATUS.CONFIRMED,       label: ORDER_STATUS_LABELS.confirmed  },
  { value: ORDER_STATUS.PROCESSING,      label: ORDER_STATUS_LABELS.processing },
  { value: ORDER_STATUS.SHIPPED,         label: ORDER_STATUS_LABELS.shipped    },
  { value: ORDER_STATUS.DELIVERED,       label: ORDER_STATUS_LABELS.delivered  },
  { value: ORDER_STATUS.CANCELLED,       label: ORDER_STATUS_LABELS.cancelled  },
  { value: ORDER_STATUS.RETURNED,        label: ORDER_STATUS_LABELS.returned   },
];

/**
 * @page OrdersPage
 * @description Listado paginado de órdenes del usuario.
 *
 * Usa: useOrders (lectura) + useOrderActions (escritura)
 * Sin Context. Sin lógica de dominio en el componente.
 */
export function OrdersPage() {
  const navigate        = useNavigate();
  const [activeStatus, setActiveStatus] = useState(null);
  const [page, setPage]                 = useState(1);

  const {
    orders,
    pagination,
    hasOrders,
    isLoading,
    error,
    loadOrders,
  } = useOrders({
    filters:  { page, status: activeStatus },
    autoLoad: true,
  });

  const {
    cancelOrder,
    isCancelling,
    cancellingOrderId,
    cancelError,
    clearError,
  } = useOrderActions();

  // Cambio de tab de estado
  const handleStatusChange = (status) => {
    setActiveStatus(status);
    setPage(1);
    loadOrders({ page: 1, status });
  };

  // Ver detalle
  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Cancelar orden
  const handleCancel = async (order) => {
    if (!window.confirm(`¿Cancelar la orden ${order.orderNumber}?`)) return;
    clearError('cancel');
    const result = await cancelOrder(order);
    if (!result.success) {
      // El error ya está en el store — se puede mostrar un toast aquí
      console.error('Cancel error:', result.error?.message);
    }
  };

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
        {pagination && (
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} {pagination.total === 1 ? 'orden' : 'órdenes'} en total
          </p>
        )}
      </div>

      {/* Error global de cancelación */}
      {cancelError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <p className="text-sm text-red-700">{cancelError.message}</p>
          <button onClick={() => clearError('cancel')} className="text-red-400 hover:text-red-600 text-lg">✕</button>
        </div>
      )}

      {/* Tabs de estado */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200">
        {STATUS_TABS.map(tab => (
          <button
            key={String(tab.value)}
            onClick={() => handleStatusChange(tab.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeStatus === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Skeleton loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-40" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>
              <div className="flex gap-2 mb-4">
                {[1, 2].map(j => <div key={j} className="w-16 h-16 bg-gray-200 rounded" />)}
              </div>
              <div className="flex justify-between border-t pt-4">
                <div className="h-6 bg-gray-200 rounded w-20" />
                <div className="h-9 bg-gray-200 rounded-lg w-28" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sin órdenes */}
      {!isLoading && !hasOrders && <EmptyOrders />}

      {/* Error de carga */}
      {!isLoading && error && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No se pudieron cargar tus órdenes.</p>
          <button
            onClick={() => loadOrders({ page, status: activeStatus })}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de órdenes */}
      {!isLoading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onViewDetails={() => handleViewDetails(order._id)}
              onCancel={order.canBeCancelled ? () => handleCancel(order) : undefined}
              isCancelling={isCancelling}
              isCurrentCancelling={cancellingOrderId === order._id}
            />
          ))}
        </div>
      )}

      {/* Paginación */}
      {pagination && pagination.pages > 1 && !isLoading && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => {
              const prev = page - 1;
              setPage(prev);
              loadOrders({ page: prev, status: activeStatus });
            }}
            disabled={page <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            ← Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página <strong>{pagination.current}</strong> de <strong>{pagination.pages}</strong>
          </span>

          <button
            onClick={() => {
              const next = page + 1;
              setPage(next);
              loadOrders({ page: next, status: activeStatus });
            }}
            disabled={page >= pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium
              hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default OrdersPage;
