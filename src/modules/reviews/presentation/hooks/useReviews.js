/**
 * @hook useReviews
 * @description Hook de lectura de reviews para un producto.
 *
 * Consume el store Zustand. No contiene lógica de negocio.
 * Auto-fetch al montar y cuando cambian productId o filtros.
 *
 * @param {string} productId
 * @param {Object} [initialFilters={}]
 */

import { useEffect, useCallback } from 'react';
import {
  useReviewsStore,
  selectReviewsForProduct,
  selectPaginationForProduct,
  selectFiltersForProduct,
  selectReviewsLoading,
  selectReviewsError,
} from '../store/reviews.store.js';

const useReviews = (productId, initialFilters = {}) => {
  // Store bindings
  const reviews    = useReviewsStore(selectReviewsForProduct(productId));
  const pagination = useReviewsStore(selectPaginationForProduct(productId));
  const filters    = useReviewsStore(selectFiltersForProduct(productId));
  const loading    = useReviewsStore(selectReviewsLoading);
  const error      = useReviewsStore(selectReviewsError);

  const fetchReviews = useReviewsStore((s) => s.fetchReviews);
  const setFilters   = useReviewsStore((s) => s.setFilters);
  const setPage      = useReviewsStore((s) => s.setPage);

  // Auto-fetch al montar o cuando cambie productId
  useEffect(() => {
    if (!productId) return;
    fetchReviews(productId, initialFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Re-fetch cuando cambian los filtros del store
  useEffect(() => {
    if (!productId) return;
    fetchReviews(productId, filters.toQueryParams());
  }, [productId, fetchReviews, filters]);

  /* ── Acciones de UI ─────────────────────────────────────────────── */

  const updateFilters = useCallback((newFilters) => {
    setFilters(productId, { ...filters, ...newFilters });
  }, [productId, setFilters, filters]);

  const resetFilters = useCallback(() => {
    setFilters(productId, {});
  }, [productId, setFilters]);

  const changePage = useCallback((page) => {
    setPage(productId, page);
  }, [productId, setPage]);

  const refetch = useCallback(() => {
    fetchReviews(productId, filters.toQueryParams(), true);
  }, [productId, fetchReviews, filters]);

  return {
    // Data
    reviews,
    pagination,
    filters,
    hasReviews  : reviews.length > 0,
    count       : reviews.length,

    // State
    loading,
    error,

    // Actions
    updateFilters,
    resetFilters,
    changePage,
    refetch,
  };
};

export default useReviews;