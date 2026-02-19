/**
 * @module CategoriesAPI
 * @description Capa de acceso a red para el módulo Categories.
 *
 * RESPONSABILIDADES:
 * - Sólo comunicación HTTP con el backend.
 * - No transforma datos a entidades de dominio.
 * - No contiene lógica de negocio.
 * - No normaliza árboles ni genera SEO.
 *
 * Retorna el objeto de respuesta tal como lo entrega axios.
 * La transformación a entidades ocurre en categories.repository.js.
 *
 * ENDPOINTS:
 * GET  /api/categories
 * GET  /api/categories/tree
 * GET  /api/categories/featured
 * GET  /api/categories/popular
 * GET  /api/categories/search
 * GET  /api/categories/:slug
 * GET  /api/categories/:id/seo
 * POST /api/categories         (admin)
 * PUT  /api/categories/:id     (admin)
 * DEL  /api/categories/:id     (admin)
 */

import axiosInstance from '../../../core/api/axiosInstance';

const BASE = '/categories';

const categoriesAPI = {
  /**
   * GET /categories
   * @param {Object} params - featured, parentOnly, withProductCount, sortBy, page, limit
   */
  getAll: (params = {}) =>
    axiosInstance.get(BASE, { params }).then((r) => r.data),

  /**
   * GET /categories/tree
   */
  getTree: () =>
    axiosInstance.get(`${BASE}/tree`).then((r) => r.data),

  /**
   * GET /categories/featured
   * @param {number} limit
   */
  getFeatured: (limit = 6) =>
    axiosInstance.get(`${BASE}/featured`, { params: { limit } }).then((r) => r.data),

  /**
   * GET /categories/popular
   * @param {number} limit
   */
  getPopular: (limit = 10) =>
    axiosInstance.get(`${BASE}/popular`, { params: { limit } }).then((r) => r.data),

  /**
   * GET /categories/search?q=...
   * @param {string} query - mínimo 2 caracteres
   */
  search: (query) =>
    axiosInstance
      .get(`${BASE}/search`, { params: { q: query } })
      .then((r) => r.data),

  /**
   * GET /categories/:slug
   * @param {string} slug
   */
  getBySlug: (slug) =>
    axiosInstance.get(`${BASE}/${slug}`).then((r) => r.data),

  /**
   * GET /categories/:id/seo
   * @param {string} categoryId
   */
  getSEOContext: (categoryId) =>
    axiosInstance.get(`${BASE}/${categoryId}/seo`).then((r) => r.data),

  /**
   * POST /categories  (admin)
   * @param {Object} payload
   */
  create: (payload) =>
    axiosInstance.post(BASE, payload).then((r) => r.data),

  /**
   * PUT /categories/:id  (admin)
   * @param {string} categoryId
   * @param {Object} payload
   */
  update: (categoryId, payload) =>
    axiosInstance.put(`${BASE}/${categoryId}`, payload).then((r) => r.data),

  /**
   * DELETE /categories/:id  (admin)
   * @param {string} categoryId
   */
  remove: (categoryId) =>
    axiosInstance.delete(`${BASE}/${categoryId}`).then((r) => r.data),
};

export default categoriesAPI;