// src/modules/customer/components/orders/ReturnModal.jsx

import React from 'react';

/**
 * @component ReturnModal
 * @description Modal para solicitar devolución
 * 
 * @props {Function} onClose - Cerrar modal
 * @props {Function} onSubmit - Enviar solicitud
 * @props {string} returnReason - Razón de devolución
 * @props {Function} setReturnReason - Actualizar razón
 * @props {boolean} isSubmitting - Estado de envío
 */
const ReturnModal = ({ 
  onClose, 
  onSubmit, 
  returnReason, 
  setReturnReason, 
  isSubmitting 
}) => {
  const isValid = returnReason.trim().length >= 10;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-lg w-full p-6">
        {/* Header */}
        <h3 className="text-xl font-bold mb-4">Solicitar Devolución</h3>
        
        {/* Info */}
        <p className="text-gray-600 mb-4">
          Por favor, explica la razón de tu devolución (mínimo 10 caracteres)
        </p>

        {/* Textarea */}
        <textarea
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Ejemplo: El producto llegó en mal estado, talla incorrecta, etc."
          className="w-full border rounded-lg p-3 h-32 focus:ring-2 focus:ring-orange-500 resize-none"
          disabled={isSubmitting}
          maxLength={500}
        />

        {/* Character count */}
        <div className="flex justify-between items-center mt-2">
          <p className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
            {isValid ? '✓ Razón válida' : `Mínimo 10 caracteres`}
          </p>
          <p className="text-sm text-gray-500">
            {returnReason.length} / 500
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !isValid}
            className="flex-1 bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;