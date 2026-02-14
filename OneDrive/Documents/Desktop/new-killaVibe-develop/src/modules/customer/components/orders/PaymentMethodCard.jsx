// src/modules/customer/components/orders/PaymentMethodCard.jsx

import React from 'react';

/**
 * @component PaymentMethodCard
 * @description Card de método de pago
 * 
 * @props {string} method - Método de pago
 * @props {boolean} showIcon - Mostrar icono
 */
const PaymentMethodCard = ({ method, showIcon = true }) => {
  const methods = {
    credit_card: { 
      icon: '💳', 
      label: 'Tarjeta de Crédito',
      color: 'text-blue-600'
    },
    debit_card: { 
      icon: '💳', 
      label: 'Tarjeta de Débito',
      color: 'text-green-600'
    },
    paypal: { 
      icon: '🅿️', 
      label: 'PayPal',
      color: 'text-indigo-600'
    },
    bank_transfer: { 
      icon: '🏦', 
      label: 'Transferencia Bancaria',
      color: 'text-purple-600'
    },
    cash_on_delivery: { 
      icon: '💵', 
      label: 'Pago Contra Entrega',
      color: 'text-yellow-600'
    },
  };

  const config = methods[method] || { 
    icon: '💳', 
    label: method,
    color: 'text-gray-600'
  };

  return (
    <div className="flex items-center gap-2">
      {showIcon && (
        <span className="text-2xl">{config.icon}</span>
      )}
      <span className={`font-medium ${config.color}`}>
        {config.label}
      </span>
    </div>
  );
};

export default PaymentMethodCard;