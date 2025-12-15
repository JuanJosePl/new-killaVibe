// src/modules/reviews/types/review.types.js

/**
 * @module review.types
 * @description Tipos, constantes y enums para reviews
 * Sincronizado 100% con review.model.js del backend
 */

/**
 * Valores de rating permitidos
 */
export const RATING_VALUES = {
  MIN: 1,
  MAX: 5,
  DEFAULT: 5,
};

/**
 * Límites de texto
 */
export const TEXT_LIMITS = {
  TITLE_MAX: 100,
  COMMENT_MIN: 10,
  COMMENT_MAX: 1000,
  REPORT_REASON_MIN: 10,
  REPORT_REASON_MAX: 500,
  IMAGE_ALT_MAX: 200,
};

/**
 * Límites de paginación
 */
export const PAGINATION_LIMITS = {
  MIN: 1,
  DEFAULT: 10,
  MAX: 50,
  ADMIN_DEFAULT: 20,
  ADMIN_MAX: 100,
};

/**
 * Límites de imágenes
 */
export const IMAGE_LIMITS = {
  MAX_IMAGES: 5,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};

/**
 * Opciones de ordenamiento
 */
export const SORT_OPTIONS = {
  NEWEST: 'createdAt',
  RATING: 'rating',
  HELPFUL: 'helpfulCount',
};

/**
 * Direcciones de ordenamiento
 */
export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
};

/**
 * Estados de moderación
 */
export const MODERATION_STATUS = {
  APPROVED: 'approved',
  PENDING: 'pending',
  REJECTED: 'rejected',
};

/**
 * Umbrales de reportes
 */
export const REPORT_THRESHOLDS = {
  AUTO_MODERATE: 5, // Reviews con 5+ reportes se auto-moderan
  REVIEW_REQUIRED: 3, // Reviews con 3+ reportes necesitan revisión
};

/**
 * Iconos de rating
 */
export const RATING_ICONS = {
  1: '⭐',
  2: '⭐⭐',
  3: '⭐⭐⭐',
  4: '⭐⭐⭐⭐',
  5: '⭐⭐⭐⭐⭐',
};

/**
 * Colores de rating
 */
export const RATING_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-green-500',
};

/**
 * Mensajes de estado
 */
export const STATUS_MESSAGES = {
  VERIFIED: '✓ Compra verificada',
  NOT_VERIFIED: 'Usuario no verificado',
  PENDING_MODERATION: '⏳ Pendiente de moderación',
  REJECTED: '✗ Rechazada',
  REPORTED: '⚠️ Reportada',
};

/**
 * Configuración de query params por defecto
 */
export const DEFAULT_QUERY_PARAMS = {
  page: 1,
  limit: PAGINATION_LIMITS.DEFAULT,
  sortBy: SORT_OPTIONS.NEWEST,
  sortOrder: SORT_ORDER.DESC,
};

/**
 * Razones de reporte predefinidas
 */
export const REPORT_REASONS = {
  SPAM: 'Spam o contenido irrelevante',
  OFFENSIVE: 'Lenguaje ofensivo o inapropiado',
  FAKE: 'Review falsa o fraudulenta',
  INAPPROPRIATE: 'Contenido inapropiado',
  COPYRIGHT: 'Violación de derechos de autor',
  OTHER: 'Otra razón',
};

/**
 * Placeholders
 */
export const PLACEHOLDERS = {
  TITLE: 'Resume tu experiencia en pocas palabras',
  COMMENT: 'Comparte tu experiencia con este producto. ¿Qué te gustó? ¿Qué podrían mejorar?',
  REPORT_REASON: 'Explica por qué esta review es inapropiada',
  NO_REVIEWS: 'Aún no hay opiniones para este producto',
  NO_IMAGES: 'Sin imágenes',
};

/**
 * Mensajes de validación
 */
export const VALIDATION_MESSAGES = {
  RATING_REQUIRED: 'La calificación es requerida',
  RATING_INVALID: 'La calificación debe ser entre 1 y 5',
  COMMENT_REQUIRED: 'El comentario es requerido',
  COMMENT_TOO_SHORT: 'El comentario debe tener al menos 10 caracteres',
  COMMENT_TOO_LONG: 'El comentario no puede tener más de 1000 caracteres',
  TITLE_TOO_LONG: 'El título no puede tener más de 100 caracteres',
  TOO_MANY_IMAGES: 'Máximo 5 imágenes por review',
  REPORT_REASON_REQUIRED: 'La razón del reporte es requerida',
  REPORT_REASON_TOO_SHORT: 'La razón debe tener al menos 10 caracteres',
  DUPLICATE_REVIEW: 'Ya has hecho una review para este producto',
};

/**
 * Mensajes de éxito
 */
export const SUCCESS_MESSAGES = {
  REVIEW_CREATED: 'Review creada exitosamente',
  REVIEW_UPDATED: 'Review actualizada exitosamente',
  REVIEW_DELETED: 'Review eliminada exitosamente',
  MARKED_HELPFUL: 'Marcado como útil',
  REVIEW_REPORTED: 'Review reportada exitosamente',
  REVIEW_APPROVED: 'Review aprobada exitosamente',
  REVIEW_REJECTED: 'Review rechazada exitosamente',
};

/**
 * Mensajes de error
 */
export const ERROR_MESSAGES = {
  REVIEW_NOT_FOUND: 'Review no encontrada',
  PRODUCT_NOT_FOUND: 'Producto no encontrado',
  UNAUTHORIZED: 'No tienes permiso para realizar esta acción',
  ALREADY_REVIEWED: 'Ya has hecho una review para este producto',
  NETWORK_ERROR: 'Error de conexión. Intenta de nuevo.',
  GENERIC_ERROR: 'Ocurrió un error. Intenta de nuevo.',
};

/**
 * Configuración de cache
 */
export const CACHE_CONFIG = {
  REVIEWS_TTL: 5 * 60 * 1000, // 5 minutos
  STATS_TTL: 10 * 60 * 1000, // 10 minutos
};

/**
 * Configuración de filtros
 */
export const FILTER_CONFIG = {
  SHOW_VERIFIED_ONLY: 'verified',
  SHOW_WITH_IMAGES: 'withImages',
  MIN_RATING: 'minRating',
};

/**
 * Badges de review
 */
export const REVIEW_BADGES = {
  VERIFIED: {
    text: 'Compra verificada',
    color: 'bg-green-100 text-green-800',
    icon: '✓',
  },
  TOP_REVIEWER: {
    text: 'Top Reviewer',
    color: 'bg-purple-100 text-purple-800',
    icon: '⭐',
  },
  HELPFUL: {
    text: 'Útil',
    color: 'bg-blue-100 text-blue-800',
    icon: '👍',
  },
};

/**
 * Configuración de notificaciones
 */
export const NOTIFICATION_CONFIG = {
  SHOW_SUCCESS: true,
  SHOW_ERROR: true,
  AUTO_DISMISS: true,
  DISMISS_DELAY: 3000, // 3 segundos
};

/**
 * Campos permitidos para actualización
 */
export const UPDATABLE_FIELDS = ['rating', 'title', 'comment', 'images'];

/**
 * Roles con permisos de moderación
 */
export const MODERATOR_ROLES = ['admin', 'moderator'];

/**
 * Formatos de fecha
 */
export const DATE_FORMATS = {
  FULL: 'DD/MM/YYYY HH:mm',
  SHORT: 'DD/MM/YYYY',
  RELATIVE: 'relative', // "hace 2 días"
};