// modules/orders/presentation/components/OrderSummary.jsx
//
// Muestra el desglose de totales de una orden.
// NUNCA recalcula totales — los muestra tal como vienen del backend.

import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

/**
 * @component OrderSummary
 * @description Resumen financiero de una orden (totales precalculados por backend).
 *
 * @param {Object}  props
 * @param {OrderEntity} props.order
 * @param {boolean} [props.showPaymentStatus=true]
 */
export function OrderSummary({ order, showPaymentStatus = true }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen de Orden</h2>

      <div className="space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>

        {/* Descuento */}
        {order.discountAmount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento</span>
            <span>-${order.discountAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Cupón */}
        {order.coupon?.code && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Cupón: {order.coupon.code}</span>
            <span>{order.coupon.type === 'percentage' ? `${order.coupon.discount}%` : `-$${order.coupon.discount}`}</span>
          </div>
        )}

        {/* Envío */}
        <div className="flex justify-between text-gray-600">
          <span>Envío</span>
          <span>
            {order.shippingCost === 0
              ? <span className="text-green-600 font-medium">Gratis</span>
              : `$${order.shippingCost.toFixed(2)}`
            }
          </span>
        </div>

        {/* Método de envío */}
        {order.shippingMethod && (
          <div className="flex justify-between text-sm text-gray-500">
            <span>Método de envío</span>
            <span className="capitalize">{order.shippingMethod}</span>
          </div>
        )}

        {/* Impuestos */}
        {order.taxAmount > 0 && (
          <div className="flex justify-between text-gray-600">
            <span>Impuestos</span>
            <span>${order.taxAmount.toFixed(2)}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-3 mt-2">
          <span>Total</span>
          <span className="text-green-600">${order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Reembolsado */}
        {order.refundAmount > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>Reembolsado</span>
            <span>-${order.refundAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Estado de pago */}
      {showPaymentStatus && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">Estado de pago</p>
          <OrderStatusBadge status={order.paymentStatus} type="payment" />
        </div>
      )}
    </div>
  );
}

export default OrderSummary;
