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
      (response) => {
        const orderData = response.data || response; 
        setOrder(orderData);
      },
      (err) => {
        console.error('Error cargando orden:', err);
        alert('Error al cargar orden');
        navigate('/admin/orders');
      }
    );
  };

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

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  };

  const handleStatusChange = async (newStatus) => {
    const label = statusLabels[newStatus] || newStatus;
    if (!confirm(`¿Cambiar el estado de esta orden a "${label}"?`)) return;

    const finalNotes = notes.trim() || `Estado actualizado a ${newStatus}`;

    await updateOrderStatus(
      id,
      newStatus,
      finalNotes,
      () => {
        loadOrder();
        setNotes('');
        alert('Estado actualizado exitosamente');
      },
      (err) => {
        if (err.toString().includes('coupon')) {
          alert('Error Crítico: Esta orden tiene un cupón mal formado en la base de datos.');
        } else {
          alert('Error: ' + err);
        }
      }
    );
  };

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  const currentStatus = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header mejorado */}
        <div className="mb-8">
          <Link
            to="/admin/orders"
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold mb-6 group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a órdenes
          </Link>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${currentStatus.gradient} rounded-3xl flex items-center justify-center shadow-xl transform rotate-3`}>
                <span className="text-3xl">{currentStatus.icon}</span>
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Orden #{order.orderNumber || order._id?.slice(-6)}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium mt-1">
                  📅 {new Date(order.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <span className={`px-6 py-3 rounded-2xl text-sm font-black ${currentStatus.bg} ${currentStatus.text} border-2 ${currentStatus.border} shadow-lg`}>
              {currentStatus.label}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Items con diseño card mejorado */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">📦</span>
                Productos ({order.items?.length || 0})
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex gap-4 p-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl border-2 border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                    <img
                      src={item.productImage || item.product?.images?.[0]?.url || 'https://via.placeholder.com/100'}
                      alt={item.productName || item.product?.name || 'Producto'}
                      className="w-24 h-24 object-cover rounded-2xl shadow-md"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=Sin+Imagen';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-black text-gray-900 dark:text-white mb-2 text-lg">
                        {item.productName || item.product?.name || 'Producto sin nombre'}
                      </h3>
                      {item.sku && <p className="text-xs text-gray-500 mb-2 font-bold">SKU: {item.sku}</p>}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-bold">
                          Cantidad: {item.quantity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                          ${Number(item.unitPrice || 0).toFixed(2)} c/u
                        </p>
                        <p className="font-black text-gray-900 dark:text-white text-xl">
                          ${(Number(item.unitPrice || 0) * Number(item.quantity || 0)).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary con gradiente */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">💰</span>
                Resumen de orden
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Subtotal</span>
                  <span className="font-bold">${Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Envío</span>
                  <span className="font-bold">${Number(order.shippingCost || 0).toFixed(2)}</span>
                </div>
                {Number(order.discountAmount) > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Descuento</span>
                    <span className="font-bold">-${Number(order.discountAmount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400 font-medium">
                  <span>Impuestos</span>
                  <span className="font-bold">${Number(order.taxAmount || 0).toFixed(2)}</span>
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-2xl shadow-lg flex justify-between items-center">
                    <span className="text-xl font-black">Total</span>
                    <span className="text-3xl font-black">${Number(order.totalAmount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">💳</span>
                Información de pago
              </h2>
              <div className="space-y-4">
                <InfoRow label="Método de pago" value={order.paymentMethod || 'N/A'} />
                <InfoRow 
                  label="Estado de pago" 
                  value={
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                      order.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-2 border-green-300 dark:border-green-700'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-2 border-yellow-300 dark:border-yellow-700'
                    }`}>
                      {order.paymentStatus === 'paid' ? '✅ Pagado' : '⏳ Pendiente'}
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
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-3xl">👤</span>
                Cliente
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">Nombre</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {order.customerInfo?.firstName || order.user?.profile?.firstName} {order.customerInfo?.lastName || order.user?.profile?.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">Email</p>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {order.customerInfo?.email || order.user?.email}
                  </p>
                </div>
                {(order.customerInfo?.phone || order.user?.profile?.phone) && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 font-bold uppercase tracking-wider">Teléfono</p>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {order.customerInfo?.phone || order.user?.profile?.phone}
                    </p>
                  </div>
                )}
                {order.user && (
                  <Link
                    to={`/admin/users/${order.user._id}`}
                    className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-bold group"
                  >
                    Ver perfil completo
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">🏠</span>
                  Dirección de envío
                </h2>
                <div className="text-gray-900 dark:text-white space-y-2">
                  <p className="font-black text-lg">{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p className="font-medium">{order.shippingAddress.street}</p>
                  <p className="font-medium">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                  <p className="font-medium">{order.shippingAddress.zipCode}</p>
                  {order.shippingAddress.country && (
                    <p className="font-medium">{order.shippingAddress.country}</p>
                  )}
                </div>
              </div>
            )}

            {/* Status Actions */}
            {currentStatus.nextStates.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">⚡</span>
                  Cambiar estado
                </h2>
                
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales (opcional)..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                />

                <div className="space-y-3">
                  {currentStatus.nextStates.map((nextState) => (
                    <button
                      key={nextState}
                      onClick={() => handleStatusChange(nextState)}
                      disabled={loading}
                      className={`w-full px-6 py-4 rounded-2xl transition-all text-sm font-black disabled:opacity-50 shadow-lg transform hover:scale-105 disabled:hover:scale-100 ${
                        nextState === 'cancelled'
                          ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                      }`}
                    >
                      Marcar como {statusLabels[nextState]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline / History */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  Historial
                </h2>
                <div className="space-y-4">
                  {order.statusHistory.map((history, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-3 h-3 mt-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg"></div>
                      <div className="flex-1 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                        <p className="font-black text-gray-900 dark:text-white text-lg">
                          {statusLabels[history.status] || history.status}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mt-1">
                          📅 {new Date(history.timestamp).toLocaleString('es-ES')}
                        </p>
                        {history.notes && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                            "{history.notes}"
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
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600 dark:text-gray-400 font-medium">{label}</span>
      <span className="font-bold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}