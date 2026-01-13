// src/modules/customer/components/orders/OrderCard.jsx

import React from 'react';
import StatusBadge from '../common/StatusBadge';

/**
 * @component OrderCard
 * @description Card de orden en listado
 * 
 * @props {Object} order - Orden completa
 * @props {Function} onViewDetails - Callback para ver detalles
 * @props {Function} onCancel - Callback para cancelar
 * @props {boolean} canCancel - Si se puede cancelar
 * @props {boolean} isLoading - Estado de carga
 */
const OrderCard = ({ 
  order, 
  onViewDetails, 
  onCancel, 
  canCancel = false,
  isLoading = false 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Header: Order Info + Status */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">{order.orderNumber}</h3>
          <p className="text-sm text-gray-600">
            {new Date(order.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {order.itemsCount || order.items?.length} productos
          </p>
        </div>

        <StatusBadge status={order.status} type="order" />
      </div>

      {/* Order Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {order.items.slice(0, 3).map((item, index) => (
            <div key={index} className="w-16 h-16 bg-gray-200 rounded flex-shrink-0">
              {item.productImage ? (
                <img
                  src={item.productImage}
                  alt={item.productName}
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  📦
                </div>
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-600 text-xs font-semibold">
              +{order.items.length - 3}
            </div>
          )}
        </div>
      )}

      {/* Footer: Total + Actions */}
      <div className="flex justify-between items-center border-t pt-4">
        <div>
          <span className="text-gray-600 text-sm">Total:</span>
          <span className="font-bold text-xl ml-2 text-green-600">
            ${order.totalAmount.toFixed(2)}
          </span>
        </div>

        <div className="flex gap-2">
          {canCancel && (
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border border-red-600 text-red-600 rounded hover:bg-red-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={onViewDetails}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Ver Detalles
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;