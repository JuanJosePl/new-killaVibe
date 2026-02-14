// src/modules/customer/components/reviews/ReviewStats.jsx

import React from 'react';

/**
 * @component ReviewStats
 * @description Estadísticas de reseñas del usuario
 * 
 * @props {number} totalReviews - Total de reseñas
 * @props {number} verifiedCount - Reseñas verificadas
 * @props {number} averageRating - Rating promedio
 */
const ReviewStats = ({ totalReviews, verifiedCount, averageRating }) => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
      <h3 className="font-semibold text-gray-900 mb-4">Tus Estadísticas ⭐</h3>
      
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-3xl font-bold text-yellow-600">{totalReviews}</p>
          <p className="text-sm text-gray-600 mt-1">Reseñas</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-green-600">{verifiedCount}</p>
          <p className="text-sm text-gray-600 mt-1">Verificadas</p>
        </div>

        <div>
          <p className="text-3xl font-bold text-orange-600">
            {averageRating > 0 ? averageRating : '-'}
          </p>
          <p className="text-sm text-gray-600 mt-1">Promedio</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewStats;


