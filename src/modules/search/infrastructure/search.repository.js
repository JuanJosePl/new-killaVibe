// modules/search/infrastructure/search.repository.js
//
// Única capa de conexión entre API ↔ Dominio.
// Responsabilidades:
//   - Llamar a search.api.js
//   - Mapear respuestas crudas a entidades de dominio
//   - Convertir errores HTTP a errores de dominio tipados
//   - NO tiene lógica de negocio
//   - NO conoce React

import {
  SuggestionEntity,
  PopularSearchEntity,
  TrendingSearchEntity,
  SearchHistoryEntity,
  FailedSearchEntity,
  SearchStatsEntity,
} from '../domain/search.entity.js';

import { mapApiErrorToDomain, SearchUnauthorizedError } from '../domain/search.errors.js';

import {
  apiFetchSuggestions,
  apiFetchPopularSearches,
  apiFetchTrendingSearches,
  apiFetchUserSearchHistory,
  apiFetchFailedSearches,
  apiFetchSearchStats,
} from '../api/searchApi.js';

/**
 * Wrapper que convierte errores HTTP a errores de dominio.
 */
async function withDomainErrors(fn) {
  try {
    return await fn();
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401 || status === 403) {
      throw status === 401
        ? new SearchUnauthorizedError()
        : mapApiErrorToDomain(err);
    }
    throw mapApiErrorToDomain(err);
  }
}

// ============================================
// PUBLIC
// ============================================

/**
 * Obtener sugerencias mapeadas a SuggestionEntity[].
 * @param {string} q
 * @param {number} limit
 * @returns {Promise<SuggestionEntity[]>}
 */
export async function fetchSuggestions(q, limit) {
  return withDomainErrors(async () => {
    const raw = await apiFetchSuggestions(q, limit);
    return raw.map(r => new SuggestionEntity(r));
  });
}

/**
 * Obtener búsquedas populares mapeadas a PopularSearchEntity[].
 * @param {number} limit
 * @param {number} days
 * @returns {Promise<PopularSearchEntity[]>}
 */
export async function fetchPopularSearches(limit, days) {
  return withDomainErrors(async () => {
    const raw = await apiFetchPopularSearches(limit, days);
    return raw.map(r => new PopularSearchEntity(r));
  });
}

/**
 * Obtener tendencias mapeadas a TrendingSearchEntity[].
 * @param {number} limit
 * @returns {Promise<TrendingSearchEntity[]>}
 */
export async function fetchTrendingSearches(limit) {
  return withDomainErrors(async () => {
    const raw = await apiFetchTrendingSearches(limit);
    return raw.map(r => new TrendingSearchEntity(r));
  });
}

// ============================================
// PRIVATE (auth required)
// ============================================

/**
 * Obtener historial del usuario mapeado a SearchHistoryEntity[].
 * @param {number} limit
 * @returns {Promise<SearchHistoryEntity[]>}
 */
export async function fetchUserSearchHistory(limit) {
  return withDomainErrors(async () => {
    const raw = await apiFetchUserSearchHistory(limit);
    return raw.map(r => new SearchHistoryEntity(r));
  });
}

// ============================================
// ADMIN
// ============================================

/**
 * Obtener búsquedas fallidas mapeadas a FailedSearchEntity[].
 * @param {number} limit
 * @param {number} days
 * @returns {Promise<FailedSearchEntity[]>}
 */
export async function fetchFailedSearches(limit, days) {
  return withDomainErrors(async () => {
    const raw = await apiFetchFailedSearches(limit, days);
    return raw.map(r => new FailedSearchEntity(r));
  });
}

/**
 * Obtener estadísticas mapeadas a SearchStatsEntity.
 * @param {number} days
 * @returns {Promise<SearchStatsEntity>}
 */
export async function fetchSearchStats(days) {
  return withDomainErrors(async () => {
    const raw = await apiFetchSearchStats(days);
    return raw ? new SearchStatsEntity(raw) : null;
  });
}

export default {
  fetchSuggestions,
  fetchPopularSearches,
  fetchTrendingSearches,
  fetchUserSearchHistory,
  fetchFailedSearches,
  fetchSearchStats,
};