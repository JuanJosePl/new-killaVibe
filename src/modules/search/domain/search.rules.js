// modules/search/domain/search.rules.js
//
// Reglas de negocio puras del dominio Search.
// Sin dependencias de React, Zustand ni API.
// Espeja las validaciones del backend (search.validation.js + search.service.js).

import { QUERY_MIN_LENGTH, QUERY_MAX_LENGTH, SEARCH_LIMITS, SEARCH_DAYS } from './search.model.js';

/**
 * ¿Es válida la query para obtener sugerencias?
 * Espeja: search.validation.js#getSearchSuggestions (q: min(2), max(100))
 *         search.service.js#getSearchSuggestions (prefix.length < 2 → return [])
 *
 * @param {string} query
 * @returns {{ valid: boolean, reason?: string }}
 */
export function isValidSearchQuery(query) {
  if (!query || typeof query !== 'string') {
    return { valid: false, reason: 'La consulta de búsqueda es requerida' };
  }

  const trimmed = query.trim();

  if (trimmed.length < QUERY_MIN_LENGTH) {
    return { valid: false, reason: `La búsqueda debe tener al menos ${QUERY_MIN_LENGTH} caracteres` };
  }

  if (trimmed.length > QUERY_MAX_LENGTH) {
    return { valid: false, reason: `La búsqueda no puede exceder ${QUERY_MAX_LENGTH} caracteres` };
  }

  return { valid: true };
}

/**
 * Normalizar query de búsqueda.
 * Espeja: searchSchema.query → { trim: true, lowercase: true }
 * El backend normaliza en persistencia — el frontend normaliza antes de enviar
 * para consistencia en caché y comparaciones.
 *
 * @param {string} query
 * @returns {string}
 */
export function normalizeQuery(query) {
  if (!query || typeof query !== 'string') return '';
  return query.trim().toLowerCase();
}

/**
 * ¿Es válido el límite para el endpoint dado?
 * Espeja: search.validation.js limits por endpoint
 *
 * @param {number} limit
 * @param {'suggestions'|'popular'|'trending'|'history'|'failed'} endpoint
 * @returns {{ valid: boolean, sanitized: number }}
 */
export function sanitizeLimit(limit, endpoint) {
  const key     = endpoint.toUpperCase();
  const config  = {
    SUGGESTIONS: { min: 1, max: 20,  default: 5  },
    POPULAR:     { min: 1, max: 50,  default: 10 },
    TRENDING:    { min: 1, max: 50,  default: 10 },
    HISTORY:     { min: 1, max: 100, default: 20 },
    FAILED:      { min: 1, max: 100, default: 20 },
  }[key];

  if (!config) return { valid: false, sanitized: 10 };

  const parsed = parseInt(limit, 10);
  if (isNaN(parsed) || parsed < config.min) return { valid: true, sanitized: config.default };
  if (parsed > config.max) return { valid: true, sanitized: config.max };

  return { valid: true, sanitized: parsed };
}

/**
 * ¿Son válidos los días para consultas temporales?
 * Espeja: search.validation.js (days: min(1), max(365), default(30))
 *
 * @param {number} days
 * @returns {{ valid: boolean, sanitized: number }}
 */
export function sanitizeDays(days) {
  const parsed = parseInt(days, 10);
  if (isNaN(parsed) || parsed < SEARCH_DAYS.min) return { valid: true, sanitized: SEARCH_DAYS.default };
  if (parsed > SEARCH_DAYS.max) return { valid: true, sanitized: SEARCH_DAYS.max };
  return { valid: true, sanitized: parsed };
}

/**
 * ¿Dos queries son equivalentes (para caché y deduplicación)?
 *
 * @param {string} q1
 * @param {string} q2
 * @returns {boolean}
 */
export function queriesAreEqual(q1, q2) {
  return normalizeQuery(q1) === normalizeQuery(q2);
}

/**
 * ¿Ha expirado el caché?
 *
 * @param {number|null} timestamp  - Date.now() cuando se cacheó
 * @param {number}      ttlMs      - TTL en milisegundos
 * @returns {boolean}
 */
export function isCacheExpired(timestamp, ttlMs) {
  if (!timestamp || ttlMs === 0) return true;
  return Date.now() - timestamp > ttlMs;
}

/**
 * Construir clave de caché para popular/trending.
 *
 * @param {'popular'|'trending'} type
 * @param {Object} params
 * @returns {string}
 */
export function buildCacheKey(type, params = {}) {
  const parts = [type];
  if (params.limit) parts.push(`l${params.limit}`);
  if (params.days)  parts.push(`d${params.days}`);
  return parts.join('_');
}