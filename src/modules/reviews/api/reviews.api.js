/**
 * @module ReviewsAPI
 * @description Capa de acceso a red del módulo Reviews.
 *
 * RESPONSABILIDADES:
 * - Solo comunicación HTTP con el backend
 * - No calcula promedios ni distribuciones
 * - No transforma a entidades de dominio
 * - No contiene lógica de negocio
 * - No valida reglas de dominio
 *
 * Consolida y reemplaza:
 * - reviews.api.js (módulo reviews)
 * - customerReviews.api.js (módulo customer)
 *
 * ENDPOINTS:
 * GET  /reviews/products/:productId           (público)
 * GET  /reviews/products/:productId/stats     (público)
 * GET  /reviews/products/:productId/can-review (privado)
 * POST /reviews/products/:productId           (privado)
 * PUT  /reviews/:id                           (privado — propietario)
 * DEL  /reviews/:id                           (privado — propietario)
 * POST /reviews/:id/helpful                   (privado)
 * POST /reviews/:id/report                    (privado)
 * GET  /reviews/my-reviews                    (privado)
 * GET  /reviews/admin/pending                 (admin/moderator)
 * PUT  /reviews/admin/:id/approve             (admin/moderator)
 * PUT  /reviews/admin/:id/reject              (admin/moderator)
 */

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * Construye query string sólo con parámetros con valor definido.
 */
const buildParams = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null && v !== ''
    )
  );

const reviewsAPI = {
  /* ── Rutas públicas ──────────────────────────────────────────── */

  /**
   * GET /reviews/products/:productId
   * @param {string} productId
   * @param {Object} filters - page, limit, rating, verified, sortBy, sortOrder
   */
  getProductReviews: (productId, filters = {}) =>
    axiosInstance
      .get(`/reviews/products/${productId}`, { params: buildParams(filters) })
      .then((r) => r.data),

  /**
   * GET /reviews/products/:productId/stats
   */
  getStats: (productId) =>
    axiosInstance
      .get(`/reviews/products/${productId}/stats`)
      .then((r) => r.data),

  /* ── Rutas privadas (usuario autenticado) ────────────────────── */

  /**
   * GET /reviews/products/:productId/can-review
   * Verifica si el usuario puede hacer review (no tiene una ya + compró el producto)
   */
  canReview: (productId) =>
    axiosInstance
      .get(`/reviews/products/${productId}/can-review`)
      .then((r) => r.data),

  /**
   * POST /reviews/products/:productId
   * @param {string} productId
   * @param {{ rating, comment, title?, images? }} payload
   */
  create: (productId, payload) =>
    axiosInstance
      .post(`/reviews/products/${productId}`, payload)
      .then((r) => r.data),

  /**
   * PUT /reviews/:id
   * @param {string} reviewId
   * @param {{ rating?, comment?, title?, images? }} payload
   */
  update: (reviewId, payload) =>
    axiosInstance
      .put(`/reviews/${reviewId}`, payload)
      .then((r) => r.data),

  /**
   * DELETE /reviews/:id
   */
  remove: (reviewId) =>
    axiosInstance
      .delete(`/reviews/${reviewId}`)
      .then((r) => r.data),

  /**
   * POST /reviews/:id/helpful
   */
  markHelpful: (reviewId) =>
    axiosInstance
      .post(`/reviews/${reviewId}/helpful`)
      .then((r) => r.data),

  /**
   * POST /reviews/:id/report
   * @param {string} reviewId
   * @param {string} reason
   */
  report: (reviewId, reason) =>
    axiosInstance
      .post(`/reviews/${reviewId}/report`, { reason })
      .then((r) => r.data),

  /**
   * GET /reviews/my-reviews
   * @param {{ page?, limit? }} options
   */
  getMyReviews: (options = {}) =>
    axiosInstance
      .get('/reviews/my-reviews', { params: buildParams(options) })
      .then((r) => r.data),

  /* ── Rutas administrativas ───────────────────────────────────── */

  /**
   * GET /reviews/admin/pending
   * @param {{ page?, limit? }} filters
   */
  getPending: (filters = {}) =>
    axiosInstance
      .get('/reviews/admin/pending', { params: buildParams(filters) })
      .then((r) => r.data),

  /**
   * PUT /reviews/admin/:id/approve
   */
  approve: (reviewId) =>
    axiosInstance
      .put(`/reviews/admin/${reviewId}/approve`)
      .then((r) => r.data),

  /**
   * PUT /reviews/admin/:id/reject
   */
  reject: (reviewId) =>
    axiosInstance
      .put(`/reviews/admin/${reviewId}/reject`)
      .then((r) => r.data),
};

export default reviewsAPI;