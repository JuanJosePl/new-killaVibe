import { createContext, useContext, useState, useCallback } from 'react';
import customerReviewsApi from '../api/customerReviews.api';

/**
 * @context CustomerReviewsContext
 * @description Estado global de reviews
 * 
 * Responsabilidades:
 * - CRUD de reviews propias
 * - Ver reviews de productos
 * - Estadísticas de reviews
 * - Marcar reviews útiles
 * - Reportar reviews
 * 
 * Contrato Backend:
 * - GET /api/reviews/products/:productId (reviews de producto)
 * - GET /api/reviews/products/:productId/stats (estadísticas)
 * - POST /api/reviews/products/:productId (crear review)
 * - PUT /api/reviews/:id (actualizar propia)
 * - DELETE /api/reviews/:id (eliminar propia)
 * - POST /api/reviews/:id/helpful (marcar útil)
 * - POST /api/reviews/:id/report (reportar)
 * 
 * Reglas:
 * - 1 review por usuario por producto (unique index)
 * - isVerified = true si usuario compró el producto
 * - Rating: 1-5 (integer)
 * - Comment: min 10, max 1000 chars
 * - Title: max 100 chars (opcional)
 */

const CustomerReviewsContext = createContext(null);

export const CustomerReviewsProvider = ({ children }) => {
  // Estado principal
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener reviews de un producto con filtros
   * 
   * @param {string} productId - ID del producto
   * @param {Object} filters
   * @param {number} filters.page - Página (default: 1)
   * @param {number} filters.limit - Límite (default: 10)
   * @param {number} filters.rating - Filtrar por rating (1-5)
   * @param {string} filters.verified - Solo verificadas ('true')
   * @param {string} filters.sortBy - Campo ordenamiento (default: 'createdAt')
   * @param {string} filters.sortOrder - Orden ('asc', 'desc')
   * @returns {Promise<Object>} { reviews, pagination }
   */
  const loadProductReviews = useCallback(async (productId, filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      setCurrentProductId(productId);
      
      const response = await customerReviewsApi.getProductReviews(productId, filters);
      
      setReviews(response.reviews || response.data || []);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error loading reviews:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener estadísticas de reviews de un producto
   * 
   * @param {string} productId - ID del producto
   * @returns {Promise<Object>} Stats
   * 
   * Response: {
   *   average: 4.5,
   *   total: 120,
   *   distribution: { 5: 80, 4: 25, 3: 10, 2: 3, 1: 2 },
   *   verifiedPercentage: 75
   * }
   */
  const loadReviewStats = useCallback(async (productId) => {
    try {
      const stats = await customerReviewsApi.getReviewStats(productId);
      setReviewStats(stats);
      return stats;
    } catch (err) {
      console.error('Error loading review stats:', err);
      throw err;
    }
  }, []);

  /**
   * Crear review para un producto
   * 
   * Validaciones:
   * - Usuario solo puede hacer 1 review por producto
   * - Rating: 1-5 (integer)
   * - Comment: min 10, max 1000 chars
   * - Title: max 100 chars (opcional)
   * 
   * @param {string} productId - ID del producto
   * @param {Object} reviewData
   * @param {number} reviewData.rating - Calificación (1-5)
   * @param {string} reviewData.title - Título (opcional)
   * @param {string} reviewData.comment - Comentario (requerido)
   * @param {Array} reviewData.images - Imágenes (opcional, max 5)
   * @returns {Promise<Object>} Review creada
   * 
   * @throws {409} Ya existe una review del usuario
   * @throws {400} Validación fallida
   */
  const createReview = useCallback(async (productId, reviewData) => {
    // Validar rating
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('La calificación debe ser entre 1 y 5');
    }

    // Validar comment
    if (!reviewData.comment || reviewData.comment.trim().length < 10) {
      throw new Error('El comentario debe tener al menos 10 caracteres');
    }

    if (reviewData.comment.length > 1000) {
      throw new Error('El comentario no puede tener más de 1000 caracteres');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const review = await customerReviewsApi.createReview(productId, reviewData);
      
      // Agregar la nueva review al inicio
      setReviews(prev => [review, ...prev]);
      
      // Recargar stats
      await loadReviewStats(productId);
      
      return review;
    } catch (err) {
      setError(err);
      console.error('Error creating review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [loadReviewStats]);

  /**
   * Actualizar review propia
   * 
   * @param {string} reviewId - ID de la review
   * @param {Object} reviewData - Datos a actualizar
   * @returns {Promise<Object>} Review actualizada
   * 
   * @throws {404} Review no encontrada
   * @throws {403} No es el propietario
   */
  const updateReview = useCallback(async (reviewId, reviewData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const review = await customerReviewsApi.updateReview(reviewId, reviewData);
      
      // Actualizar review en la lista
      setReviews(prev => 
        prev.map(r => r._id === reviewId ? review : r)
      );
      
      return review;
    } catch (err) {
      setError(err);
      console.error('Error updating review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Eliminar review propia
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<void>}
   * 
   * @throws {404} Review no encontrada
   * @throws {403} No es el propietario
   */
  const deleteReview = useCallback(async (reviewId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await customerReviewsApi.deleteReview(reviewId);
      
      // Eliminar review de la lista
      setReviews(prev => prev.filter(r => r._id !== reviewId));
      
      // Recargar stats si hay producto actual
      if (currentProductId) {
        await loadReviewStats(currentProductId);
      }
    } catch (err) {
      setError(err);
      console.error('Error deleting review:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentProductId, loadReviewStats]);

  /**
   * Marcar review como útil
   * 
   * @param {string} reviewId - ID de la review
   * @returns {Promise<void>}
   */
  const markAsHelpful = useCallback(async (reviewId) => {
    try {
      await customerReviewsApi.markAsHelpful(reviewId);
      
      // Incrementar contador localmente (optimistic update)
      setReviews(prev => 
        prev.map(r => 
          r._id === reviewId 
            ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 }
            : r
        )
      );
    } catch (err) {
      console.error('Error marking as helpful:', err);
      throw err;
    }
  }, []);

  /**
   * Reportar review inapropiada
   * 
   * @param {string} reviewId - ID de la review
   * @param {string} reason - Razón del reporte (min 10 chars)
   * @returns {Promise<void>}
   * 
   * @throws {400} Razón muy corta
   */
  const reportReview = useCallback(async (reviewId, reason) => {
    if (!reason || reason.trim().length < 10) {
      throw new Error('La razón debe tener al menos 10 caracteres');
    }

    try {
      await customerReviewsApi.reportReview(reviewId, reason);
      
      // Incrementar contador localmente
      setReviews(prev => 
        prev.map(r => 
          r._id === reviewId 
            ? { ...r, reportCount: (r.reportCount || 0) + 1 }
            : r
        )
      );
    } catch (err) {
      console.error('Error reporting review:', err);
      throw err;
    }
  }, []);

  /**
   * Verificar si el usuario puede hacer review
   * (debe haber comprado el producto)
   * 
   * @param {string} productId - ID del producto
   * @returns {boolean}
   */
  const canReview = useCallback((productId) => {
    // Esta validación la hace el backend verificando órdenes
    // Aquí solo verificamos si ya existe una review
    return !reviews.some(r => r.product === productId);
  }, [reviews]);

  /**
   * Obtener reviews por rating
   * 
   * @param {number} rating - Rating a filtrar (1-5)
   * @returns {Array}
   */
  const getReviewsByRating = useCallback((rating) => {
    return reviews.filter(r => r.rating === rating);
  }, [reviews]);

  /**
   * Obtener solo reviews verificadas
   * 
   * @returns {Array}
   */
  const getVerifiedReviews = useCallback(() => {
    return reviews.filter(r => r.isVerified);
  }, [reviews]);

  /**
   * Calcular rating promedio local
   * 
   * @returns {number}
   */
  const getAverageRating = useCallback(() => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  /**
   * Recargar reviews del producto actual
   */
  const refreshReviews = useCallback((filters) => {
    if (!currentProductId) return Promise.resolve();
    return loadProductReviews(currentProductId, filters);
  }, [currentProductId, loadProductReviews]);

  /**
   * Limpiar estado
   */
  const clearReviews = useCallback(() => {
    setReviews([]);
    setReviewStats(null);
    setCurrentProductId(null);
    setPagination(null);
  }, []);

  // Valores computados
  const hasReviews = reviews.length > 0;
  const verifiedCount = reviews.filter(r => r.isVerified).length;

  const value = {
    // Estado
    reviews,
    reviewStats,
    currentProductId,
    pagination,
    isLoading,
    error,
    
    // Valores computados
    hasReviews,
    verifiedCount,
    
    // Métodos
    loadProductReviews,
    loadReviewStats,
    createReview,
    updateReview,
    deleteReview,
    markAsHelpful,
    reportReview,
    canReview,
    getReviewsByRating,
    getVerifiedReviews,
    getAverageRating,
    refreshReviews,
    clearReviews,
  };

  return (
    <CustomerReviewsContext.Provider value={value}>
      {children}
    </CustomerReviewsContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerReviews = () => {
  const context = useContext(CustomerReviewsContext);
  if (!context) {
    throw new Error('useCustomerReviews must be used within CustomerReviewsProvider');
  }
  return context;
};

export default CustomerReviewsContext;