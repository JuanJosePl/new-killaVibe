// modules/search/presentation/hooks/useSearchHistory.js
//
// Hook para historial personal de búsquedas del usuario autenticado.
// Separado de useSearch porque requiere auth y tiene ciclo de vida distinto.

import { useCallback, useEffect } from 'react';
import { useSearchStore }          from '../store/search.store.js';
import { SEARCH_LIMITS }           from '../../domain/search.model.js';

/**
 * @hook useSearchHistory
 * @description Historial de búsqueda personal (requiere usuario autenticado).
 *
 * @param {Object}  [options]
 * @param {boolean} [options.autoLoad=false]  - Cargar al montar
 * @param {number}  [options.limit]
 *
 * @returns {Object}
 */
export function useSearchHistory({
  autoLoad = false,
  limit    = SEARCH_LIMITS.HISTORY.default,
} = {}) {
  const {
    searchHistory,
    loadingHistory,
    historyError,
    fetchUserSearchHistory,
    clearError,
  } = useSearchStore();

  useEffect(() => {
    if (autoLoad) {
      fetchUserSearchHistory(limit);
    }
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadHistory = useCallback((customLimit = limit) => {
    return fetchUserSearchHistory(customLimit);
  }, [fetchUserSearchHistory, limit]);

  const refreshHistory = useCallback(() => {
    return fetchUserSearchHistory(limit);
  }, [fetchUserSearchHistory, limit]);

  return {
    history:        searchHistory,
    isLoading:      loadingHistory,
    error:          historyError,
    loadHistory,
    refreshHistory,
    clearError: () => clearError('historyError'),
  };
}

export default useSearchHistory;