// modules/search/presentation/hooks/useSearch.js
//
// Hook de lectura para datos públicos de búsqueda.
// Maneja: sugerencias (con debounce), populares, tendencias.
// Conecta UI → store → service. Sin lógica de dominio.

import { useCallback, useEffect, useRef } from 'react';
import { useSearchStore }                  from '../store/search.store.js';
import { SUGGESTIONS_DEBOUNCE_MS, SEARCH_LIMITS, SEARCH_DAYS } from '../../domain/search.model.js';

/**
 * @hook useSearch
 * @description Datos públicos de búsqueda.
 *
 * @param {Object}  [options]
 * @param {boolean} [options.withPopular=false]  - Cargar populares al montar
 * @param {boolean} [options.withTrending=false] - Cargar tendencias al montar
 * @param {number}  [options.popularLimit]
 * @param {number}  [options.popularDays]
 * @param {number}  [options.trendingLimit]
 *
 * @returns {Object}
 */
export function useSearch({
  withPopular   = false,
  withTrending  = false,
  popularLimit  = SEARCH_LIMITS.POPULAR.default,
  popularDays   = SEARCH_DAYS.default,
  trendingLimit = SEARCH_LIMITS.TRENDING.default,
} = {}) {
  const {
    suggestions,
    loadingSuggestions,
    suggestionsError,
    popularSearches,
    loadingPopular,
    popularError,
    trendingSearches,
    loadingTrending,
    trendingError,
    activeQuery,
    navigationHistory,
    fetchSuggestions,
    clearSuggestions,
    fetchPopularSearches,
    fetchTrendingSearches,
    pushToNavigationHistory,
    setActiveQuery,
    clearActiveQuery,
    clearNavigationHistory,
    invalidateCache,
    clearError,
  } = useSearchStore();

  const debounceRef = useRef(null);

  // Cargar populares al montar si se pide
  useEffect(() => {
    if (withPopular) {
      fetchPopularSearches(popularLimit, popularDays);
    }
  }, [withPopular]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cargar tendencias al montar si se pide
  useEffect(() => {
    if (withTrending) {
      fetchTrendingSearches(trendingLimit);
    }
  }, [withTrending]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Obtener sugerencias con debounce incorporado.
   * @param {string} query
   * @param {number} [limit]
   */
  const getSuggestions = useCallback((query, limit = SEARCH_LIMITS.SUGGESTIONS.default) => {
    clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      clearSuggestions();
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query, limit);
    }, SUGGESTIONS_DEBOUNCE_MS);
  }, [fetchSuggestions, clearSuggestions]);

  /**
   * Forzar recarga de populares ignorando caché.
   */
  const refreshPopular = useCallback((limit = popularLimit, days = popularDays) => {
    invalidateCache('popular');
    return fetchPopularSearches(limit, days, true);
  }, [fetchPopularSearches, invalidateCache, popularLimit, popularDays]);

  /**
   * Forzar recarga de tendencias ignorando caché.
   */
  const refreshTrending = useCallback((limit = trendingLimit) => {
    invalidateCache('trending');
    return fetchTrendingSearches(limit, true);
  }, [fetchTrendingSearches, invalidateCache, trendingLimit]);

  return {
    // Sugerencias
    suggestions,
    loadingSuggestions,
    suggestionsError,
    getSuggestions,
    clearSuggestions,

    // Populares
    popularSearches,
    loadingPopular,
    popularError,
    fetchPopularSearches,
    refreshPopular,

    // Tendencias
    trendingSearches,
    loadingTrending,
    trendingError,
    fetchTrendingSearches,
    refreshTrending,

    // Historial de sesión
    activeQuery,
    navigationHistory,
    pushToNavigationHistory,
    setActiveQuery,
    clearActiveQuery,
    clearNavigationHistory,

    // Utilidades
    clearError,
    invalidateCache,
  };
}

export default useSearch;