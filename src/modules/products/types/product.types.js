/**
 * @module product.types
 * @description Constantes, enums y configuración del dominio Products.
 * Sincronizado con el backend.
 */

// ─────────────────────────────────────────────
// ENUMS DE ESTADO
// ─────────────────────────────────────────────

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  DISCONTINUED: 'discontinued',
};

export const PRODUCT_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  HIDDEN: 'hidden',
};

/** @typedef {'available'|'low_stock'|'backorder'|'out_of_stock'|'unavailable'} AvailabilityStatus */
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  LOW_STOCK: 'low_stock',
  BACKORDER: 'backorder',
  OUT_OF_STOCK: 'out_of_stock',
  UNAVAILABLE: 'unavailable',
};

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'createdAt',
  PRICE: 'price',
  NAME: 'name',
  SALES: 'salesCount',
  VIEWS: 'views',
  RATING: 'rating.average',
};

export const VALID_SORT_FIELDS = [
  'createdAt',
  'price',
  'name',
  'salesCount',
  'views',
  'rating.average',
];

// ─────────────────────────────────────────────
// LÍMITES
// ─────────────────────────────────────────────

export const PAGINATION_LIMITS = {
  MIN: 1,
  DEFAULT: 12,
  MAX: 100,
};

export const STOCK_LIMITS = {
  MIN: 0,
  LOW_THRESHOLD_DEFAULT: 5,
};

export const PRICE_LIMITS = {
  MIN: 0,
  RANGE_DEFAULT_MAX: 3_000_000,
};

export const TEXT_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 120,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  SHORT_DESCRIPTION_MAX: 300,
  BRAND_MAX: 100,
  SKU_MIN: 3,
  SKU_MAX: 50,
  SEO_TITLE_MAX: 60,
  SEO_DESCRIPTION_MAX: 160,
};

export const IMAGE_CONFIG = {
  MAX_IMAGES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_ALT: 'Imagen de producto',
  FALLBACK_URL: '/placeholder-product.jpg',
};

// ─────────────────────────────────────────────
// FILTROS Y QUERY PARAMS
// ─────────────────────────────────────────────

export const VALID_FILTERS = [
  'page', 'limit', 'sort', 'order',
  'category', 'search',
  'minPrice', 'maxPrice',
  'status', 'visibility',
  'featured', 'inStock', 'brand',
];

export const DEFAULT_QUERY_PARAMS = {
  page: 1,
  limit: PAGINATION_LIMITS.DEFAULT,
  sort: PRODUCT_SORT_OPTIONS.NEWEST,
  order: SORT_ORDER.DESC,
  status: PRODUCT_STATUS.ACTIVE,
  visibility: PRODUCT_VISIBILITY.PUBLIC,
};

// ─────────────────────────────────────────────
// BÚSQUEDA
// ─────────────────────────────────────────────

export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_LIMIT: 10,
  SUGGESTIONS_LIMIT: 5,
  DEBOUNCE_MS: 300,
  HISTORY_MAX_ITEMS: 10,
};

// ─────────────────────────────────────────────
// CACHÉ
// ─────────────────────────────────────────────

export const CACHE_CONFIG = {
  ENTITY_TTL_MS: 5 * 60 * 1000,       // 5 min
  FEATURED_TTL_MS: 10 * 60 * 1000,    // 10 min
  LIST_TTL_MS: 2 * 60 * 1000,         // 2 min
  MAX_ENTITIES: 200,
};

// ─────────────────────────────────────────────
// VALIDACIÓN (patrones)
// ─────────────────────────────────────────────

export const VALIDATION_PATTERNS = {
  SKU: /^[A-Z0-9-_]{3,50}$/,
  SLUG: /^[a-z0-9-]+$/,
  PRICE: /^\d+(\.\d{1,2})?$/,
  MONGO_ID: /^[0-9a-fA-F]{24}$/,
};

// ─────────────────────────────────────────────
// UI / PRESENTACIÓN (constantes, no lógica)
// ─────────────────────────────────────────────

export const AVAILABILITY_MESSAGES = {
  [AVAILABILITY_STATUS.AVAILABLE]: 'En stock',
  [AVAILABILITY_STATUS.LOW_STOCK]: 'Pocas unidades disponibles',
  [AVAILABILITY_STATUS.BACKORDER]: 'Disponible para pre-orden',
  [AVAILABILITY_STATUS.OUT_OF_STOCK]: 'Producto agotado',
  [AVAILABILITY_STATUS.UNAVAILABLE]: 'No disponible',
};

export const AVAILABILITY_CLASSES = {
  [AVAILABILITY_STATUS.AVAILABLE]: 'text-green-600',
  [AVAILABILITY_STATUS.LOW_STOCK]: 'text-orange-600',
  [AVAILABILITY_STATUS.BACKORDER]: 'text-blue-600',
  [AVAILABILITY_STATUS.OUT_OF_STOCK]: 'text-red-600',
  [AVAILABILITY_STATUS.UNAVAILABLE]: 'text-gray-500',
};

export const STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Activo',
  [PRODUCT_STATUS.DRAFT]: 'Borrador',
  [PRODUCT_STATUS.ARCHIVED]: 'Archivado',
  [PRODUCT_STATUS.DISCONTINUED]: 'Descontinuado',
};

export const STATUS_BADGE_COLORS = {
  [PRODUCT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [PRODUCT_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [PRODUCT_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-800',
  [PRODUCT_STATUS.DISCONTINUED]: 'bg-red-100 text-red-800',
};

export const CATEGORY_ICONS = {
  Smartphones: '📱',
  'Laptops & Computadoras': '💻',
  'Audio & Sonido': '🎧',
  'Smartwatches & Wearables': '⌚',
  Gaming: '🎮',
  'TV & Monitores': '📺',
  'Tablets & iPads': '📟',
  Accesorios: '🔌',
  Cámaras: '📷',
  'Hogar Inteligente': '🏠',
};

export const NEW_PRODUCT_DAYS = 7;

export const WEIGHT_UNITS = { KG: 'kg', G: 'g', LB: 'lb', OZ: 'oz' };
export const DIMENSION_UNITS = { CM: 'cm', M: 'm', IN: 'in', FT: 'ft' };
export const RATING = { MIN: 1, MAX: 5, DEFAULT: 0 };