// src/modules/admin/pages/Orders/OrderDetails.jsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAdmin } from '../../hooks/useAdmin';

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrderDetails, updateOrderStatus, loading } = useAdmin();
  
  const [order, setOrder] = useState(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    await getOrderDetails(
      id,
      (data) => setOrder(data.order),
      (err) => {
        console.error('Error cargando orden:', err);
        alert('Error al cargar orden');
        navigate('/admin/orders');
      }
    );
  };

  const handleStatusChange = async (newStatus) => {
    if (!confirm(`¿Cambiar el estado de esta orden a "${statusLabels[newStatus]}"?`)) return;

    await updateOrderStatus(
      id,
      newStatus,
      notes || `Estado actualizado a ${newStatus}`,
      () => {
        loadOrder();
        setNotes('');
        alert('Estado actualizado exitosamente');
      },
      (err) => alert('Error: ' + err)
    );
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/admin/orders"
          className="text-blue-600 dark:text-blue-400 hover:underline mb-4 inline-block"
        >
          ← Volver a órdenes
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Orden #{order.orderNumber || order._id?.slice(-6)}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Creada el {new Date(order.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.label}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Items */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Productos ({order.items?.length || 0})
            </h2>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <img
                    src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                    alt={item.product?.name || 'Producto'}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/100?text=Sin+Imagen';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      {item.product?.name || 'Producto eliminado'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Cantidad: {item.quantity}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ${item.price.toFixed(2)} c/u
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Resumen de orden
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Envío</span>
                <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Descuento</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Impuestos</span>
                <span>${order.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between text-xl font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${order.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Información de pago
            </h2>
            <div className="space-y-3">
              <InfoRow label="Método de pago" value={order.paymentMethod || 'N/A'} />
              <InfoRow 
                label="Estado de pago" 
                value={
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                  </span>
                }
              />
              {order.paymentId && (
                <InfoRow label="ID de pago" value={order.paymentId} />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          
          {/* Customer Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Nombre</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user?.profile?.firstName} {order.user?.profile?.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Email</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {order.user?.email}
                </p>
              </div>
              {order.user?.profile?.phone && (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Teléfono</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.user.profile.phone}
                  </p>
                </div>
              )}
              {order.user && (
                <Link
                  to={`/admin/users/${order.user._id}`}
                  className="inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm"
                >
                  Ver perfil completo →
                </Link>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Dirección de envío
              </h2>
              <div className="text-gray-900 dark:text-white space-y-1">
                <p>{order.shippingAddress.street}</p>
                <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p>{order.shippingAddress.zipCode}</p>
                {order.shippingAddress.country && (
                  <p>{order.shippingAddress.country}</p>
                )}
              </div>
            </div>
          )}

          {/* Status Actions */}
          {currentStatus.nextStates.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Cambiar estado
              </h2>
              
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
              />

              <div className="space-y-2">
                {currentStatus.nextStates.map((nextState) => (
                  <button
                    key={nextState}
                    onClick={() => handleStatusChange(nextState)}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-lg transition text-sm font-medium disabled:opacity-50 ${
                      nextState === 'cancelled'
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Marcar como {statusLabels[nextState]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Historial
              </h2>
              <div className="space-y-3">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {statusLabels[history.status]}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(history.timestamp).toLocaleString('es-ES')}
                      </p>
                      {history.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {history.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS
// ==============================================================================

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}