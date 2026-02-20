// modules/search/api/search.api.js
//
// Capa HTTP pura. Espeja exactamente search.routes.js del backend.
// Responsabilidades: SOLO comunicarse con backend.
// Sin transformaciones, sin validaciones de negocio, sin estado.
//
// Endpoints del backend:
//   GET /api/search/suggestions?q=&limit=   → Public
//   GET /api/search/popular?limit=&days=    → Public
//   GET /api/search/trending?limit=         → Public
//   GET /api/search/history?limit=          → Private (auth)
//   GET /api/search/admin/failed?limit=&days= → Private/Admin
//   GET /api/search/admin/stats?days=         → Private/Admin

import apiClient from '../../../core/api/axiosInstance';

const BASE = '/search';

/**
 * Sugerencias de búsqueda basadas en prefijo.
 * Combina historial + productos (fusión realizada por el backend).
 *
 * @param {string} q      - Prefijo (min 2, max 100 chars)
 * @param {number} [limit=5] - Máx 20
 * @returns {Promise<{ suggestion: string, popularity: number }[]>}
 */
export async function apiFetchSuggestions(q, limit = 5) {
  const { data } = await apiClient.get(`${BASE}/suggestions`, { params: { q, limit } });
  // Response: { success, count, data: SuggestionEntity[] }
  return data.data ?? [];
}

/**
 * Búsquedas populares (analytics agregado por backend).
 *
 * @param {number} [limit=10] - Máx 50
 * @param {number} [days=30]  - Máx 365
 * @returns {Promise<{ query, count, avgResults, clickRate }[]>}
 */
export async function apiFetchPopularSearches(limit = 10, days = 30) {
  const { data } = await apiClient.get(`${BASE}/popular`, { params: { limit, days } });
  return data.data ?? [];
}

/**
 * Búsquedas en tendencia (trendScore calculado por backend).
 *
 * @param {number} [limit=10] - Máx 50
 * @returns {Promise<{ query, recentCount, totalCount, trendScore }[]>}
 */
export async function apiFetchTrendingSearches(limit = 10) {
  const { data } = await apiClient.get(`${BASE}/trending`, { params: { limit } });
  return data.data ?? [];
}

/**
 * Historial personal del usuario autenticado.
 * Requiere token Bearer en apiClient interceptor.
 *
 * @param {number} [limit=20] - Máx 100
 * @returns {Promise<{ _id, query, resultsCount, clicked, createdAt }[]>}
 */
export async function apiFetchUserSearchHistory(limit = 20) {
  const { data } = await apiClient.get(`${BASE}/history`, { params: { limit } });
  return data.data ?? [];
}

/**
 * Búsquedas fallidas (sin resultados). Solo admin/moderator.
 *
 * @param {number} [limit=20] - Máx 100
 * @param {number} [days=30]  - Máx 365
 * @returns {Promise<{ query, failedCount }[]>}
 */
export async function apiFetchFailedSearches(limit = 20, days = 30) {
  const { data } = await apiClient.get(`${BASE}/admin/failed`, { params: { limit, days } });
  return data.data ?? [];
}

/**
 * Estadísticas generales de búsqueda. Solo admin/moderator.
 *
 * @param {number} [days=30] - Máx 365
 * @returns {Promise<{ totalSearches, uniqueQueries, avgResults, clickThroughRate, failedSearches, failedRate, period }>}
 */
export async function apiFetchSearchStats(days = 30) {
  const { data } = await apiClient.get(`${BASE}/admin/stats`, { params: { days } });
  return data.data ?? null;
}

export default {
  apiFetchSuggestions,
  apiFetchPopularSearches,
  apiFetchTrendingSearches,
  apiFetchUserSearchHistory,
  apiFetchFailedSearches,
  apiFetchSearchStats,
};