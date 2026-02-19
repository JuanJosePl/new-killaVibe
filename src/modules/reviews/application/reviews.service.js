/**
 * @module ReviewsService
 * @description Capa de aplicación del dominio Review.
 *
 * RESPONSABILIDADES:
 * - Orquestar operaciones de dominio
 * - Aplicar reglas de negocio antes de delegar al repositorio
 * - Calcular promedio y distribución de estrellas
 * - Filtrar y ordenar reviews localmente cuando sea necesario
 * - Validar permisos antes de mutaciones
 *
 * No conoce React, Zustand, hooks ni el store.
 */

import reviewsRepository from '../infrastructure/reviews.repository.js';
import { ReviewStats, ReviewFilters } from '../domain/review.model.js';
import {
  isValidRating,
  isOwner,
  canEdit,
  canDelete,
  canModerate,
  canVoteHelpful,
  canReport,
  calculateAverage,
  calculateDistribution,
} from '../domain/review.rules.js';
import {
  validateCreatePayload,
  validateUpdatePayload,
  validateReportReason,
  validateFilters,
} from '../domain/review.validators.js';
import {
  ReviewValidationError,
  ReviewUnauthorizedError,
  ReviewRatingError,
  ReviewDuplicateError,
} from '../domain/review.errors.js';

/* ─── Servicio ───────────────────────────────────────────────────── */

const reviewsService = {
  /* ── Consultas ──────────────────────────────────────────────────── */

  /**
   * Obtener reviews paginadas de un producto con validación de filtros.
   * @returns {{ entities, pagination }}
   */
  async getProductReviews(productId, rawFilters = {}) {
    const filters = ReviewFilters.fromRaw(rawFilters);

    const filterValidation = validateFilters(filters.toQueryParams());
    if (!filterValidation.valid) {
      throw new ReviewValidationError(filterValidation.errors);
    }

    return reviewsRepository.getProductReviews(productId, filters.toQueryParams());
  },

  /**
   * Obtener estadísticas de un producto desde el backend.
   * @returns {ReviewStats}
   */
  async getStats(productId) {
    return reviewsRepository.getStats(productId);
  },

  /**
   * Calcular estadísticas localmente a partir de un array de entidades.
   * Útil para actualizar stats optimísticamente sin llamada de red.
   *
   * @param {import('../domain/review.entity.js').ReviewEntity[]} reviews
   * @returns {ReviewStats}
   */
  computeStatsLocally(reviews = []) {
    const total        = reviews.length;
    const average      = calculateAverage(reviews);
    const distribution = calculateDistribution(reviews);
    const verified     = reviews.filter((r) => r.isVerified).length;
    const verifiedPercentage = total > 0 ? Math.round((verified / total) * 100) : 0;

    return ReviewStats.fromRaw({ average, total, distribution, verifiedPercentage });
  },

  /**
   * Verificar si el usuario puede hacer review del producto.
   */
  async canReview(productId) {
    return reviewsRepository.canReview(productId);
  },

  /**
   * Obtener mis reviews.
   */
  async getMyReviews(options = {}) {
    return reviewsRepository.getMyReviews(options);
  },

  /* ── Mutaciones de usuario ──────────────────────────────────────── */

  /**
   * Crear review con validación de dominio completa.
   *
   * @param {string} productId
   * @param {Object} data - { rating, comment, title?, images? }
   * @param {string} userId - ID del usuario autenticado
   */
  async create(productId, data, userId) {
    if (!userId) {
      throw new ReviewUnauthorizedError('crear una review');
    }

    if (!isValidRating(data.rating)) {
      throw new ReviewRatingError(data.rating);
    }

    const validation = validateCreatePayload(data);
    if (!validation.valid) {
      throw new ReviewValidationError(validation.errors);
    }

    return reviewsRepository.create(productId, {
      rating  : data.rating,
      comment : data.comment.trim(),
      ...(data.title  && { title  : data.title.trim() }),
      ...(data.images?.length && { images : data.images }),
    });
  },

  /**
   * Actualizar review con validación de dominio.
   *
   * @param {string} reviewId
   * @param {Object} data
   * @param {import('../domain/review.entity.js').ReviewEntity} entity - Entidad actual
   * @param {string} userId
   */
  async update(reviewId, data, entity, userId) {
    if (!userId) {
      throw new ReviewUnauthorizedError('actualizar una review');
    }

    if (entity && !canEdit(entity, userId)) {
      throw new ReviewUnauthorizedError('editar esta review');
    }

    if (data.rating !== undefined && !isValidRating(data.rating)) {
      throw new ReviewRatingError(data.rating);
    }

    const validation = validateUpdatePayload(data);
    if (!validation.valid) {
      throw new ReviewValidationError(validation.errors);
    }

    return reviewsRepository.update(reviewId, data);
  },

  /**
   * Eliminar review.
   *
   * @param {string} reviewId
   * @param {import('../domain/review.entity.js').ReviewEntity} entity
   * @param {string} userId
   * @param {string} userRole
   */
  async remove(reviewId, entity, userId, userRole) {
    if (!userId) {
      throw new ReviewUnauthorizedError('eliminar una review');
    }

    if (entity && !canDelete(entity, userId, userRole)) {
      throw new ReviewUnauthorizedError('eliminar esta review');
    }

    return reviewsRepository.remove(reviewId);
  },

  /**
   * Marcar review como útil.
   */
  async markHelpful(reviewId, entity, userId) {
    if (!userId) {
      throw new ReviewUnauthorizedError('votar como útil');
    }

    if (entity && !canVoteHelpful(entity, userId)) {
      throw new ReviewUnauthorizedError('votar tu propia review como útil');
    }

    return reviewsRepository.markHelpful(reviewId);
  },

  /**
   * Reportar review.
   */
  async report(reviewId, reason, entity, userId) {
    if (!userId) {
      throw new ReviewUnauthorizedError('reportar una review');
    }

    if (entity && !canReport(entity, userId)) {
      throw new ReviewUnauthorizedError('reportar tu propia review');
    }

    const validation = validateReportReason(reason);
    if (!validation.valid) {
      throw new ReviewValidationError({ reason: validation.error });
    }

    return reviewsRepository.report(reviewId, reason);
  },

  /* ── Mutaciones administrativas ─────────────────────────────────── */

  /**
   * Obtener reviews pendientes de moderación.
   */
  async getPending(filters, userRole) {
    if (!canModerate(userRole)) {
      throw new ReviewUnauthorizedError('moderar reviews');
    }
    return reviewsRepository.getPending(filters);
  },

  /**
   * Aprobar review.
   */
  async approve(reviewId, userRole) {
    if (!canModerate(userRole)) {
      throw new ReviewUnauthorizedError('aprobar reviews');
    }
    return reviewsRepository.approve(reviewId);
  },

  /**
   * Rechazar review.
   */
  async reject(reviewId, userRole) {
    if (!canModerate(userRole)) {
      throw new ReviewUnauthorizedError('rechazar reviews');
    }
    return reviewsRepository.reject(reviewId);
  },

  /* ── Utilidades de filtrado y ordenamiento (sin estado) ─────────── */

  /**
   * Filtra un array local de entidades por rating.
   */
  filterByRating(entities = [], rating) {
    if (!rating) return entities;
    return entities.filter((r) => r.rating === Number(rating));
  },

  /**
   * Filtra sólo reviews verificadas.
   */
  filterVerified(entities = []) {
    return entities.filter((r) => r.isVerified);
  },

  /**
   * Ordena localmente. Usado para re-ordenar sin nuevo fetch.
   */
  sort(entities = [], sortBy = 'createdAt', sortOrder = 'desc') {
    const sorted = [...entities];
    const dir    = sortOrder === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (a.rating - b.rating) * dir;
        case 'helpfulCount':
          return ((a.helpfulCount ?? 0) - (b.helpfulCount ?? 0)) * dir;
        case 'createdAt':
        default: {
          const da = a.createdAt ? a.createdAt.getTime() : 0;
          const db = b.createdAt ? b.createdAt.getTime() : 0;
          return (da - db) * dir;
        }
      }
    });

    return sorted;
  },
};

export default reviewsService;