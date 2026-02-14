// src/modules/reviews/api/reviews.api.js

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module reviewsAPI
 * @description API calls para reviews
 * 
 * Sincronizado 100% con:
 * - review.controller.js
 * - review.routes.js
 * - review.service.js
 * 
 * IMPORTANTE: Todas las funciones retornan formato exacto del backend:
 * - { success, message?, data?, pagination?, errors? }
 */

export const reviewsAPI = {
  
  // ==========================================
  // RUTAS PÚBLICAS
  // ==========================================

  /**
   * @function getProductReviews
   * @description Obtener reviews de un producto con filtros y paginación
   * 
   * @route GET /api/reviews/products/:productId
   * @access Public
   * 
   * @param {string} productId - ID del producto
   * @param {Object} filters - Filtros opcionales
   * @param {number} [filters.page=1] - Página actual
   * @param {number} [filters.limit=10] - Reviews por página (max 50)
   * @param {number} [filters.rating] - Filtrar por rating (1-5)
   * @param {string} [filters.verified] - 'true' para solo verificados
   * @param {string} [filters.sortBy='createdAt'] - Campo de ordenamiento
   * @param {string} [filters.sortOrder='desc'] - Orden (asc/desc)
   * 
   * @returns {Promise<Object>} { success, count, data[], pagination }
   * 
   * @example
   * const response = await reviewsAPI.getProductReviews('507f1f77bcf86cd799439011', {
   *   page: 1,
   *   limit: 10,
   *   rating: 5,
   *   verified: 'true',
   *   sortBy: 'helpfulCount',
   *   sortOrder: 'desc'
   * });
   */
  getProductReviews: async (productId, filters = {}) => {
    const queryParams = new URLSearchParams();

    // Agregar solo filtros con valor
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/reviews/products/${productId}?${queryString}`
      : `/reviews/products/${productId}`;

    return await axiosInstance.get(url);
  },

  /**
   * @function getReviewStats
   * @description Obtener estadísticas de reviews de un producto
   * 
   * @route GET /api/reviews/products/:productId/stats
   * @access Public
   * 
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} { success, data: { average, total, distribution, verifiedPercentage } }
   * 
   * @example
   * const response = await reviewsAPI.getReviewStats('507f1f77bcf86cd799439011');
   * // {
   * //   success: true,
   * //   data: {
   * //     average: 4.5,
   * //     total: 120,
   * //     distribution: { 5: 80, 4: 30, 3: 5, 2: 3, 1: 2 },
   * //     verifiedPercentage: 85
   * //   }
   * // }
   */
  getReviewStats: async (productId) => {
    return await axiosInstance.get(`/reviews/products/${productId}/stats`);
  },

  // ==========================================
  // RUTAS PROTEGIDAS (Usuario autenticado)
  // ==========================================

  /**
   * @function createReview
   * @description Crear review para un producto
   * 
   * @route POST /api/reviews/products/:productId
   * @access Private (requiere autenticación)
   * 
   * @param {string} productId - ID del producto
   * @param {Object} reviewData - Datos de la review
   * @param {number} reviewData.rating - Calificación (1-5, requerido)
   * @param {string} reviewData.comment - Comentario (10-1000 chars, requerido)
   * @param {string} [reviewData.title] - Título opcional (max 100 chars)
   * @param {Array} [reviewData.images] - Imágenes opcionales (max 5)
   * 
   * @returns {Promise<Object>} { success, message, data }
   * @throws {Object} { success: false, message, statusCode: 400/401/409 }
   * 
   * @example
   * const response = await reviewsAPI.createReview('507f1f77bcf86cd799439011', {
   *   rating: 5,
   *   title: 'Excelente producto',
   *   comment: 'Muy buena calidad, llegó rápido y bien empacado. Lo recomiendo.',
   *   images: [{ url: 'https://...', alt: 'Imagen del producto' }]
   * });
   */
  createReview: async (productId, reviewData) => {
    return await axiosInstance.post(`/reviews/products/${productId}`, reviewData);
  },

  /**
   * @function updateReview
   * @description Actualizar review propia
   * 
   * @route PUT /api/reviews/:id
   * @access Private (solo propietario)
   * 
   * @param {string} reviewId - ID de la review
   * @param {Object} updateData - Datos a actualizar (al menos 1 campo)
   * @param {number} [updateData.rating] - Nueva calificación
   * @param {string} [updateData.title] - Nuevo título
   * @param {string} [updateData.comment] - Nuevo comentario
   * @param {Array} [updateData.images] - Nuevas imágenes
   * 
   * @returns {Promise<Object>} { success, message, data }
   * @throws {Object} { success: false, message, statusCode: 400/401/404 }
   * 
   * @example
   * const response = await reviewsAPI.updateReview('507f1f77bcf86cd799439011', {
   *   rating: 4,
   *   comment: 'Actualicé mi opinión después de más uso...'
   * });
   */
  updateReview: async (reviewId, updateData) => {
    return await axiosInstance.put(`/reviews/${reviewId}`, updateData);
  },

  /**
   * @function deleteReview
   * @description Eliminar review propia
   * 
   * @route DELETE /api/reviews/:id
   * @access Private (solo propietario)
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<Object>} { success, message }
   * @throws {Object} { success: false, message, statusCode: 401/404 }
   * 
   * @example
   * const response = await reviewsAPI.deleteReview('507f1f77bcf86cd799439011');
   */
  deleteReview: async (reviewId) => {
    return await axiosInstance.delete(`/reviews/${reviewId}`);
  },

  /**
   * @function markAsHelpful
   * @description Marcar review como útil
   * 
   * @route POST /api/reviews/:id/helpful
   * @access Private
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<Object>} { success, message }
   * @throws {Object} { success: false, message, statusCode: 401/404 }
   * 
   * @example
   * const response = await reviewsAPI.markAsHelpful('507f1f77bcf86cd799439011');
   */
  markAsHelpful: async (reviewId) => {
    return await axiosInstance.post(`/reviews/${reviewId}/helpful`);
  },

  /**
   * @function reportReview
   * @description Reportar review inapropiada
   * 
   * @route POST /api/reviews/:id/report
   * @access Private
   * 
   * @param {string} reviewId - ID de la review
   * @param {string} reason - Razón del reporte (10-500 chars, requerido)
   * @returns {Promise<Object>} { success, message }
   * @throws {Object} { success: false, message, statusCode: 400/401/404 }
   * 
   * @example
   * const response = await reviewsAPI.reportReview('507f1f77bcf86cd799439011', 
   *   'Contiene lenguaje ofensivo y no es una review real del producto'
   * );
   */
  reportReview: async (reviewId, reason) => {
    return await axiosInstance.post(`/reviews/${reviewId}/report`, { reason });
  },

  // ==========================================
  // RUTAS ADMINISTRATIVAS (Admin/Moderator)
  // ==========================================

  /**
   * @function getPendingReviews (ADMIN)
   * @description Obtener reviews pendientes de moderación
   * 
   * @route GET /api/reviews/admin/pending
   * @access Private/Admin/Moderator
   * 
   * @param {Object} [filters={}] - Filtros de paginación
   * @param {number} [filters.page=1] - Página actual
   * @param {number} [filters.limit=20] - Reviews por página (max 100)
   * 
   * @returns {Promise<Object>} { success, data[], pagination }
   * @throws {Object} { success: false, message, statusCode: 401/403 }
   * 
   * @example
   * const response = await reviewsAPI.getPendingReviews({ page: 1, limit: 20 });
   */
  getPendingReviews: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/reviews/admin/pending?${queryString}`
      : '/reviews/admin/pending';

    return await axiosInstance.get(url);
  },

  /**
   * @function approveReview (ADMIN)
   * @description Aprobar review
   * 
   * @route PUT /api/reviews/admin/:id/approve
   * @access Private/Admin/Moderator
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<Object>} { success, message }
   * @throws {Object} { success: false, message, statusCode: 401/403/404 }
   * 
   * @example
   * const response = await reviewsAPI.approveReview('507f1f77bcf86cd799439011');
   */
  approveReview: async (reviewId) => {
    return await axiosInstance.put(`/reviews/admin/${reviewId}/approve`);
  },

  /**
   * @function rejectReview (ADMIN)
   * @description Rechazar review
   * 
   * @route PUT /api/reviews/admin/:id/reject
   * @access Private/Admin/Moderator
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<Object>} { success, message }
   * @throws {Object} { success: false, message, statusCode: 401/403/404 }
   * 
   * @example
   * const response = await reviewsAPI.rejectReview('507f1f77bcf86cd799439011');
   */
  rejectReview: async (reviewId) => {
    return await axiosInstance.put(`/reviews/admin/${reviewId}/reject`);
  },
};

export default reviewsAPI;