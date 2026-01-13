// src/modules/customer/components/profile/SecuritySection.jsx

import React from 'react';

/**
 * @component SecuritySection
 * @description Sección de seguridad (cambiar contraseña)
 * 
 * ✅ ACTUALIZADO: Muestra información sobre último cambio de contraseña
 * 
 * @props {Function} onChangePassword - Handler de cambio de contraseña
 * @props {Date} [lastPasswordChange] - Fecha del último cambio (opcional)
 */
const SecuritySection = ({ onChangePassword, lastPasswordChange }) => {
  // Calcular días desde último cambio
  const daysSinceChange = lastPasswordChange
    ? Math.floor((Date.now() - new Date(lastPasswordChange).getTime()) / (1000 * 60 * 60 * 24))
    : null;

  // Determinar si necesita cambiar contraseña (más de 90 días)
  const needsPasswordChange = daysSinceChange && daysSinceChange > 90;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
          🔒
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Seguridad</h3>
          <p className="text-sm text-gray-500">Protege tu cuenta</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Mantén tu cuenta segura actualizando tu contraseña regularmente
        </p>

        {/* Last Password Change Info */}
        {daysSinceChange !== null && (
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Último cambio:</span>
              <span className="text-sm font-medium text-gray-900">
                Hace {daysSinceChange} {daysSinceChange === 1 ? 'día' : 'días'}
              </span>
            </div>
          </div>
        )}

        {/* Warning if needed */}
        {needsPasswordChange && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg animate-pulse">
            <div className="flex items-start gap-2">
              <span className="text-yellow-600 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800">
                  Recomendación de Seguridad
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Te recomendamos cambiar tu contraseña cada 90 días para mayor seguridad
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Button */}
        <button
          onClick={onChangePassword}
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
        >
          <span className="group-hover:scale-110 transition-transform">🔑</span>
          <span>Cambiar Contraseña</span>
        </button>

        {/* Security Tips */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            💡 Tips de Seguridad:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Usa contraseñas únicas y complejas</li>
            <li>• Nunca compartas tu contraseña</li>
            <li>• Habilita verificación en dos pasos (próximamente)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;