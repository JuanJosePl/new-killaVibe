// modules/search/presentation/store/search.store.js
//
// Store Zustand del módulo Search.
// Reemplaza completamente SearchContext.jsx.
//
// Responsabilidades:
//   - Estado global de búsqueda
//   - Caché en memoria para popular/trending (TTL gestionado por service)
//   - Historial de navegación en sesión (reemplaza NavigationHistory del Context)
//   - Loading/error granulares por operación
//   - AbortController para sugerencias concurrentes
//   - Sin lógica de negocio directa — delega a search.service.js

import { create }    from 'zustand';
import { devtools }  from 'zustand/middleware';
import searchService from '../../application/search.service.js';
import { SEARCH_LIMITS, SEARCH_DAYS, SUGGESTIONS_DEBOUNCE_MS } from '../../domain/search.model.js';

// ============================================
// ESTADO INICIAL
// ============================================

const initialState = {
  // Sugerencias (tiempo real, sin caché)
  suggestions:        [],
  loadingSuggestions: false,
  suggestionsError:   null,

  // Populares (con caché TTL 5 min)
  popularSearches:  [],
  loadingPopular:   false,
  popularError:     null,
  popularFetchedAt: null, // timestamp para caché
  popularCacheKey:  null,

  // Tendencias (con caché TTL 5 min)
  trendingSearches:  [],
  loadingTrending:   false,
  trendingError:     null,
  trendingFetchedAt: null,
  trendingCacheKey:  null,

  // Historial personal (sin caché, siempre fresco)
  searchHistory:  [],
  loadingHistory: false,
  historyError:   null,

  // Admin: fallidas
  failedSearches: [],
  loadingFailed:  false,
  failedError:    null,

  // Admin: stats
  searchStats:   null,
  loadingStats:  false,
  statsError:    null,

  // Historial de navegación en sesión (reemplaza SearchContext.navigationHistory)
  // Últimas 10 búsquedas del usuario en la sesión actual (sin backend)
  navigationHistory: [],

  // Query activa (lo que el usuario está buscando ahora mismo)
  activeQuery: '',
};

// Instancia del AbortController para sugerencias
// Fuera del store para evitar serialización de objetos no-plain
let abortControllerRef = null;

// ============================================
// STORE
// ============================================

export const useSearchStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // =========================================
      // SUGERENCIAS
      // =========================================

      /**
       * Obtener sugerencias. Cancela petición anterior automáticamente.
       * El debounce se aplica en el hook (useSearch), no aquí.
       *
       * @param {string} query
       * @param {number} [limit]
       */
      fetchSuggestions: async (query, limit = SEARCH_LIMITS.SUGGESTIONS.default) => {
        // Si la query es muy corta, limpiar silenciosamente
        if (!query || query.trim().length < 2) {
          set({ suggestions: [], loadingSuggestions: false, suggestionsError: null });
          return;
        }

        // Cancelar petición anterior
        if (abortControllerRef) {
          abortControllerRef.abort();
        }
        abortControllerRef = new AbortController();

        set({ loadingSuggestions: true, suggestionsError: null });

        try {
          const results = await searchService.getSuggestions(query, limit);
          // Solo actualizar si no fue abortada
          set({ suggestions: results, loadingSuggestions: false });
        } catch (err) {
          // Ignorar errores de abort
          if (err?.name === 'AbortError' || err?.name === 'CanceledError') return;
          set({ suggestions: [], loadingSuggestions: false, suggestionsError: err });
        }
      },

      clearSuggestions: () => {
        if (abortControllerRef) {
          abortControllerRef.abort();
          abortControllerRef = null;
        }
        set({ suggestions: [], loadingSuggestions: false, suggestionsError: null });
      },

      // =========================================
      // POPULARES (con caché)
      // =========================================

      /**
       * Obtener búsquedas populares.
       * Verifica caché antes de ir a la red.
       *
       * @param {number} [limit]
       * @param {number} [days]
       * @param {boolean} [force=false] - Ignorar caché
       */
      fetchPopularSearches: async (
        limit = SEARCH_LIMITS.POPULAR.default,
        days  = SEARCH_DAYS.default,
        force = false
      ) => {
        const { shouldFetch, cacheKey } = searchService.resolveCachePolicy(
          'popular',
          { limit, days },
          get().popularFetchedAt
        );

        // Respetar caché si no está expirado y no se fuerza
        if (!force && !shouldFetch && get().popularCacheKey === cacheKey && get().popularSearches.length > 0) {
          return;
        }

        // Prevenir llamadas duplicadas concurrentes
        if (get().loadingPopular) return;

        set({ loadingPopular: true, popularError: null });

        try {
          const results = await searchService.getPopularSearches(limit, days);
          set({
            popularSearches:  results,
            loadingPopular:   false,
            popularFetchedAt: Date.now(),
            popularCacheKey:  cacheKey,
          });
        } catch (err) {
          set({ loadingPopular: false, popularError: err });
          // No limpiar popularSearches en error — conservar datos anteriores
        }
      },

      // =========================================
      // TENDENCIAS (con caché)
      // =========================================

      /**
       * Obtener búsquedas en tendencia.
       * @param {number} [limit]
       * @param {boolean} [force=false]
       */
      fetchTrendingSearches: async (limit = SEARCH_LIMITS.TRENDING.default, force = false) => {
        const { shouldFetch, cacheKey } = searchService.resolveCachePolicy(
          'trending',
          { limit },
          get().trendingFetchedAt
        );

        if (!force && !shouldFetch && get().trendingCacheKey === cacheKey && get().trendingSearches.length > 0) {
          return;
        }

        if (get().loadingTrending) return;

        set({ loadingTrending: true, trendingError: null });

        try {
          const results = await searchService.getTrendingSearches(limit);
          set({
            trendingSearches:  results,
            loadingTrending:   false,
            trendingFetchedAt: Date.now(),
            trendingCacheKey:  cacheKey,
          });
        } catch (err) {
          set({ loadingTrending: false, trendingError: err });
        }
      },

      // =========================================
      // HISTORIAL PERSONAL
      // =========================================

      /**
       * Obtener historial del usuario autenticado.
       * @param {number} [limit]
       */
      fetchUserSearchHistory: async (limit = SEARCH_LIMITS.HISTORY.default) => {
        set({ loadingHistory: true, historyError: null });

        try {
          const results = await searchService.getUserSearchHistory(limit);
          set({ searchHistory: results, loadingHistory: false });
        } catch (err) {
          set({ searchHistory: [], loadingHistory: false, historyError: err });
        }
      },

      // =========================================
      // ADMIN: FALLIDAS
      // =========================================

      fetchFailedSearches: async (limit = SEARCH_LIMITS.FAILED.default, days = SEARCH_DAYS.default) => {
        set({ loadingFailed: true, failedError: null });

        try {
          const results = await searchService.getFailedSearches(limit, days);
          set({ failedSearches: results, loadingFailed: false });
        } catch (err) {
          set({ failedSearches: [], loadingFailed: false, failedError: err });
        }
      },

      // =========================================
      // ADMIN: STATS
      // =========================================

      fetchSearchStats: async (days = SEARCH_DAYS.default) => {
        set({ loadingStats: true, statsError: null });

        try {
          const stats = await searchService.getSearchStats(days);
          set({ searchStats: stats, loadingStats: false });
        } catch (err) {
          set({ searchStats: null, loadingStats: false, statsError: err });
        }
      },

      // =========================================
      // HISTORIAL DE NAVEGACIÓN EN SESIÓN
      // (reemplaza SearchContext.navigationHistory)
      // =========================================

      /**
       * Registrar búsqueda en el historial de sesión.
       * No va al backend — es solo UI state de sesión.
       *
       * @param {string} query
       * @param {Object} [filters={}]
       * @param {number} [resultsCount=0]
       */
      pushToNavigationHistory: (query, filters = {}, resultsCount = 0) => {
        if (!query?.trim()) return;

        const entry = {
          query:        query.trim().toLowerCase(),
          filters,
          resultsCount,
          timestamp:    new Date().toISOString(),
        };

        set(s => {
          const last = s.navigationHistory[0];

          // No duplicar entrada consecutiva idéntica
          if (
            last?.query   === entry.query &&
            JSON.stringify(last?.filters) === JSON.stringify(entry.filters)
          ) {
            return {};
          }

          return {
            navigationHistory: [entry, ...s.navigationHistory].slice(0, 10),
            activeQuery:       entry.query,
          };
        });
      },

      setActiveQuery: (query) => set({ activeQuery: query }),
      clearActiveQuery: () => set({ activeQuery: '' }),
      clearNavigationHistory: () => set({ navigationHistory: [] }),

      // =========================================
      // UTILIDADES
      // =========================================

      clearError: (field) => set({ [field]: null }),

      invalidateCache: (type) => {
        if (type === 'popular') {
          set({ popularFetchedAt: null, popularCacheKey: null });
        } else if (type === 'trending') {
          set({ trendingFetchedAt: null, trendingCacheKey: null });
        } else {
          set({ popularFetchedAt: null, popularCacheKey: null, trendingFetchedAt: null, trendingCacheKey: null });
        }
      },

      reset: () => set(initialState),
    }),
    { name: 'search-store' }
  )
);

// =========================================
// SELECTORES
// =========================================

export const selectHasSuggestions      = (s) => s.suggestions.length > 0;
export const selectHasNavigationHistory = (s) => s.navigationHistory.length > 0;
export const selectLastSearch          = (s) => s.navigationHistory[0] ?? null;
export const selectAdminHasData        = (s) => s.failedSearches.length > 0 || s.searchStats !== null;