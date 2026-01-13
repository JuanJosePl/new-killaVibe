// src/modules/customer/components/reviews/PendingReviewsAlert.jsx

import React from 'react';

/**
 * @component PendingReviewsAlert
 * @description Alerta de productos pendientes de reseña
 * 
 * @props {number} count - Cantidad de productos
 * @props {Function} onWriteReview - Callback para escribir reseña
 */
const PendingReviewsAlert = ({ count, onWriteReview }) => {
  if (count === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold text-blue-900 mb-3">
        💬 Productos Pendientes de Reseña
      </h2>
      <p className="text-blue-700 text-sm mb-4">
        Tienes {count} producto{count > 1 ? 's' : ''} que puedes reseñar
      </p>
      <button
        onClick={onWriteReview}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
      >
        Escribir Reseña
      </button>
    </div>
  );
};

export default PendingReviewsAlert;