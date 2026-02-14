// src/modules/reviews/components/ReviewStats.jsx

import React from 'react';
import { formatAverageRating, calculateRatingPercentages } from '../utils/reviewHelpers';

/**
 * @component ReviewStats
 * @description Componente de estadísticas visuales de reviews
 * Sincronizado con review.service.js -> getReviewStats
 */
const ReviewStats = ({ stats, loading = false }) => {
  
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-300 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-4 bg-gray-300 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <p className="text-gray-600">Sin calificaciones aún</p>
      </div>
    );
  }

  const { average, total, distribution, verifiedPercentage } = stats;
  const percentages = calculateRatingPercentages(distribution, total);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header - Promedio general */}
      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
        {/* Rating grande */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {formatAverageRating(average)}
          </div>
          <div className="flex items-center justify-center mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(average) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            {total} {total === 1 ? 'calificación' : 'calificaciones'}
          </p>
        </div>

        {/* Distribución de ratings */}
        <div className="flex-1">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = distribution[rating] || 0;
            const percentage = percentages[rating] || 0;

            return (
              <div key={rating} className="flex items-center gap-3 mb-2">
                {/* Rating */}
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {rating}
                  </span>
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>

                {/* Barra de progreso */}
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rating >= 4 
                        ? 'bg-green-500' 
                        : rating === 3 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Porcentaje y conteo */}
                <div className="flex items-center gap-2 w-20">
                  <span className="text-sm font-medium text-gray-700">
                    {percentage}%
                  </span>
                  <span className="text-xs text-gray-500">
                    ({count})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer - Badge de verificados */}
      {verifiedPercentage > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm">
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span className="text-gray-700">
            <strong>{verifiedPercentage}%</strong> de las reviews son de compras verificadas
          </span>
        </div>
      )}
    </div>
  );
};

export default ReviewStats;