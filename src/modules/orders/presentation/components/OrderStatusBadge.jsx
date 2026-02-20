// modules/orders/presentation/components/OrderStatusBadge.jsx

import React from 'react';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PAYMENT_STATUS_COLORS, PAYMENT_STATUS_LABELS } from '../../domain/order.model.js';

/**
 * @component OrderStatusBadge
 * @description Badge de estado para orden o pago.
 *
 * @param {Object}  props
 * @param {string}  props.status  - Valor del estado
 * @param {'order'|'payment'} props.type - Tipo de estado
 * @param {'sm'|'md'} [props.size='md']
 */
export function OrderStatusBadge({ status, type = 'order', size = 'md' }) {
  const colorMap = type === 'payment' ? PAYMENT_STATUS_COLORS : ORDER_STATUS_COLORS;
  const labelMap = type === 'payment' ? PAYMENT_STATUS_LABELS : ORDER_STATUS_LABELS;

  const colors = colorMap[status] ?? { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  const label  = labelMap[status] ?? status;

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border
        ${colors.bg} ${colors.text} ${colors.border ?? ''} ${sizeClass}`}
    >
      {label}
    </span>
  );
}

export default OrderStatusBadge;
