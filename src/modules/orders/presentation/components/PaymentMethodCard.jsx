// modules/orders/presentation/components/PaymentMethodCard.jsx

import React from 'react';
import { PAYMENT_METHOD_LABELS } from '../../domain/order.model.js';

const PAYMENT_ICONS = {
  credit_card:      { icon: '💳', color: 'text-blue-600'   },
  debit_card:       { icon: '💳', color: 'text-green-600'  },
  paypal:           { icon: '🅿️', color: 'text-indigo-600' },
  bank_transfer:    { icon: '🏦', color: 'text-purple-600' },
  cash_on_delivery: { icon: '💵', color: 'text-yellow-600' },
};

/**
 * @component PaymentMethodCard
 * @description Muestra el método de pago con icono y label.
 *
 * @param {Object}  props
 * @param {string}  props.method         - Valor del método de pago
 * @param {boolean} [props.showIcon=true]
 */
export function PaymentMethodCard({ method, showIcon = true }) {
  const config = PAYMENT_ICONS[method] ?? { icon: '💳', color: 'text-gray-600' };
  const label  = PAYMENT_METHOD_LABELS[method] ?? method;

  return (
    <div className="flex items-center gap-2">
      {showIcon && <span className="text-2xl">{config.icon}</span>}
      <span className={`font-medium ${config.color}`}>{label}</span>
    </div>
  );
}

export default PaymentMethodCard;
