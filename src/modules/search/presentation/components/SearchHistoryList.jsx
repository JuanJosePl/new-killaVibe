// modules/search/presentation/components/SearchHistoryList.jsx
//
// Muestra el historial personal de búsquedas del usuario.
// Datos ya mapeados a SearchHistoryEntity — sin transformaciones.

import React from 'react';

/**
 * @component SearchHistoryList
 * @description Historial personal de búsquedas del usuario autenticado.
 *
 * @param {Object}   props
 * @param {SearchHistoryEntity[]} props.history
 * @param {Function} props.onSelect       - (query: string) => void
 * @param {boolean}  [props.isLoading=false]
 * @param {string}   [props.error]
 */
export function SearchHistoryList({ history, onSelect, isLoading = false, error }) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-500 text-center py-4">
        {error?.message ?? 'No se pudo cargar el historial'}
      </p>
    );
  }

  if (!history.length) {
    return <p className="text-sm text-gray-500 text-center py-4">Tu historial de búsquedas aparecerá aquí</p>;
  }

  return (
    <ul className="space-y-1">
      {history.map((item) => (
        <li key={item._id}>
          <button
            onClick={() => onSelect(item.query)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg
              text-left hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-base flex-shrink-0">🕐</span>
              <span className={`text-sm truncate group-hover:text-blue-600 transition-colors ${
                item.wasFailed ? 'text-red-500 line-through' : 'text-gray-800'
              }`}>
                {item.query}
              </span>
              {item.wasFailed && (
                <span className="text-xs text-red-400 flex-shrink-0">sin resultados</span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {item.clicked && (
                <span className="text-xs text-green-500" title="Hiciste clic en un resultado">✓</span>
              )}
              {item.createdAt && (
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(item.createdAt)}
                </span>
              )}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

/**
 * Formatear tiempo relativo.
 * Utilitiy local — no se importa de searchUtils para mantener independencia.
 */
function formatTimeAgo(date) {
  const now       = new Date();
  const diffMs    = now - new Date(date);
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins  <  1)  return 'Ahora';
  if (diffMins  <  60) return `Hace ${diffMins}m`;
  if (diffHours <  24) return `Hace ${diffHours}h`;
  if (diffDays  <   7) return `Hace ${diffDays}d`;
  return new Date(date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

export default SearchHistoryList;