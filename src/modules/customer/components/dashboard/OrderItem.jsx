// src/modules/customer/components/dashboard/OrderItem.jsx

import React from 'react';
import StatusBadge from '../common/StatusBadge';

/**
 * @component OrderItem
 * @description Item de orden mejorado con diseño moderno y animaciones
 * 
 * @props {Object} order - Orden
 * @props {Function} onClick - Callback al hacer click
 */
const OrderItem = ({ order, onClick }) => {
  const getStatusIcon = (status) => {
    const icons = {
      pending: '⏳',
      confirmed: '✓',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌',
      returned: '↩️',
    };
    return icons[status] || '📦';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      onClick={onClick}
      className="group relative flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
    >
      {/* Status Icon */}
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
        {getStatusIcon(order.status)}
      </div>

      {/* Order Info */}
      <div className="flex-1 min-w-0">
        {/* Order Number */}
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {order.orderNumber}
          </p>
          <StatusBadge status={order.status} type="order" size="sm" />
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            📅 {formatDate(order.createdAt)}
          </span>
          <span className="text-gray-300">•</span>
          <span className="flex items-center gap-1">
            🕐 {formatTime(order.createdAt)}
          </span>
        </div>

        {/* Items Count */}
        {order.itemsCount && (
          <p className="text-xs text-gray-500 mt-1">
            {order.itemsCount} producto{order.itemsCount !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className="text-2xl font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          ${order.totalAmount.toFixed(2)}
        </p>
        
        {/* Payment Status */}
        {order.paymentStatus && (
          <div className="mt-1">
            <StatusBadge status={order.paymentStatus} type="payment" size="sm" />
          </div>
        )}
      </div>

      {/* Arrow Indicator */}
      <svg 
        className="w-6 h-6 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
    </div>
  );
};

export default OrderItem;