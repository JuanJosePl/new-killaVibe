// modules/search/presentation/components/TrendingSearchesList.jsx
//
// Muestra búsquedas en tendencia.
// trendScore ya viene calculado por el backend — frontend solo clasifica para display.

import React from 'react';

/**
 * @component TrendingSearchesList
 * @description Lista de búsquedas en tendencia.
 * trendLevel es calculado en TrendingSearchEntity a partir del trendScore del backend.
 *
 * @param {Object}   props
 * @param {TrendingSearchEntity[]} props.searches
 * @param {Function} props.onSelect
 * @param {boolean}  [props.isLoading=false]
 */
export function TrendingSearchesList({ searches, onSelect, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!searches.length) {
    return <p className="text-sm text-gray-500 text-center py-4">Sin tendencias disponibles en este momento</p>;
  }

  return (
    <ul className="space-y-1">
      {searches.map((item, idx) => (
        <li key={idx}>
          <button
            onClick={() => onSelect(item.query)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
              text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base flex-shrink-0">📈</span>
              <span className="text-sm text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                {item.query}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Badge de nivel de tendencia — solo display, NO recalcula score */}
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${item.trendLevel.color}20`,
                  color:           item.trendLevel.color,
                }}
              >
                {item.trendLevel.label}
              </span>
              <span className="text-xs text-gray-400">
                {item.recentCount} recientes
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default TrendingSearchesList;