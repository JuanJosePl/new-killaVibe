// modules/orders/presentation/components/OrderItemCard.jsx

import React from 'react';

/**
 * @component OrderItemCard
 * @description Muestra un item de una orden (snapshot inmutable del backend).
 * No transforma ni recalcula. Muestra unitPrice * quantity tal como viene.
 *
 * @param {Object}  props
 * @param {Object}  props.item        - Item de la orden
 * @param {boolean} [props.showTotal=true]
 */
export function OrderItemCard({ item, showTotal = true }) {
  const lineTotal = item.unitPrice * item.quantity;

  return (
    <div className="flex gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
      {/* Imagen */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
        {item.productImage ? (
          <img
            src={item.productImage}
            alt={item.productName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 truncate">{item.productName}</h4>

        {item.sku && (
          <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>
        )}

        {/* Atributos (size, color, material) */}
        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(item.attributes)
              .filter(([, v]) => v)
              .map(([key, value]) => (
                <span key={key} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  {key}: {value}
                </span>
              ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm text-gray-600">
            Cant: <strong>{item.quantity}</strong>
          </span>
          <span className="text-sm font-medium text-gray-900">
            ${item.unitPrice.toFixed(2)} c/u
          </span>
        </div>
      </div>

      {/* Total del item */}
      {showTotal && (
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-gray-900">${lineTotal.toFixed(2)}</p>
        </div>
      )}
    </div>
  );
}

export default OrderItemCard;
