// src/utils/searchUtils.js

/**
 * @module searchUtils
 * @description Utilidades para el módulo Search
 */

/**
 * Normalizar query de búsqueda
 * Aplica las mismas reglas que el backend
 */
export const normalizeSearchQuery = (query) => {
  if (!query) return '';
  return query.trim().toLowerCase();
};

/**
 * Validar query de búsqueda
 * Sincronizado con validaciones Joi del backend
 */
export const validateSearchQuery = (query) => {
  const normalized = normalizeSearchQuery(query);
  
  if (normalized.length < 2) {
    return {
      valid: false,
      error: 'La búsqueda debe tener al menos 2 caracteres'
    };
  }
  
  if (normalized.length > 100) {
    return {
      valid: false,
      error: 'La búsqueda no puede exceder 100 caracteres'
    };
  }
  
  return { valid: true };
};

/**
 * Formatear tiempo relativo
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Hace un momento';
  if (diffMins === 1) return 'Hace 1 minuto';
  if (diffMins < 60) return `Hace ${diffMins} minutos`;
  if (diffHours === 1) return 'Hace 1 hora';
  if (diffHours < 24) return `Hace ${diffHours} horas`;
  if (diffDays === 1) return 'Hace 1 día';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  return `Hace ${Math.floor(diffDays / 365)} años`;
};

/**
 * Formatear fecha corta
 */
export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Calcular nivel de tendencia
 */
export const getTrendLevel = (trendScore) => {
  if (trendScore >= 0.7) return { level: 'high', label: 'Muy Alto', color: '#ef4444' };
  if (trendScore >= 0.5) return { level: 'medium-high', label: 'Alto', color: '#f97316' };
  if (trendScore >= 0.3) return { level: 'medium', label: 'Medio', color: '#eab308' };
  return { level: 'low', label: 'Bajo', color: '#22c55e' };
};

/**
 * Calcular nivel de impacto para búsquedas fallidas
 */
export const getFailedSearchImpact = (failedCount) => {
  if (failedCount >= 50) return { level: 'high', label: 'Alto' };
  if (failedCount >= 20) return { level: 'medium', label: 'Medio' };
  return { level: 'low', label: 'Bajo' };
};

/**
 * Resaltar texto de búsqueda
 */
export const highlightSearchText = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

/**
 * Debounce function para búsquedas
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generar sugerencias locales (fallback)
 */
export const generateLocalSuggestions = (query, products = []) => {
  const normalized = normalizeSearchQuery(query);
  if (!normalized || normalized.length < 2) return [];

  const suggestions = new Set();

  products.forEach(product => {
    // Buscar en nombre
    if (product.name && product.name.toLowerCase().includes(normalized)) {
      suggestions.add(normalizeSearchQuery(product.name));
    }
    
    // Buscar en marca
    if (product.brand && product.brand.toLowerCase().includes(normalized)) {
      suggestions.add(normalizeSearchQuery(product.brand));
    }
    
    // Buscar en tags
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        if (tag.toLowerCase().includes(normalized)) {
          suggestions.add(normalizeSearchQuery(tag));
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, 5);
};

/**
 * Construir query string para búsqueda
 */
export const buildSearchQueryString = (query, filters = {}) => {
  const params = new URLSearchParams();
  
  if (query) {
    params.append('search', query);
  }
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.append(key, value);
    }
  });
  
  return params.toString();
};

/**
 * Parsear query string de búsqueda
 */
export const parseSearchQueryString = (search) => {
  const params = new URLSearchParams(search);
  const result = {
    query: params.get('search') || '',
    filters: {}
  };
  
  params.forEach((value, key) => {
    if (key !== 'search') {
      result.filters[key] = value;
    }
  });
  
  return result;
};

/**
 * Formatear número con separadores
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num);
};

/**
 * Formatear porcentaje
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Detectar tipo de dispositivo
 */
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

/**
 * Obtener IP del cliente (aproximado)
 */
export const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return null;
  }
};