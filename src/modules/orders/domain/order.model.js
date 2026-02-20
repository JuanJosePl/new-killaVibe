// modules/orders/domain/order.model.js
// Constantes del dominio Order. Espeja exactamente los enums del backend (order.model.js).
// Este archivo es el contrato inmutable del dominio en frontend.

/**
 * Estados válidos de la orden (order.status)
 * Espeja: orderSchema.status.enum.values
 */
export const ORDER_STATUS = Object.freeze({
  PENDING:    'pending',
  CONFIRMED:  'confirmed',
  PROCESSING: 'processing',
  SHIPPED:    'shipped',
  DELIVERED:  'delivered',
  CANCELLED:  'cancelled',
  RETURNED:   'returned',
});

/**
 * Estados válidos de pago (order.paymentStatus)
 * Espeja: orderSchema.paymentStatus.enum.values
 */
export const PAYMENT_STATUS = Object.freeze({
  PENDING:  'pending',
  PAID:     'paid',
  FAILED:   'failed',
  REFUNDED: 'refunded',
});

/**
 * Métodos de pago válidos (order.paymentMethod)
 * Espeja: orderSchema.paymentMethod.enum.values
 */
export const PAYMENT_METHOD = Object.freeze({
  CREDIT_CARD:       'credit_card',
  DEBIT_CARD:        'debit_card',
  PAYPAL:            'paypal',
  BANK_TRANSFER:     'bank_transfer',
  CASH_ON_DELIVERY:  'cash_on_delivery',
});

/**
 * Métodos de envío soportados
 */
export const SHIPPING_METHOD = Object.freeze({
  STANDARD: 'standard',
  EXPRESS:  'express',
  PICKUP:   'pickup',
});

/**
 * Grupos de estado para filtrado y UI
 */
export const ORDER_STATUS_GROUPS = Object.freeze({
  ACTIVE:   [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.SHIPPED],
  TERMINAL: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED],
  CANCELLABLE: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED],
});

/**
 * Labels de display para estados de orden (español)
 */
export const ORDER_STATUS_LABELS = Object.freeze({
  [ORDER_STATUS.PENDING]:    'Pendiente',
  [ORDER_STATUS.CONFIRMED]:  'Confirmado',
  [ORDER_STATUS.PROCESSING]: 'En proceso',
  [ORDER_STATUS.SHIPPED]:    'Enviado',
  [ORDER_STATUS.DELIVERED]:  'Entregado',
  [ORDER_STATUS.CANCELLED]:  'Cancelado',
  [ORDER_STATUS.RETURNED]:   'Devuelto',
});

/**
 * Labels de display para estados de pago
 */
export const PAYMENT_STATUS_LABELS = Object.freeze({
  [PAYMENT_STATUS.PENDING]:  'Pendiente',
  [PAYMENT_STATUS.PAID]:     'Pagado',
  [PAYMENT_STATUS.FAILED]:   'Fallido',
  [PAYMENT_STATUS.REFUNDED]: 'Reembolsado',
});

/**
 * Labels de display para métodos de pago
 */
export const PAYMENT_METHOD_LABELS = Object.freeze({
  [PAYMENT_METHOD.CREDIT_CARD]:      'Tarjeta de Crédito',
  [PAYMENT_METHOD.DEBIT_CARD]:       'Tarjeta de Débito',
  [PAYMENT_METHOD.PAYPAL]:           'PayPal',
  [PAYMENT_METHOD.BANK_TRANSFER]:    'Transferencia Bancaria',
  [PAYMENT_METHOD.CASH_ON_DELIVERY]: 'Pago Contra Entrega',
});

/**
 * Colores de badge por estado de orden (clases Tailwind)
 */
export const ORDER_STATUS_COLORS = Object.freeze({
  [ORDER_STATUS.PENDING]:    { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  [ORDER_STATUS.CONFIRMED]:  { bg: 'bg-blue-100',   text: 'text-blue-800',   border: 'border-blue-200'   },
  [ORDER_STATUS.PROCESSING]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  [ORDER_STATUS.SHIPPED]:    { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  [ORDER_STATUS.DELIVERED]:  { bg: 'bg-green-100',  text: 'text-green-800',  border: 'border-green-200'  },
  [ORDER_STATUS.CANCELLED]:  { bg: 'bg-red-100',    text: 'text-red-800',    border: 'border-red-200'    },
  [ORDER_STATUS.RETURNED]:   { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
});

/**
 * Colores de badge por estado de pago (clases Tailwind)
 */
export const PAYMENT_STATUS_COLORS = Object.freeze({
  [PAYMENT_STATUS.PENDING]:  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  [PAYMENT_STATUS.PAID]:     { bg: 'bg-green-100',  text: 'text-green-800'  },
  [PAYMENT_STATUS.FAILED]:   { bg: 'bg-red-100',    text: 'text-red-800'    },
  [PAYMENT_STATUS.REFUNDED]: { bg: 'bg-gray-100',   text: 'text-gray-800'   },
});

/**
 * Máximo de días permitidos para solicitar devolución
 * Espeja: order.service.js#requestReturn (thirtyDaysAgo)
 */
export const RETURN_WINDOW_DAYS = 30;

/**
 * Límites de paginación (espeja order.validation.js)
 */
export const PAGINATION_DEFAULTS = Object.freeze({
  page:  1,
  limit: 10,
  sortBy:    'createdAt',
  sortOrder: 'desc',
});