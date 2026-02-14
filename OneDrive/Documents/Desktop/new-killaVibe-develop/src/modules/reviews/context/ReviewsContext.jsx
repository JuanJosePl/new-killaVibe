// src/modules/reviews/context/ReviewsContext.jsx

import { createContext, useContext, useState, useCallback } from 'react';
import { reviewsAPI } from '../api/reviews.api';
import { validateReview } from '../schemas/review.schema';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @context ReviewsContext
 * @description Contexto global para gestión de reviews
 * 
 * Incluye:
 * - Estado global de reviews por producto
 * - Caché de reviews y estadísticas
 * - Acciones CRUD
 * - Permisos y validaciones
 */

const ReviewsContext = createContext(null);

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews debe ser usado dentro de ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();

  // ========== ESTADO GLOBAL ==========
  const [reviewsCache, setReviewsCache] = useState(new Map()); // productId -> reviews[]
  const [statsCache, setStatsCache] = useState(new Map()); // productId -> stats
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ========== FUNCIONES DE REVIEWS ==========

  /**
   * Obtener reviews de un producto (con caché)
   */
  const getProductReviews = useCallback(async (productId, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar en caché
      const cacheKey = `${productId}-${JSON.stringify(filters)}`;
      if (reviewsCache.has(cacheKey)) {
        setLoading(false);
        return reviewsCache.get(cacheKey);
      }

      const response = await reviewsAPI.getProductReviews(productId, filters);

      if (response.success) {
        const result = {
          reviews: response.data || [],
          pagination: response.pagination || {},
        };

        // Actualizar caché
        reviewsCache.set(cacheKey, result);
        setReviewsCache(new Map(reviewsCache));

        return result;
      } else {
        setError(response.message || 'Error al cargar reviews');
        return { reviews: [], pagination: {} };
      }
    } catch (err) {
      console.error('[ReviewsContext] Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Error al cargar reviews');
      return { reviews: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, [reviewsCache]);

  /**
   * Obtener estadísticas de reviews (con caché)
   */
  const getReviewStats = useCallback(async (productId) => {
    try {
      // Buscar en caché
      if (statsCache.has(productId)) {
        return statsCache.get(productId);
      }

      const response = await reviewsAPI.getReviewStats(productId);

      if (response.success) {
        const stats = response.data;

        // Actualizar caché
        statsCache.set(productId, stats);
        setStatsCache(new Map(statsCache));

        return stats;
      } else {
        return {
          average: 0,
          total: 0,
          distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          verifiedPercentage: 0,
        };
      }
    } catch (err) {
      console.error('[ReviewsContext] Error fetching stats:', err);
      return {
        average: 0,
        total: 0,
        distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        verifiedPercentage: 0,
      };
    }
  }, [statsCache]);

  /**
   * Crear review
   */
  const createReview = useCallback(async (productId, reviewData) => {
    try {
      // Validar autenticación
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para crear una review');
      }

      // Validar datos
      const validation = await validateReview(reviewData, false);
      if (!validation.valid) {
        throw new Error(validation.errors[0]?.message || 'Datos inválidos');
      }

      setLoading(true);
      setError(null);

      const response = await reviewsAPI.createReview(productId, reviewData);

      if (response.success) {
        // Invalidar caché del producto
        invalidateProductCache(productId);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al crear review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al crear review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Actualizar review
   */
  const updateReview = useCallback(async (reviewId, updateData) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para actualizar una review');
      }

      // Validar datos
      const validation = await validateReview(updateData, true);
      if (!validation.valid) {
        throw new Error(validation.errors[0]?.message || 'Datos inválidos');
      }

      setLoading(true);
      setError(null);

      const response = await reviewsAPI.updateReview(reviewId, updateData);

      if (response.success) {
        // Invalidar caché global (no sabemos el productId aquí)
        clearCache();
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al actualizar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Eliminar review
   */
  const deleteReview = useCallback(async (reviewId) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión para eliminar una review');
      }

      setLoading(true);
      setError(null);

      const response = await reviewsAPI.deleteReview(reviewId);

      if (response.success) {
        // Invalidar caché global
        clearCache();
        return { success: true };
      } else {
        setError(response.message || 'Error al eliminar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al eliminar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Marcar review como útil
   */
  const markAsHelpful = useCallback(async (reviewId) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión');
      }

      const response = await reviewsAPI.markAsHelpful(reviewId);

      if (response.success) {
        // Invalidar caché
        clearCache();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al marcar como útil';
      return { success: false, error: errorMsg };
    }
  }, [isAuthenticated]);

  /**
   * Reportar review
   */
  const reportReview = useCallback(async (reviewId, reason) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Debes iniciar sesión');
      }

      setLoading(true);
      setError(null);

      const response = await reviewsAPI.reportReview(reviewId, reason);

      if (response.success) {
        return { success: true };
      } else {
        setError(response.message || 'Error al reportar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al reportar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // ========== FUNCIONES ADMINISTRATIVAS ==========

  /**
   * Obtener reviews pendientes (Admin)
   */
  const getPendingReviews = useCallback(async (filters = {}) => {
    try {
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        throw new Error('No tienes permisos para esta acción');
      }

      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getPendingReviews(filters);

      if (response.success) {
        return {
          reviews: response.data || [],
          pagination: response.pagination || {},
        };
      } else {
        setError(response.message || 'Error al cargar reviews pendientes');
        return { reviews: [], pagination: {} };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al cargar reviews pendientes';
      setError(errorMsg);
      return { reviews: [], pagination: {} };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Aprobar review (Admin)
   */
  const approveReview = useCallback(async (reviewId) => {
    try {
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        throw new Error('No tienes permisos para esta acción');
      }

      const response = await reviewsAPI.approveReview(reviewId);

      if (response.success) {
        clearCache();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al aprobar review';
      return { success: false, error: errorMsg };
    }
  }, [user]);

  /**
   * Rechazar review (Admin)
   */
  const rejectReview = useCallback(async (reviewId) => {
    try {
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        throw new Error('No tienes permisos para esta acción');
      }

      const response = await reviewsAPI.rejectReview(reviewId);

      if (response.success) {
        clearCache();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al rechazar review';
      return { success: false, error: errorMsg };
    }
  }, [user]);

  // ========== FUNCIONES DE CACHÉ ==========

  /**
   * Limpiar caché completo
   */
  const clearCache = useCallback(() => {
    setReviewsCache(new Map());
    setStatsCache(new Map());
  }, []);

  /**
   * Invalidar caché de un producto
   */
  const invalidateProductCache = useCallback((productId) => {
    const newReviewsCache = new Map(reviewsCache);
    const newStatsCache = new Map(statsCache);

    // Eliminar todas las entradas que contengan el productId
    for (const key of newReviewsCache.keys()) {
      if (key.startsWith(productId)) {
        newReviewsCache.delete(key);
      }
    }

    newStatsCache.delete(productId);

    setReviewsCache(newReviewsCache);
    setStatsCache(newStatsCache);
  }, [reviewsCache, statsCache]);

  // ========== PERMISOS ==========

  /**
   * Verificar si el usuario puede moderar
   */
  const canModerate = useCallback(() => {
    return user && ['admin', 'moderator'].includes(user.role);
  }, [user]);

  /**
   * Verificar si el usuario es dueño de la review
   */
  const isOwner = useCallback((review) => {
    if (!user || !review) return false;
    return review.user?._id === user._id || review.user === user._id;
  }, [user]);

  // ========== VALOR DEL CONTEXTO ==========
  const value = {
    // Estado
    loading,
    error,

    // Funciones de reviews
    getProductReviews,
    getReviewStats,
    createReview,
    updateReview,
    deleteReview,
    markAsHelpful,
    reportReview,

    // Funciones administrativas
    getPendingReviews,
    approveReview,
    rejectReview,

    // Funciones de caché
    clearCache,
    invalidateProductCache,

    // Permisos
    canModerate,
    isOwner,

    // Utilidades
    validateReview,
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};

export default ReviewsContext;