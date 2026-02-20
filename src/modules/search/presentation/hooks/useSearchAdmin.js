// modules/search/presentation/hooks/useSearchAdmin.js
//
// Hook para analíticas admin de búsqueda (requiere role admin/moderator).
// Dominio separado del hook público — diferentes permisos, diferentes datos.

import { useCallback, useEffect } from 'react';
import { useSearchStore }          from '../store/search.store.js';
import { SEARCH_LIMITS, SEARCH_DAYS } from '../../domain/search.model.js';

/**
 * @hook useSearchAdmin
 * @description Analytics de búsqueda para administradores.
 * Requiere rol admin o moderator.
 *
 * @param {Object}  [options]
 * @param {boolean} [options.autoLoad=false]
 * @param {number}  [options.days]
 * @param {number}  [options.limit]
 *
 * @returns {Object}
 */
export function useSearchAdmin({
  autoLoad = false,
  days     = SEARCH_DAYS.default,
  limit    = SEARCH_LIMITS.FAILED.default,
} = {}) {
  const {
    failedSearches,
    loadingFailed,
    failedError,
    searchStats,
    loadingStats,
    statsError,
    fetchFailedSearches,
    fetchSearchStats,
    clearError,
  } = useSearchStore();

  useEffect(() => {
    if (autoLoad) {
      fetchFailedSearches(limit, days);
      fetchSearchStats(days);
    }
  }, [autoLoad]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadFailedSearches = useCallback((customLimit = limit, customDays = days) => {
    return fetchFailedSearches(customLimit, customDays);
  }, [fetchFailedSearches, limit, days]);

  const loadSearchStats = useCallback((customDays = days) => {
    return fetchSearchStats(customDays);
  }, [fetchSearchStats, days]);

  /**
   * Recargar todos los datos admin de una vez.
   */
  const refreshAdminData = useCallback(async (customDays = days, customLimit = limit) => {
    await Promise.all([
      fetchFailedSearches(customLimit, customDays),
      fetchSearchStats(customDays),
    ]);
  }, [fetchFailedSearches, fetchSearchStats, days, limit]);

  return {
    // Fallidas
    failedSearches,
    loadingFailed,
    failedError,
    loadFailedSearches,

    // Stats
    searchStats,
    loadingStats,
    statsError,
    loadSearchStats,

    // Combinado
    refreshAdminData,
    clearError: (field) => clearError(field),
  };
}

export default useSearchAdmin;