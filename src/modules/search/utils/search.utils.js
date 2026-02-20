// modules/search/utils/search.utils.js
//
// Utilidades puras para el módulo Search.
// Funciones sin estado, sin side effects, sin dependencias de frameworks.
// Reemplaza searchUtils.js legacy eliminando funciones que eran responsabilidad del backend.
//
// ELIMINADO del legacy:
//   - getClientIP() → llamada de red innecesaria en frontend
//   - generateLocalSuggestions() → el backend ya combina historial + productos
//   - highlightSearchText() → no usa innerHTML, se hace en componente con JSX

/**
 * Construir query string para navegar a resultados de búsqueda.
 * El módulo Products interpreta estos parámetros.
 *
 * @param {string} query
 * @param {Object} [filters={}]
 * @returns {string} Query string sin el '?'
 */
export function buildSearchQueryString(query, filters = {}) {
  const params = new URLSearchParams();

  if (query?.trim()) {
    params.set('search', query.trim());
  }

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });

  return params.toString();
}

/**
 * Parsear query string de URL de resultados.
 *
 * @param {string} search - window.location.search
 * @returns {{ query: string, filters: Object }}
 */
export function parseSearchQueryString(search) {
  const params = new URLSearchParams(search);
  const result = { query: params.get('search') ?? '', filters: {} };

  params.forEach((value, key) => {
    if (key !== 'search') {
      result.filters[key] = value;
    }
  });

  return result;
}

/**
 * Detectar tipo de dispositivo para analytics.
 * Se usa al registrar búsquedas — el backend persiste deviceType.
 *
 * @returns {'desktop'|'mobile'|'tablet'}
 */
export function getDeviceType() {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return 'tablet';
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return 'mobile';
  return 'desktop';
}

/**
 * Formatear número con separadores de miles (locale es-ES).
 * @param {number} num
 * @returns {string}
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('es-ES').format(num);
}

/**
 * Formatear porcentaje.
 * @param {number} value
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function formatPercentage(value, decimals = 1) {
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Formatear tiempo relativo.
 * @param {Date|string} date
 * @returns {string}
 */
export function formatTimeAgo(date) {
  const diffMs    = Date.now() - new Date(date).getTime();
  const diffMins  = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays  = Math.floor(diffMs / 86_400_000);

  if (diffMins  <  1)   return 'Hace un momento';
  if (diffMins  <  60)  return `Hace ${diffMins} minuto${diffMins === 1 ? '' : 's'}`;
  if (diffHours <  24)  return `Hace ${diffHours} hora${diffHours === 1 ? '' : 's'}`;
  if (diffDays  <   7)  return `Hace ${diffDays} día${diffDays === 1 ? '' : 's'}`;
  if (diffDays  <  30)  return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) === 1 ? '' : 's'}`;
  if (diffDays  < 365)  return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) === 1 ? '' : 'es'}`;
  return `Hace ${Math.floor(diffDays / 365)} año${Math.floor(diffDays / 365) === 1 ? '' : 's'}`;
}

/**
 * Formatear fecha corta.
 * @param {Date|string} date
 * @returns {string}
 */
export function formatShortDate(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  });
}