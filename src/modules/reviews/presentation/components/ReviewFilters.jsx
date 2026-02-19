/**
 * @component ReviewFilters
 * @description Filtros avanzados para reviews.
 *
 * Recibe `currentFilters` como ReviewFilters value object.
 * No contiene lógica de negocio — solo UI.
 */

import React, { useState } from 'react';
import { ReviewFilters as ReviewFiltersModel, ReviewStats } from '../../domain/review.model.js';

const ChevronIcon = ({ down }) => (
  <svg
    className={`w-5 h-5 transition-transform ${down ? 'rotate-180' : ''}`}
    fill="none" stroke="currentColor" viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/**
 * @param {Object} props
 * @param {ReviewFiltersModel} props.currentFilters
 * @param {ReviewStats}        [props.stats]
 * @param {Function}           props.onFilterChange - (partialFilters) => void
 * @param {Function}           props.onReset        - () => void
 */
const ReviewFilters = ({ currentFilters, stats, onFilterChange, onReset }) => {
  const [expanded, setExpanded] = useState(false);

  const update = (key, value) => {
    onFilterChange({ [key]: value, page: 1 });
  };

  const hasActive = currentFilters?.hasActiveFilters ?? false;
  const pct       = stats?.percentages ?? {};

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900">Filtros</h3>
          {hasActive && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              Activos
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActive && (
            <button onClick={onReset} className="text-xs text-gray-500 hover:text-gray-800">
              Limpiar
            </button>
          )}
          <button onClick={() => setExpanded(!expanded)}>
            <ChevronIcon down={expanded} />
          </button>
        </div>
      </div>

      {/* Filtros principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Ordenar por */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Ordenar por</label>
          <select
            value={currentFilters?.sortBy ?? 'createdAt'}
            onChange={(e) => update('sortBy', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="createdAt">Más recientes</option>
            <option value="rating">Calificación</option>
            <option value="helpfulCount">Más útiles</option>
          </select>
        </div>

        {/* Orden */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Orden</label>
          <select
            value={currentFilters?.sortOrder ?? 'desc'}
            onChange={(e) => update('sortOrder', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Tipo</label>
          <select
            value={currentFilters?.verified ?? ''}
            onChange={(e) => update('verified', e.target.value || null)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas</option>
            <option value="true">Solo verificadas</option>
          </select>
        </div>
      </div>

      {/* Filtro por rating (expandido) */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <label className="block text-xs font-medium text-gray-600 mb-3">Calificación</label>
          <div className="space-y-1.5">
            {/* Todas */}
            <button
              onClick={() => update('rating', null)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                !currentFilters?.rating
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>Todas las calificaciones</span>
              {stats && <span className="text-xs text-gray-500">({stats.total})</span>}
            </button>

            {/* Por estrella */}
            {[5, 4, 3, 2, 1].map((r) => {
              const count = stats?.distribution?.[r] ?? 0;
              const p     = pct[r] ?? 0;
              const sel   = String(currentFilters?.rating) === String(r);

              return (
                <button
                  key={r}
                  onClick={() => update('rating', r)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                    sel
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    {[...Array(r)].map((_, i) => <StarIcon key={i} />)}
                    <span className="text-xs text-gray-500 ml-1">y más</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${p}%` }} />
                    </div>
                    <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags de filtros activos */}
      {hasActive && !expanded && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          {currentFilters?.rating && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {currentFilters.rating} estrellas
              <button onClick={() => update('rating', null)} className="hover:text-blue-900 ml-0.5">×</button>
            </span>
          )}
          {currentFilters?.verified === 'true' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Solo verificadas
              <button onClick={() => update('verified', null)} className="hover:text-green-900 ml-0.5">×</button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewFilters;