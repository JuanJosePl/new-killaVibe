// src/modules/customer/api/customerReviews.api.js

import axiosInstance from "../../../core/api/axiosInstance";

/**
 * @module customerReviewsApi
 * @description Cliente API para el módulo de reviews
 *
 * Endpoints disponibles:
 * - Obtener reviews de un producto
 * - Crear, actualizar, eliminar reviews
 * - Marcar como útil
 * - Reportar reviews
 * - Estadísticas de reviews
 *
 * Contrato con Backend:
 * - Base URL: /api/reviews
 * - Autenticación: JWT Bearer Token (automático con axiosInstance)
 * - Manejo de errores: Interceptors configurados
 */

const customerReviewsApi = {
  /**
   * Obtener reviews de un producto
   *
   * @param {string} productId - ID del producto
   * @param {Object} filters - Filtros opcionales
   * @param {number} filters.page - Página actual (default: 1)
   * @param {number} filters.limit - Resultados por página (default: 10)
   * @param {number} filters.rating - Filtrar por rating (1-5)
   * @param {string} filters.verified - Solo verificadas ('true')
   * @param {string} filters.sortBy - Campo para ordenar (default: 'createdAt')
   * @param {string} filters.sortOrder - Orden ('asc', 'desc')
   * @returns {Promise<Object>} { reviews, pagination }
   *
   * @example
   * const { reviews, pagination } = await customerReviewsApi.getProductReviews(productId, {
   *   page: 1,
   *   limit: 10,
   *   rating: 5,
   *   sortBy: 'createdAt',
   *   sortOrder: 'desc'
   * });
   */
  getProductReviews: async (productId, filters = {}) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/products/${productId}`,
        {
          params: filters,
        }
      );

      return {
        reviews: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    } catch (error) {
      console.error("Error obteniendo reviews del producto:", error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de reviews de un producto
   *
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Estadísticas completas
   *
   * Response: {
   *   average: 4.5,
   *   total: 120,
   *   distribution: { 5: 80, 4: 25, 3: 10, 2: 3, 1: 2 },
   *   verifiedPercentage: 75
   * }
   *
   * @example
   * const stats = await customerReviewsApi.getReviewStats(productId);
   * console.log(`Promedio: ${stats.average} ⭐`);
   */
  getReviewStats: async (productId) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/products/${productId}/stats`
      );
      return response.data.data || {};
    } catch (error) {
      console.error("Error obteniendo estadísticas de reviews:", error);
      throw error;
    }
  },

  /**
   * Crear nueva review para un producto
   *
   * Validaciones automáticas del backend:
   * - Usuario solo puede hacer 1 review por producto
   * - Rating: 1-5 (integer)
   * - Comment: min 10, max 1000 chars
   * - Title: max 100 chars (opcional)
   * - isVerified: true si usuario compró el producto
   *
   * @param {string} productId - ID del producto
   * @param {Object} reviewData - Datos de la review
   * @param {number} reviewData.rating - Calificación (1-5)
   * @param {string} reviewData.title - Título (opcional)
   * @param {string} reviewData.comment - Comentario (requerido)
   * @param {Array} reviewData.images - Imágenes (opcional, max 5)
   * @returns {Promise<Object>} Review creada
   *
   * @throws {409} Ya existe una review del usuario
   * @throws {400} Validación fallida
   *
   * @example
   * const review = await customerReviewsApi.createReview(productId, {
   *   rating: 5,
   *   title: "¡Excelente producto!",
   *   comment: "Superó mis expectativas. Lo recomiendo totalmente.",
   *   images: [{ url: 'https://...', alt: 'Foto del producto' }]
   * });
   */
  createReview: async (productId, reviewData) => {
    try {
      const response = await axiosInstance.post(
        `/reviews/products/${productId}`,
        reviewData
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error creando review:", error);

      // Manejo de errores específicos
      if (error.response?.status === 409) {
        throw {
          statusCode: 409,
          message: "Ya has publicado una reseña para este producto",
        };
      }

      throw error;
    }
  },

  /**
   * Actualizar review propia
   *
   * Solo el propietario puede actualizar su review
   *
   * @param {string} reviewId - ID de la review
   * @param {Object} reviewData - Datos a actualizar
   * @returns {Promise<Object>} Review actualizada
   *
   * @throws {404} Review no encontrada
   * @throws {403} No es el propietario
   *
   * @example
   * const updated = await customerReviewsApi.updateReview(reviewId, {
   *   rating: 4,
   *   comment: "Actualicé mi opinión después de 3 meses de uso..."
   * });
   */
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await axiosInstance.put(
        `/reviews/${reviewId}`,
        reviewData
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error("Error actualizando review:", error);
      throw error;
    }
  },

  /**
   * Eliminar review propia
   *
   * Solo el propietario puede eliminar su review
   *
   * @param {string} reviewId - ID de la review
   * @returns {Promise<void>}
   *
   * @throws {404} Review no encontrada
   * @throws {403} No es el propietario
   *
   * @example
   * await customerReviewsApi.deleteReview(reviewId);
   */
  deleteReview: async (reviewId) => {
    try {
      await axiosInstance.delete(`/reviews/${reviewId}`);
    } catch (error) {
      console.error("Error eliminando review:", error);
      throw error;
    }
  },

  /**
   * Marcar review como útil
   *
   * Incrementa el contador de "útiles" de la review
   *
   * TODO Backend: Implementar sistema para evitar múltiples votos del mismo usuario
   *
   * @param {string} reviewId - ID de la review
   * @returns {Promise<void>}
   *
   * @example
   * await customerReviewsApi.markAsHelpful(reviewId);
   */
  markAsHelpful: async (reviewId) => {
    try {
      await axiosInstance.post(`/reviews/${reviewId}/helpful`);
    } catch (error) {
      console.error("Error marcando como útil:", error);
      throw error;
    }
  },

  /**
   * Reportar review inapropiada
   *
   * Si una review alcanza 5 reportes, se auto-modera (isApproved: false)
   *
   * @param {string} reviewId - ID de la review
   * @param {string} reason - Razón del reporte (min 10 chars)
   * @returns {Promise<void>}
   *
   * @throws {400} Razón muy corta
   *
   * @example
   * await customerReviewsApi.reportReview(reviewId,
   *   "Contenido ofensivo que viola las políticas de la comunidad"
   * );
   */
  reportReview: async (reviewId, reason) => {
    try {
      await axiosInstance.post(`/reviews/${reviewId}/report`, { reason });
    } catch (error) {
      console.error("Error reportando review:", error);
      throw error;
    }
  },

  /**
   * Obtener mis reviews (usuario autenticado)
   *
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<Object>} { reviews, pagination }
   *
   * @example
   * const { reviews } = await customerReviewsApi.getMyReviews({ page: 1, limit: 10 });
   */
  getMyReviews: async (options = {}) => {
    try {
      const response = await axiosInstance.get("/reviews/my-reviews", {
        params: options,
      });

      return {
        reviews: response.data.data || [],
        pagination: response.data.pagination || {},
      };
    } catch (error) {
      console.error("Error obteniendo mis reviews:", error);
      throw error;
    }
  },

  /**
   * Verificar si el usuario puede hacer review de un producto
   *
   * Verifica:
   * - Si ya tiene una review para este producto
   * - Si compró el producto (para isVerified)
   *
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} { canReview, reason, hasPurchased }
   *
   * @example
   * const { canReview, reason } = await customerReviewsApi.canReviewProduct(productId);
   * if (!canReview) {
   *   alert(reason);
   * }
   */
  canReviewProduct: async (productId) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/products/${productId}/can-review`
      );
      return response.data.data || { canReview: false };
    } catch (error) {
      console.error("Error verificando permiso de review:", error);
      return { canReview: false, reason: "Error al verificar permisos" };
    }
  },
};

export default customerReviewsApi;
