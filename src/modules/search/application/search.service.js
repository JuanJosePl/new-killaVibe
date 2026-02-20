// modules/search/application/search.service.js
//
// Capa de aplicación: orquesta repositorio + reglas de dominio.
// Responsabilidades:
//   - Validar parámetros antes de llamar al repositorio
//   - Aplicar normalización de query
//   - Coordinar caché (lógica de expiración)
//   - Preparar datos para la presentación
//   - NO conoce React, Zustand ni componentes

import * as repository from '../infrastructure/search.repository.js';
import {
  isValidSearchQuery,
  normalizeQuery,
  sanitizeLimit,
  sanitizeDays,
  buildCacheKey,
  isCacheExpired,
} from '../domain/search.rules.js';
import { SearchQueryTooShortError, SearchQueryInvalidError } from '../domain/search.errors.js';
import { CACHE_TTL, SEARCH_LIMITS, SEARCH_DAYS } from '../domain/search.model.js';

// ============================================
// SUGERENCIAS
// ============================================

/**
 * Obtener sugerencias de búsqueda.
 * El backend ya combina historial + productos y deduplica.
 * El frontend NUNCA combina manualmente.
 *
 * @param {string} query
 * @param {number} [limit=5]
 * @returns {Promise<SuggestionEntity[]>}
 */
export async function getSuggestions(query, limit = SEARCH_LIMITS.SUGGESTIONS.default) {
  const { valid, reason } = isValidSearchQuery(query);
  if (!valid) {
    // Query muy corta → retornar vacío silenciosamente (comportamiento del backend)
    if (query?.trim?.().length < 2) return [];
    throw new SearchQueryInvalidError(reason);
  }

  const normalized              = normalizeQuery(query);
  const { sanitized: safeLimit } = sanitizeLimit(limit, 'suggestions');

  return repository.fetchSuggestions(normalized, safeLimit);
}

// ============================================
// POPULARES
// ============================================

/**
 * Obtener búsquedas populares.
 *
 * @param {number} [limit=10]
 * @param {number} [days=30]
 * @returns {Promise<PopularSearchEntity[]>}
 */
export async function getPopularSearches(limit = SEARCH_LIMITS.POPULAR.default, days = SEARCH_DAYS.default) {
  const { sanitized: safeLimit } = sanitizeLimit(limit, 'popular');
  const { sanitized: safeDays }  = sanitizeDays(days);

  return repository.fetchPopularSearches(safeLimit, safeDays);
}

// ============================================
// TENDENCIAS
// ============================================

/**
 * Obtener búsquedas en tendencia.
 *
 * @param {number} [limit=10]
 * @returns {Promise<TrendingSearchEntity[]>}
 */
export async function getTrendingSearches(limit = SEARCH_LIMITS.TRENDING.default) {
  const { sanitized: safeLimit } = sanitizeLimit(limit, 'trending');
  return repository.fetchTrendingSearches(safeLimit);
}

// ============================================
// HISTORIAL (auth required)
// ============================================

/**
 * Obtener historial de búsqueda del usuario.
 *
 * @param {number} [limit=20]
 * @returns {Promise<SearchHistoryEntity[]>}
 */
export async function getUserSearchHistory(limit = SEARCH_LIMITS.HISTORY.default) {
  const { sanitized: safeLimit } = sanitizeLimit(limit, 'history');
  return repository.fetchUserSearchHistory(safeLimit);
}

// ============================================
// ADMIN
// ============================================

/**
 * Obtener búsquedas fallidas (admin/moderator).
 *
 * @param {number} [limit=20]
 * @param {number} [days=30]
 * @returns {Promise<FailedSearchEntity[]>}
 */
export async function getFailedSearches(limit = SEARCH_LIMITS.FAILED.default, days = SEARCH_DAYS.default) {
  const { sanitized: safeLimit } = sanitizeLimit(limit, 'failed');
  const { sanitized: safeDays }  = sanitizeDays(days);
  return repository.fetchFailedSearches(safeLimit, safeDays);
}

/**
 * Obtener estadísticas de búsqueda (admin/moderator).
 *
 * @param {number} [days=30]
 * @returns {Promise<SearchStatsEntity|null>}
 */
export async function getSearchStats(days = SEARCH_DAYS.default) {
  const { sanitized: safeDays } = sanitizeDays(days);
  return repository.fetchSearchStats(safeDays);
}

// ============================================
// UTILIDADES DE CACHÉ (usadas por el store)
// ============================================

/**
 * Construir metadatos de caché para popular/trending.
 * El store llama a esta función para decidir si debe ir a la red.
 *
 * @param {'popular'|'trending'} type
 * @param {Object} params
 * @param {number|null} lastFetchedAt  - timestamp del último fetch
 * @returns {{ shouldFetch: boolean, cacheKey: string }}
 */
export function resolveCachePolicy(type, params, lastFetchedAt) {
  const cacheKey  = buildCacheKey(type, params);
  const ttl       = type === 'popular' ? CACHE_TTL.POPULAR : CACHE_TTL.TRENDING;
  const shouldFetch = isCacheExpired(lastFetchedAt, ttl);
  return { shouldFetch, cacheKey };
}

export default {
  getSuggestions,
  getPopularSearches,
  getTrendingSearches,
  getUserSearchHistory,
  getFailedSearches,
  getSearchStats,
  resolveCachePolicy,
};