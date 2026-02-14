// src/modules/customer/components/common/ConfirmDialog.jsx

import React from 'react';

/**
 * @component ConfirmDialog
 * @description Diálogo de confirmación reutilizable
 * 
 * @props {boolean} isOpen - Si el diálogo está abierto
 * @props {string} title - Título del diálogo
 * @props {string} message - Mensaje descriptivo
 * @props {string} confirmText - Texto del botón confirmar
 * @props {string} cancelText - Texto del botón cancelar
 * @props {Function} onConfirm - Callback al confirmar
 * @props {Function} onCancel - Callback al cancelar
 * @props {boolean} isLoading - Estado de carga
 * @props {string} type - Tipo (danger, warning, info)
 */
const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  isLoading = false,
  type = 'warning',
}) => {
  if (!isOpen) return null;

  const typeConfig = {
    danger: {
      icon: '⚠️',
      confirmClass: 'bg-red-600 hover:bg-red-700',
      bgClass: 'bg-red-50 border-red-200',
    },
    warning: {
      icon: '❗',
      confirmClass: 'bg-yellow-600 hover:bg-yellow-700',
      bgClass: 'bg-yellow-50 border-yellow-200',
    },
    info: {
      icon: 'ℹ️',
      confirmClass: 'bg-blue-600 hover:bg-blue-700',
      bgClass: 'bg-blue-50 border-blue-200',
    },
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Icon */}
        <div className={`w-16 h-16 rounded-full ${config.bgClass} border flex items-center justify-center mx-auto mb-4`}>
          <span className="text-4xl">{config.icon}</span>
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.confirmClass}`}
          >
            {isLoading ? 'Procesando...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;