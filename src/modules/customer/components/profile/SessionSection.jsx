// src/modules/customer/components/profile/SessionSection.jsx

import React from 'react';

/**
 * @component SessionSection
 * @description Sección de gestión de sesión
 * 
 * @props {Function} onLogout - Handler de cierre de sesión
 */
const SessionSection = ({ onLogout }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        🚪 Sesión
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Cierra tu sesión en este dispositivo
      </p>
      <button
        onClick={onLogout}
        className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 font-medium transition-colors"
      >
        Cerrar Sesión
      </button>
    </div>
  );
};

export default SessionSection;