// src/modules/customer/components/profile/DangerZone.jsx

import React from 'react';

/**
 * @component DangerZone
 * @description Zona de acciones peligrosas (eliminar cuenta)
 * 
 * @props {Function} onDeleteAccount - Handler de eliminación de cuenta
 */
const DangerZone = ({ onDeleteAccount }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
      <h3 className="text-lg font-semibold mb-2 text-red-600 flex items-center gap-2">
        ⚠️ Zona de Peligro
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Esta acción es irreversible. Tu cuenta y todos tus datos serán eliminados permanentemente.
      </p>
      <button
        onClick={onDeleteAccount}
        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors"
      >
        Eliminar Cuenta
      </button>
    </div>
  );
};

export default DangerZone;