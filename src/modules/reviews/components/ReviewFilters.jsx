// src/modules/reviews/components/ReviewFilters.jsx

import React, { useState } from 'react';
import { SORT_OPTIONS, SORT_ORDER, RATING_VALUES } from '../types/review.types';

/**
 * @component ReviewFilters
 * @description Filtros avanzados para reviews
 * Sincronizado con review.validation.js -> getProductReviews query params
 */
const ReviewFilters = ({ 
  currentFilters = {}, 
  onFilterChange,
  onReset,
  stats = null 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...currentFilters,
      [key]: value,
      page: 1 // Reset a página 1 al cambiar filtros
    });
  };

  const handleReset = () => {
    onReset();
  };

  const hasActiveFilters = () => {
    return currentFilters.rating || 
           currentFilters.verified === 'true' || 
           currentFilters.sortBy !== 'createdAt' ||
           currentFilters.sortOrder !== 'desc';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
          {hasActiveFilters() && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Activos
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={handleReset}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filtros principales (siempre visibles) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ordenar por */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ordenar por
          </label>
          <select
            value={currentFilters.sortBy || 'createdAt'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Más recientes</option>
            <option value="rating">Calificación</option>
            <option value="helpfulCount">Más útiles</option>
          </select>
        </div>

        {/* Orden */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Orden
          </label>
          <select
            value={currentFilters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        {/* Solo verificados */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo
          </label>
          <select
            value={currentFilters.verified || ''}
            onChange={(e) => handleFilterChange('verified', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="true">Solo verificadas</option>
          </select>
        </div>
      </div>

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* Filtrar por rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Calificación
            </label>
            
            <div className="space-y-2">
              <button
                onClick={() => handleFilterChange('rating', '')}
                className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg transition-colors ${
                  !currentFilters.rating 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span>Todas las calificaciones</span>
                {stats && (
                  <span className="text-sm text-gray-600">({stats.total})</span>
                )}
              </button>

              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats?.distribution?.[rating] || 0;
                const percentage = stats?.total > 0 
                  ? Math.round((count / stats.total) * 100) 
                  : 0;

                return (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('rating', rating.toString())}
                    className={`w-full flex items-center justify-between px-4 py-2 border rounded-lg transition-colors ${
                      currentFilters.rating === rating.toString()
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {/* Estrellas */}
                      <div className="flex items-center">
                        {[...Array(rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm">y más</span>
                    </div>

                    {/* Barra de progreso y conteo */}
                    <div className="flex items-center gap-3">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-yellow-400 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {count}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Indicador de filtros activos */}
      {hasActiveFilters() && !isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {currentFilters.rating && (
              <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {currentFilters.rating} estrellas
                <button
                  onClick={() => handleFilterChange('rating', '')}
                  className="ml-2 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {currentFilters.verified === 'true' && (
              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Solo verificadas
                <button
                  onClick={() => handleFilterChange('verified', '')}
                  className="ml-2 hover:text-green-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;