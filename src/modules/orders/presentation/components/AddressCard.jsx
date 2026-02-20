// modules/orders/presentation/components/AddressCard.jsx

import React from 'react';

/**
 * @component AddressCard
 * @description Muestra una dirección de envío o facturación.
 * Recibe datos ya validados — no aplica reglas aquí.
 *
 * @param {Object}  props
 * @param {Object}  props.address  - Dirección (snapshot de la orden)
 * @param {string}  [props.title]  - Título del card
 * @param {boolean} [props.compact=false]
 */
export function AddressCard({ address, title, compact = false }) {
  if (!address) {
    return (
      <p className="text-sm text-gray-500">No hay dirección registrada</p>
    );
  }

  const textSize = compact ? 'text-xs' : 'text-sm';

  return (
    <div>
      {title && (
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      )}
      <div className={`${textSize} text-gray-600 space-y-1`}>
        <p className="font-medium text-gray-900">
          {address.firstName} {address.lastName}
        </p>
        <p>{address.street}</p>
        <p>
          {address.city}, {address.state} {address.zipCode}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="font-medium mt-2 pt-2 border-t border-gray-200">
            📞 {address.phone}
          </p>
        )}
      </div>
    </div>
  );
}

export default AddressCard;
