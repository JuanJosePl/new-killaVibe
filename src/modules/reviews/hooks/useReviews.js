// src/modules/reviews/hooks/useReviews.js

import { useState, useEffect, useCallback } from 'react';
import { reviewsAPI } from '../api/reviews.api';
import { DEFAULT_QUERY_PARAMS } from '../types/review.types';

/**
 * @hook useReviews
 * @description Hook principal para gestión de reviews de un producto
 * 
 * @param {string} productId - ID del producto
 * @param {Object} initialFilters - Filtros iniciales
 * @returns {Object} - Estado y funciones de reviews
 */
export const useReviews = (productId, initialFilters = {}) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: DEFAULT_QUERY_PARAMS.limit,
  });

  const [filters, setFilters] = useState({
    ...DEFAULT_QUERY_PARAMS,
    ...initialFilters,
  });

  /**
   * Fetch reviews con filtros actuales
   */
  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getProductReviews(productId, filters);

      if (response.success) {
        setReviews(response.data || []);
        setPagination(response.pagination || {});
      } else {
        setError(response.message || 'Error al cargar reviews');
        setReviews([]);
      }
    } catch (err) {
      console.error('[useReviews] Error fetching reviews:', err);
      setError(err.response?.data?.message || 'Error al cargar reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [productId, filters]);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  /**
   * Resetear filtros
   */
  const resetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_QUERY_PARAMS,
      ...initialFilters,
    });
  }, [initialFilters]);

  /**
   * Cambiar página
   */
  const changePage = useCallback((page) => {
    updateFilters({ page });
  }, [updateFilters]);

  /**
   * Refetch (recargar reviews)
   */
  const refetch = useCallback(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Effect: Cargar reviews cuando cambian filtros o productId
  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  return {
    reviews,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    changePage,
    refetch,
    hasReviews: reviews.length > 0,
  };
};

/**
 * @hook useReviewStats
 * @description Hook para estadísticas de reviews
 * 
 * @param {string} productId - ID del producto
 * @returns {Object} - Estadísticas y loading
 */
export const useReviewStats = (productId) => {
  const [stats, setStats] = useState({
    average: 0,
    total: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedPercentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.getReviewStats(productId);

      if (response.success) {
        setStats(response.data || {});
      } else {
        setError(response.message || 'Error al cargar estadísticas');
      }
    } catch (err) {
      console.error('[useReviewStats] Error:', err);
      setError(err.response?.data?.message || 'Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

/**
 * @hook useReviewActions
 * @description Hook para acciones de reviews (crear, actualizar, eliminar, etc.)
 * 
 * @param {string} productId - ID del producto
 * @param {Function} onSuccess - Callback al éxito
 * @returns {Object} - Funciones de acción y estados
 */
export const useReviewActions = (productId, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Crear review
   */
  const createReview = useCallback(async (reviewData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.createReview(productId, reviewData);

      if (response.success) {
        if (onSuccess) onSuccess(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al crear review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al crear review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [productId, onSuccess]);

  /**
   * Actualizar review
   */
  const updateReview = useCallback(async (reviewId, updateData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.updateReview(reviewId, updateData);

      if (response.success) {
        if (onSuccess) onSuccess(response.data);
        return { success: true, data: response.data };
      } else {
        setError(response.message || 'Error al actualizar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al actualizar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  /**
   * Eliminar review
   */
  const deleteReview = useCallback(async (reviewId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.deleteReview(reviewId);

      if (response.success) {
        if (onSuccess) onSuccess();
        return { success: true };
      } else {
        setError(response.message || 'Error al eliminar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al eliminar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  /**
   * Marcar como útil
   */
  const markAsHelpful = useCallback(async (reviewId) => {
    try {
      const response = await reviewsAPI.markAsHelpful(reviewId);

      if (response.success) {
        if (onSuccess) onSuccess();
        return { success: true };
      } else {
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al marcar como útil';
      return { success: false, error: errorMsg };
    }
  }, [onSuccess]);

  /**
   * Reportar review
   */
  const reportReview = useCallback(async (reviewId, reason) => {
    try {
      setLoading(true);
      setError(null);

      const response = await reviewsAPI.reportReview(reviewId, reason);

      if (response.success) {
        if (onSuccess) onSuccess();
        return { success: true };
      } else {
        setError(response.message || 'Error al reportar review');
        return { success: false, error: response.message };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al reportar review';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    createReview,
    updateReview,
    deleteReview,
    markAsHelpful,
    reportReview,
    loading,
    error,
  };
};

export default useReviews;