// modules/orders/presentation/components/OrderCard.jsx

import React from 'react';
import { OrderStatusBadge } from './OrderStatusBadge.jsx';

/**
 * @component OrderCard
 * @description Card de orden en el listado.
 * Recibe datos ya validados. No toma decisiones de dominio.
 *
 * @param {Object}    props
 * @param {OrderEntity} props.order
 * @param {Function}  props.onViewDetails       - () => void
 * @param {Function}  [props.onCancel]          - () => void
 * @param {boolean}   [props.isCancelling=false]
 * @param {boolean}   [props.isCurrentCancelling=false] - Esta card específica está cancelando
 */
export function OrderCard({
  order,
  onViewDetails,
  onCancel,
  isCancelling         = false,
  isCurrentCancelling  = false,
}) {
  const showCancel = order.canBeCancelled && !!onCancel;
  const previewItems = order.items.slice(0, 3);
  const extraItems   = order.items.length - 3;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.itemsCount} {order.itemsCount === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <OrderStatusBadge status={order.status} type="order" />
      </div>

      {/* Preview de items */}
      {previewItems.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {previewItems.map((item, idx) => (
            <div key={idx} className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-xl">
                  📦
                </div>
              )}
            </div>
          ))}
          {extraItems > 0 && (
            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-xs font-semibold text-gray-600">
              +{extraItems}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-4">
        <div>
          <span className="text-sm text-gray-500">Total:</span>
          <span className="font-bold text-xl ml-2 text-green-600">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-2">
          {showCancel && (
            <button
              onClick={onCancel}
              disabled={isCancelling}
              className="px-4 py-2 border border-red-500 text-red-600 rounded-lg text-sm font-medium
                hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCurrentCancelling ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
          <button
            onClick={onViewDetails}
            disabled={isCancelling && isCurrentCancelling}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium
              hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
