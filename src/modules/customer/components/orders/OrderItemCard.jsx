// src/modules/customer/components/orders/OrderItemCard.jsx

import React from 'react';

/**
 * @component OrderItemCard
 * @description Card de item dentro de una orden
 * 
 * @props {Object} item - Item de la orden
 * @props {boolean} showTotal - Mostrar total del item
 */
const OrderItemCard = ({ item, showTotal = true }) => {
  return (
    <div className="flex gap-4 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Product Image */}
      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0">
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

      {/* Product Info */}
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{item.productName}</h4>
        
        {/* SKU */}
        {item.sku && (
          <p className="text-xs text-gray-500 mt-1">SKU: {item.sku}</p>
        )}

        {/* Attributes (size, color, etc) */}
        {item.attributes && Object.keys(item.attributes).length > 0 && (
          <div className="flex gap-2 mt-1">
            {Object.entries(item.attributes).map(([key, value]) => (
              <span key={key} className="text-xs bg-gray-100 px-2 py-1 rounded">
                {key}: {value}
              </span>
            ))}
          </div>
        )}

        {/* Price & Quantity */}
        <div className="flex items-center gap-4 mt-2">
          <span className="text-sm text-gray-600">
            Cantidad: <span className="font-semibold">{item.quantity}</span>
          </span>
          <span className="text-sm font-semibold text-gray-900">
            ${item.unitPrice.toFixed(2)} c/u
          </span>
        </div>
      </div>

      {/* Item Total */}
      {showTotal && (
        <div className="text-right">
          <p className="font-bold text-lg text-gray-900">
            ${(item.unitPrice * item.quantity).toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderItemCard;