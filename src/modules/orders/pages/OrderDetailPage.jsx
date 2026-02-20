// modules/orders/pages/OrderDetailPage.jsx

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrderDetail }  from '../presentation/hooks/useOrderDetail.js';
import { useOrderActions } from '../presentation/hooks/useOrderActions.js';
import { OrderSummary }     from '../presentation/components/OrderSummary.jsx';
import { OrderItemCard }    from '../presentation/components/OrderItemCard.jsx';
import { OrderStatusBadge } from '../presentation/components/OrderStatusBadge.jsx';
import { AddressCard }      from '../presentation/components/AddressCard.jsx';
import { PaymentMethodCard } from '../presentation/components/PaymentMethodCard.jsx';
import { TrackingTimeline } from '../presentation/components/TrackingTimeline.jsx';
import { ReturnModal }      from '../presentation/components/ReturnModal.jsx';

/**
 * @page OrderDetailPage
 * @description Vista de detalle completo de una orden.
 *
 * Usa:
 *   useOrderDetail (lectura + tracking)
 *   useOrderActions (cancelar, devolver)
 *
 * Sin Context. Sin lógica de dominio en el componente.
 */
export function OrderDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Carga orden + tracking en paralelo al montar
  const {
    order,
    tracking,
    isLoadingOrder,
    isLoadingTracking,
    orderError,
    reloadOrder,
  } = useOrderDetail(id, { withTracking: true, autoLoad: true });

  const {
    cancelOrder,
    requestReturn,
    isCancelling,
    isReturning,
    cancelError,
    returnError,
    clearError,
  } = useOrderActions();

  // =========================================
  // HANDLERS
  // =========================================

  const handleCancel = async () => {
    if (!order) return;
    if (!window.confirm(`¿Cancelar la orden ${order.orderNumber}?`)) return;
    clearError('cancel');

    const result = await cancelOrder(order);
    if (result.success) {
      // La orden ya está actualizada en el store — order se re-renderizará
    }
  };

  const handleReturnSubmit = async (reason) => {
    if (!order) return;
    clearError('return');

    const result = await requestReturn(order, reason);
    if (result.success) {
      setShowReturnModal(false);
    }
  };

  // =========================================
  // LOADING
  // =========================================

  if (isLoadingOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
          </div>
          <div className="h-48 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  // =========================================
  // ERROR
  // =========================================

  if (orderError || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {orderError?.name === 'OrderNotFoundError'
            ? 'Orden no encontrada'
            : 'No se pudo cargar la orden'
          }
        </h2>
        <p className="text-gray-500 mb-6">{orderError?.message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reloadOrder}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
          <button
            onClick={() => navigate('/orders')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            ← Volver a órdenes
          </button>
        </div>
      </div>
    );
  }

  // =========================================
  // RENDER PRINCIPAL
  // =========================================

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back + Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="text-sm text-gray-500 hover:text-gray-700 mb-3 flex items-center gap-1 transition-colors"
        >
          ← Volver a mis órdenes
        </button>
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Creada el{' '}
              {new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          </div>
          <OrderStatusBadge status={order.status} type="order" size="md" />
        </div>
      </div>

      {/* Errores de acción */}
      {(cancelError || returnError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <p className="text-sm text-red-700">
            {cancelError?.message || returnError?.message}
          </p>
          <button
            onClick={() => { clearError('cancel'); clearError('return'); }}
            className="text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items de la orden */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Productos ({order.itemsCount})
            </h2>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <OrderItemCard key={idx} item={item} showTotal />
              ))}
            </div>
          </section>

          {/* Tracking */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Seguimiento de Envío
            </h2>
            {isLoadingTracking ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-200 rounded" />)}
              </div>
            ) : tracking ? (
              <TrackingTimeline
                timeline={tracking.timeline}
                trackingNumber={tracking.trackingNumber}
              />
            ) : (
              <p className="text-sm text-gray-500">No hay información de seguimiento disponible.</p>
            )}

            {/* Entrega estimada */}
            {!['delivered', 'cancelled', 'returned'].includes(order.status) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  🚚 <strong>Entrega estimada:</strong> 3-5 días hábiles
                </p>
              </div>
            )}
          </section>

          {/* Direcciones */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dirección de Entrega</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <AddressCard address={order.shippingAddress} title="Envío" />
              {order.billingAddress && (
                <AddressCard address={order.billingAddress} title="Facturación" />
              )}
            </div>
          </section>

          {/* Método de pago */}
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Método de Pago</h2>
            <PaymentMethodCard method={order.paymentMethod} showIcon />
          </section>

          {/* Notas del cliente */}
          {order.customerNotes && (
            <section className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Notas</h2>
              <p className="text-sm text-gray-600">{order.customerNotes}</p>
            </section>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-4">
          {/* Resumen financiero */}
          <OrderSummary order={order} showPaymentStatus />

          {/* Acciones */}
          <div className="bg-white rounded-lg shadow-md p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
              Acciones
            </h2>

            {/* Cancelar */}
            {order.canBeCancelled && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full border border-red-500 text-red-600 py-2.5 rounded-lg font-medium text-sm
                  hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar Orden'}
              </button>
            )}

            {/* Solicitar devolución */}
            {order.canBeReturned?.() && (
              <button
                onClick={() => setShowReturnModal(true)}
                disabled={isReturning}
                className="w-full border border-orange-500 text-orange-600 py-2.5 rounded-lg font-medium text-sm
                  hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Solicitar Devolución
              </button>
            )}

            {/* Sin acciones */}
            {!order.canBeCancelled && !order.canBeReturned?.() && (
              <p className="text-xs text-gray-400 text-center">
                No hay acciones disponibles para esta orden.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Modal de devolución */}
      {showReturnModal && (
        <ReturnModal
          onClose={() => {
            setShowReturnModal(false);
            clearError('return');
          }}
          onSubmit={handleReturnSubmit}
          isSubmitting={isReturning}
          errorMessage={returnError?.message}
        />
      )}
    </div>
  );
}

export default OrderDetailPage;