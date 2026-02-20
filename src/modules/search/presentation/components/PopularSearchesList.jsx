// modules/search/presentation/components/PopularSearchesList.jsx
//
// Muestra la lista de búsquedas populares.
// Datos ya procesados por el backend — NO recalcula rankings.

import React from 'react';

/**
 * @component PopularSearchesList
 * @description Lista de búsquedas populares (clickRate ya viene del backend como %).
 *
 * @param {Object}   props
 * @param {PopularSearchEntity[]} props.searches
 * @param {Function} props.onSelect      - (query: string) => void
 * @param {boolean}  [props.isLoading=false]
 * @param {boolean}  [props.showMetrics=false] - Mostrar clickRate y avgResults
 */
export function PopularSearchesList({ searches, onSelect, isLoading = false, showMetrics = false }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!searches.length) {
    return <p className="text-sm text-gray-500 text-center py-4">Sin búsquedas populares disponibles</p>;
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
              {/* Posición */}
              <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">
                {idx + 1}
              </span>
              {/* Icono de fuego para top 3 */}
              <span className="text-base flex-shrink-0">
                {idx < 3 ? '🔥' : '🔍'}
              </span>
              <span className="text-sm text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                {item.query}
              </span>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {showMetrics && (
                <>
                  {item.avgResults > 0 && (
                    <span className="text-xs text-gray-400" title="Resultados promedio">
                      ~{item.avgResults} resultados
                    </span>
                  )}
                  {item.clickRate > 0 && (
                    <span className="text-xs text-green-600 font-medium" title="Tasa de clics">
                      {item.clickRate.toFixed(1)}% CTR
                    </span>
                  )}
                </>
              )}
              <span className="text-xs text-gray-400">
                {item.count.toLocaleString('es-ES')} búsquedas
              </span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default PopularSearchesList;