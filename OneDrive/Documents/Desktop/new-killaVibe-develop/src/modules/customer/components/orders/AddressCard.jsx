// src/modules/customer/components/orders/AddressCard.jsx

import React from 'react';

/**
 * @component AddressCard
 * @description Card de dirección (shipping/billing)
 * 
 * @props {Object} address - Dirección completa
 * @props {string} title - Título del card (opcional)
 * @props {boolean} compact - Versión compacta
 */
const AddressCard = ({ address, title, compact = false }) => {
  if (!address) {
    return (
      <div className="text-gray-500 text-sm">
        No hay dirección registrada
      </div>
    );
  }

  return (
    <div className={compact ? 'text-sm' : ''}>
      {title && (
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      )}
      
      <div className="text-sm text-gray-600 space-y-1">
        <p className="font-medium text-gray-900">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="font-medium mt-2 pt-2 border-t">
            📞 {address.phone}
          </p>
        )}
        {address.email && (
          <p className="text-xs text-gray-500">
            ✉️ {address.email}
          </p>
        )}
      </div>
    </div>
  );
};

export default AddressCard;