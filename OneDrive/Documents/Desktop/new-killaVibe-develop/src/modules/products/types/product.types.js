/**
 * @module product.types
 * @description Tipos, constantes y enums para productos
 * Sincronizado 100% con backend product.model.js
 */

/**
 * Estados de producto (product.status)
 */
export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  DRAFT: 'draft',
  ARCHIVED: 'archived',
  DISCONTINUED: 'discontinued'
};

/**
 * Niveles de visibilidad (product.visibility)
 */
export const PRODUCT_VISIBILITY = {
  PUBLIC: 'public',
  PRIVATE: 'private',
  HIDDEN: 'hidden'
};

/**
 * Opciones de ordenamiento
 */
export const PRODUCT_SORT_OPTIONS = {
  NEWEST: 'createdAt',
  PRICE_LOW: 'price',
  PRICE_HIGH: 'price',
  NAME: 'name',
  SALES: 'salesCount',
  VIEWS: 'views',
  RATING: 'rating.average'
};

/**
 * Direcciones de ordenamiento
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc'
};

/**
 * Estados de disponibilidad
 */
export const AVAILABILITY_STATUS = {
  AVAILABLE: 'available',
  LOW_STOCK: 'low_stock',
  BACKORDER: 'backorder',
  OUT_OF_STOCK: 'out_of_stock',
  UNAVAILABLE: 'unavailable'
};

/**
 * Límites de paginación
 */
export const PAGINATION_LIMITS = {
  MIN: 1,
  DEFAULT: 12,
  MAX: 100
};

/**
 * Límites de stock
 */
export const STOCK_LIMITS = {
  MIN: 0,
  LOW_THRESHOLD_DEFAULT: 5
};

/**
 * Límites de precios
 */
export const PRICE_LIMITS = {
  MIN: 0,
  MAX: Number.MAX_SAFE_INTEGER
};

/**
 * Límites de texto
 */
export const TEXT_LIMITS = {
  NAME_MIN: 3,
  NAME_MAX: 120,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 5000,
  SHORT_DESCRIPTION_MAX: 300,
  BRAND_MAX: 100,
  SKU_MAX: 50,
  SEO_TITLE_MAX: 60,
  SEO_DESCRIPTION_MAX: 160
};

/**
 * Filtros válidos para búsqueda
 */
export const VALID_FILTERS = [
  'page',
  'limit',
  'sort',
  'order',
  'category',
  'search',
  'minPrice',
  'maxPrice',
  'status',
  'visibility',
  'featured',
  'inStock',
  'brand'
];

/**
 * Campos de ordenamiento válidos
 */
export const VALID_SORT_FIELDS = [
  'createdAt',
  'price',
  'name',
  'salesCount',
  'views',
  'rating.average'
];

/**
 * Unidades de medida para peso
 */
export const WEIGHT_UNITS = {
  KG: 'kg',
  G: 'g',
  LB: 'lb',
  OZ: 'oz'
};

/**
 * Unidades de medida para dimensiones
 */
export const DIMENSION_UNITS = {
  CM: 'cm',
  M: 'm',
  IN: 'in',
  FT: 'ft'
};

/**
 * Valores de rating
 */
export const RATING = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 0
};

/**
 * Iconos de categorías comunes
 */
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
  'Hogar Inteligente': '🏠'
};

/**
 * Mensajes de disponibilidad
 */
export const AVAILABILITY_MESSAGES = {
  [AVAILABILITY_STATUS.AVAILABLE]: '✓ En stock',
  [AVAILABILITY_STATUS.LOW_STOCK]: '⚠️ Pocas unidades disponibles',
  [AVAILABILITY_STATUS.BACKORDER]: '📦 Disponible para pre-orden',
  [AVAILABILITY_STATUS.OUT_OF_STOCK]: '✗ Producto agotado',
  [AVAILABILITY_STATUS.UNAVAILABLE]: '✗ No disponible'
};

/**
 * Clases CSS para estados de disponibilidad
 */
export const AVAILABILITY_CLASSES = {
  [AVAILABILITY_STATUS.AVAILABLE]: 'text-green-600',
  [AVAILABILITY_STATUS.LOW_STOCK]: 'text-orange-600',
  [AVAILABILITY_STATUS.BACKORDER]: 'text-blue-600',
  [AVAILABILITY_STATUS.OUT_OF_STOCK]: 'text-red-600',
  [AVAILABILITY_STATUS.UNAVAILABLE]: 'text-gray-500'
};

/**
 * Colores de badges por estado
 */
export const STATUS_BADGE_COLORS = {
  [PRODUCT_STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [PRODUCT_STATUS.DRAFT]: 'bg-yellow-100 text-yellow-800',
  [PRODUCT_STATUS.ARCHIVED]: 'bg-gray-100 text-gray-800',
  [PRODUCT_STATUS.DISCONTINUED]: 'bg-red-100 text-red-800'
};

/**
 * Textos de estado de producto
 */
export const STATUS_LABELS = {
  [PRODUCT_STATUS.ACTIVE]: 'Activo',
  [PRODUCT_STATUS.DRAFT]: 'Borrador',
  [PRODUCT_STATUS.ARCHIVED]: 'Archivado',
  [PRODUCT_STATUS.DISCONTINUED]: 'Descontinuado'
};

/**
 * Configuración de query params por defecto
 */
export const DEFAULT_QUERY_PARAMS = {
  page: 1,
  limit: PAGINATION_LIMITS.DEFAULT,
  sort: PRODUCT_SORT_OPTIONS.NEWEST,
  order: SORT_ORDER.DESC,
  status: PRODUCT_STATUS.ACTIVE,
  visibility: PRODUCT_VISIBILITY.PUBLIC
};

/**
 * Configuración de imágenes
 */
export const IMAGE_CONFIG = {
  MAX_IMAGES: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_ALT: 'Imagen de producto'
};

/**
 * Configuración de placeholders
 */
export const PLACEHOLDERS = {
  IMAGE: '/placeholder-product.jpg',
  NAME: 'Producto sin nombre',
  DESCRIPTION: 'Sin descripción disponible',
  PRICE: 0
};

/**
 * Expresiones regulares de validación
 */
export const VALIDATION_PATTERNS = {
  SKU: /^[A-Z0-9-_]{3,50}$/,
  SLUG: /^[a-z0-9-]+$/,
  PRICE: /^\d+(\.\d{1,2})?$/
};

/**
 * Umbrales de descuento
 */
export const DISCOUNT_THRESHOLDS = {
  SMALL: 5,    // 5-15%
  MEDIUM: 15,  // 15-30%
  LARGE: 30    // 30%+
};

/**
 * Duración de productos "nuevos" en días
 */
export const NEW_PRODUCT_DAYS = 7;

/**
 * Configuración de búsqueda
 */
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_LIMIT: 10,
  DEBOUNCE_MS: 300
};

/**
 * Configuración de cache
 */
export const CACHE_CONFIG = {
  PRODUCTS_TTL: 5 * 60 * 1000, // 5 minutos
  FEATURED_TTL: 10 * 60 * 1000, // 10 minutos
  CATEGORIES_TTL: 30 * 60 * 1000 // 30 minutos
};