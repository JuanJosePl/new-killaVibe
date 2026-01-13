// src/modules/customer/components/orders/OrderSummary.jsx

import React from 'react';
import StatusBadge from '../common/StatusBadge';

/**
 * @component OrderSummary
 * @description Resumen de orden (precios y totales)
 * 
 * @props {Object} order - Orden completa
 * @props {boolean} showPaymentStatus - Mostrar estado de pago
 */
const OrderSummary = ({ order, showPaymentStatus = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Resumen de Orden</h2>

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
        </div>

        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {order.coupon && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Cupón: {order.coupon.code}</span>
            <span>-{order.coupon.discount}%</span>
          </div>
        )}

        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span>${order.shippingCost?.toFixed(2) || '0.00'}</span>
        </div>

        {order.shippingMethod && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Método: {order.shippingMethod}</span>
          </div>
        )}

        {order.taxAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Impuestos</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between font-bold text-lg border-t pt-3">
          <span>Total</span>
          <span className="text-green-600">
            ${order.totalAmount?.toFixed(2) || '0.00'}
          </span>
        </div>
      </div>

      {/* Payment Status */}
      {showPaymentStatus && order.paymentStatus && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Estado de Pago</p>
          <StatusBadge status={order.paymentStatus} type="payment" />
        </div>
      )}
    </div>
  );
};

export default OrderSummary;