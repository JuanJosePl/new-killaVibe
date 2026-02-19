/**
 * @module ReviewsRepository
 * @description Repositorio de Reviews.
 *
 * ÚNICA capa que conecta reviewsAPI (infraestructura) con el Dominio.
 *
 * RESPONSABILIDADES:
 * - Llamar a reviewsAPI
 * - Mapear respuestas crudas a ReviewEntity / modelos de dominio
 * - Normalizar paginación y estadísticas
 * - Convertir errores de red en errores de dominio tipados
 *
 * No conoce React, Zustand ni el store.
 * No contiene lógica de negocio.
 */

import reviewsAPI from '../api/reviews.api.js';
import { ReviewEntity }                 from '../domain/review.entity.js';
import { ReviewStats, ReviewPagination } from '../domain/review.model.js';
import { normalizeReviewError }          from '../domain/review.errors.js';

/* ─── Helpers de mapeo ───────────────────────────────────────────── */

const toEntity   = (raw) => ReviewEntity.fromRaw(raw);
const toEntities = (arr) => (Array.isArray(arr) ? arr.map(toEntity) : []);

/* ─── Repositorio ────────────────────────────────────────────────── */

const reviewsRepository = {
  /**
   * Obtener reviews de un producto.
   * @returns {{ entities: ReviewEntity[], pagination: ReviewPagination }}
   */
  async getProductReviews(productId, filters = {}) {
    try {
      const response = await reviewsAPI.getProductReviews(productId, filters);
      return {
        entities   : toEntities(response?.data ?? response),
        pagination : ReviewPagination.fromRaw(response?.pagination ?? {}),
      };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Obtener estadísticas de reviews de un producto.
   * @returns {ReviewStats}
   */
  async getStats(productId) {
    try {
      const response = await reviewsAPI.getStats(productId);
      return ReviewStats.fromRaw(response?.data ?? response ?? {});
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Verificar si el usuario puede hacer review del producto.
   * @returns {{ canReview: boolean, reason?: string, hasPurchased?: boolean }}
   */
  async canReview(productId) {
    try {
      const response = await reviewsAPI.canReview(productId);
      return response?.data ?? { canReview: false };
    } catch {
      return { canReview: false, reason: 'Error al verificar permisos' };
    }
  },

  /**
   * Crear review.
   * @returns {ReviewEntity}
   */
  async create(productId, payload) {
    try {
      const response = await reviewsAPI.create(productId, payload);
      return toEntity(response?.data ?? {});
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Actualizar review.
   * @returns {ReviewEntity}
   */
  async update(reviewId, payload) {
    try {
      const response = await reviewsAPI.update(reviewId, payload);
      return toEntity(response?.data ?? {});
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Eliminar review.
   * @returns {{ success: boolean, message: string }}
   */
  async remove(reviewId) {
    try {
      const response = await reviewsAPI.remove(reviewId);
      return { success: true, message: response?.message ?? 'Review eliminada' };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Marcar review como útil.
   */
  async markHelpful(reviewId) {
    try {
      await reviewsAPI.markHelpful(reviewId);
      return { success: true };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Reportar review.
   */
  async report(reviewId, reason) {
    try {
      await reviewsAPI.report(reviewId, reason);
      return { success: true };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /**
   * Obtener mis reviews (usuario autenticado).
   * @returns {{ entities: ReviewEntity[], pagination: ReviewPagination }}
   */
  async getMyReviews(options = {}) {
    try {
      const response = await reviewsAPI.getMyReviews(options);
      return {
        entities   : toEntities(response?.data ?? []),
        pagination : ReviewPagination.fromRaw(response?.pagination ?? {}),
      };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  /* ── Admin ──────────────────────────────────────────────────────── */

  async getPending(filters = {}) {
    try {
      const response = await reviewsAPI.getPending(filters);
      return {
        entities   : toEntities(response?.data ?? []),
        pagination : ReviewPagination.fromRaw(response?.pagination ?? {}),
      };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  async approve(reviewId) {
    try {
      const response = await reviewsAPI.approve(reviewId);
      return { success: true, message: response?.message ?? 'Aprobada' };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },

  async reject(reviewId) {
    try {
      const response = await reviewsAPI.reject(reviewId);
      return { success: true, message: response?.message ?? 'Rechazada' };
    } catch (err) {
      throw normalizeReviewError(err);
    }
  },
};

export default reviewsRepository;