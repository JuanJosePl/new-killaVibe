// modules/search/domain/search.model.js
//
// Constantes del dominio Search. Espeja exactamente el backend:
//   - search.model.js (enum values, field names)
//   - search.validation.js (limits)
//   - search.service.js (business rules)
//
// Frontend NUNCA recalcula rankings, trendScore ni popularidad.
// El backend es la única fuente de verdad analítica.

/**
 * Tipos de dispositivo válidos (espeja searchSchema.deviceType.enum)
 */
export const DEVICE_TYPE = Object.freeze({
  DESKTOP: 'desktop',
  MOBILE:  'mobile',
  TABLET:  'tablet',
});

/**
 * Límites de paginación por endpoint (espeja search.validation.js)
 */
export const SEARCH_LIMITS = Object.freeze({
  SUGGESTIONS: { min: 1, max: 20,  default: 5  },
  POPULAR:     { min: 1, max: 50,  default: 10 },
  TRENDING:    { min: 1, max: 50,  default: 10 },
  HISTORY:     { min: 1, max: 100, default: 20 },
  FAILED:      { min: 1, max: 100, default: 20 },
});

/**
 * Límites de días para consultas temporales (espeja search.validation.js)
 */
export const SEARCH_DAYS = Object.freeze({
  min:     1,
  max:     365,
  default: 30,
});

/**
 * Longitud mínima de query (espeja search.validation.js + search.service.js)
 * Backend: q min(2), service: prefix.length < 2 → return []
 */
export const QUERY_MIN_LENGTH = 2;
export const QUERY_MAX_LENGTH = 100;

/**
 * Campos permitidos en el objeto filters del historial de búsqueda
 * Espeja: searchSchema.filters
 */
export const ALLOWED_SEARCH_FILTERS = Object.freeze([
  'minPrice',
  'maxPrice',
  'rating',
  'brand',
]);

/**
 * Niveles de tendencia para UI (calculados desde trendScore del backend)
 * El backend calcula trendScore = recentCount / totalCount.
 * El frontend SOLO lo clasifica para display — no lo recalcula.
 */
export const TREND_LEVELS = Object.freeze({
  HIGH:        { threshold: 0.7, label: 'Muy Alto', color: '#ef4444' },
  MEDIUM_HIGH: { threshold: 0.5, label: 'Alto',     color: '#f97316' },
  MEDIUM:      { threshold: 0.3, label: 'Medio',    color: '#eab308' },
  LOW:         { threshold: 0,   label: 'Bajo',     color: '#22c55e' },
});

/**
 * Niveles de impacto para búsquedas fallidas
 * El backend provee failedCount — el frontend solo lo clasifica.
 */
export const FAILED_IMPACT_LEVELS = Object.freeze({
  HIGH:   { threshold: 50, label: 'Alto',  color: '#ef4444' },
  MEDIUM: { threshold: 20, label: 'Medio', color: '#f97316' },
  LOW:    { threshold: 0,  label: 'Bajo',  color: '#22c55e' },
});

/**
 * TTL del caché en memoria para datos estáticos (ms)
 * Popular y trending no cambian en segundos — se cachean localmente.
 */
export const CACHE_TTL = Object.freeze({
  SUGGESTIONS: 0,       // Sin caché — respuesta en tiempo real
  POPULAR:     300_000, // 5 minutos
  TRENDING:    300_000, // 5 minutos
  HISTORY:     0,       // Sin caché — dato del usuario siempre fresco
});

/**
 * Debounce recomendado para sugerencias (ms)
 * No impuesto por backend, pero es buena práctica de UX.
 */
export const SUGGESTIONS_DEBOUNCE_MS = 300;