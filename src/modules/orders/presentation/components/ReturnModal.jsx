// modules/orders/presentation/components/ReturnModal.jsx

import React, { useState } from 'react';
import { validateReturnReason } from '../../domain/order.rules.js';

/**
 * @component ReturnModal
 * @description Modal para solicitar devolución de una orden.
 * Valida la razón usando la regla de dominio (min 10 chars).
 *
 * @param {Object}   props
 * @param {Function} props.onClose         - Cerrar modal
 * @param {Function} props.onSubmit        - (reason: string) => Promise<void>
 * @param {boolean}  [props.isSubmitting=false]
 * @param {string}   [props.errorMessage]  - Error desde el store
 */
export function ReturnModal({ onClose, onSubmit, isSubmitting = false, errorMessage }) {
  const [reason, setReason] = useState('');

  const validation = validateReturnReason(reason);
  const isValid    = validation.valid;

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) return;
    await onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-900">Solicitar Devolución</h3>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Info */}
        <p className="text-sm text-gray-600 mb-4">
          Explica el motivo de tu devolución. Mínimo 10 caracteres.
        </p>

        {/* Error del servidor */}
        {errorMessage && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {/* Textarea */}
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Ej: El producto llegó en mal estado, talla incorrecta, etc."
          maxLength={500}
          disabled={isSubmitting}
          rows={4}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed transition-shadow"
        />

        {/* Counter + validation */}
        <div className="flex justify-between items-center mt-1.5 mb-5">
          <p className={`text-xs ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
            {isValid ? '✓ Razón válida' : `Mínimo 10 caracteres`}
          </p>
          <p className="text-xs text-gray-400">{reason.length} / 500</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid}
            className="flex-1 bg-orange-600 text-white py-2.5 rounded-lg font-semibold text-sm
              hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-semibold text-sm
              hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReturnModal;
