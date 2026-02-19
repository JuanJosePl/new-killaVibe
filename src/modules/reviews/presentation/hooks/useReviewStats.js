/**
 * @hook useReviewStats
 * @description Hook para estadísticas de reviews de un producto.
 *
 * Auto-fetch al montar. Expone también cómputo local para updates optimistas.
 *
 * @param {string} productId
 */

import { useEffect, useCallback } from 'react';
import {
  useReviewsStore,
  selectStatsForProduct,
  selectStatsLoading,
  selectStatsError,
} from '../store/reviews.store.js';
import reviewsService from '../../application/reviews.service.js';

const useReviewStats = (productId) => {
  const stats   = useReviewsStore(selectStatsForProduct(productId));
  const loading = useReviewsStore(selectStatsLoading);
  const error   = useReviewsStore(selectStatsError);

  const fetchStats = useReviewsStore((s) => s.fetchStats);

  // Auto-fetch
  useEffect(() => {
    if (!productId) return;
    fetchStats(productId);
  }, [productId, fetchStats]);

  const refetch = useCallback(() => {
    fetchStats(productId, true);
  }, [productId, fetchStats]);

  /**
   * Computa stats localmente desde un array de entidades.
   * Útil para preview optimista antes de que el backend responda.
   */
  const computeLocally = useCallback((entities = []) => {
    return reviewsService.computeStatsLocally(entities);
  }, []);

  return {
    stats,
    loading,
    error,
    hasStats   : stats.total > 0,
    average    : stats.displayAverage,
    total      : stats.total,
    distribution: stats.distribution,
    percentages: stats.percentages,
    verifiedPct: stats.verifiedPercentage,
    refetch,
    computeLocally,
  };
};

export default useReviewStats;