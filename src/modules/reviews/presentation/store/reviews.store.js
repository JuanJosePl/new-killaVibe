/**
 * @module ReviewsStore
 * @description Store Zustand para el módulo Reviews.
 *
 * Reemplaza completamente a:
 * - ReviewsContext.jsx
 * - CustomerReviewsContext.jsx
 *
 * RESPONSABILIDADES:
 * - Estado de reviews por producto (caché con TTL)
 * - Estado de stats por producto
 * - Acciones atómicas (fetch, create, update, delete, helpful, report)
 * - Selectores granulares
 * - Actualizaciones optimistas para UX
 *
 * REGLAS:
 * - No contiene lógica de dominio (delega al Service)
 * - Acciones son fire-and-forget o retornan entidades
 * - No conoce componentes React
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import reviewsService from '../../application/reviews.service.js';
import { ReviewStats, ReviewPagination, ReviewFilters } from '../../domain/review.model.js';

/* ─── Configuración de caché ─────────────────────────────────────── */

const CACHE_TTL = {
  reviews : 5  * 60 * 1000,  // 5 min
  stats   : 10 * 60 * 1000,  // 10 min
};

const isStale = (ts, ttl) => !ts || (Date.now() - ts > ttl);

/* ─── Estado inicial ─────────────────────────────────────────────── */

const INITIAL_STATE = {
  // Map: productId → ReviewEntity[]
  reviewsByProduct : {},

  // Map: productId → ReviewStats
  statsByProduct   : {},

  // Map: productId → ReviewPagination
  paginationByProduct: {},

  // Map: productId → ReviewFilters
  filtersByProduct : {},

  // Map: productId → timestamp (para TTL)
  _reviewTimestamps: {},
  _statsTimestamps : {},

  // Producto activo
  activeProductId  : null,

  // Loading por operación
  loading: {
    reviews : false,
    stats   : false,
    create  : false,
    update  : false,
    delete  : false,
    helpful : false,
    report  : false,
    admin   : false,
  },

  // Errores por operación
  error: {
    reviews : null,
    stats   : null,
    create  : null,
    update  : null,
    delete  : null,
    helpful : null,
    report  : null,
    admin   : null,
  },
};

/* ─── Store ──────────────────────────────────────────────────────── */

export const useReviewsStore = create(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    /* ── Helpers internos ─────────────────────────────────────────── */

    _setLoading: (key, val) =>
      set((s) => ({ loading: { ...s.loading, [key]: val } })),

    _setError: (key, val) =>
      set((s) => ({ error: { ...s.error, [key]: val } })),

    /* ── Fetch reviews ────────────────────────────────────────────── */

    fetchReviews: async (productId, rawFilters = {}, forceRefresh = false) => {
      const { _reviewTimestamps, _setLoading, _setError } = get();

      const ts      = _reviewTimestamps[productId];
      const filters = ReviewFilters.fromRaw(rawFilters);

      if (!forceRefresh && !isStale(ts, CACHE_TTL.reviews)) {
        set({ activeProductId: productId });
        return get().reviewsByProduct[productId] ?? [];
      }

      _setLoading('reviews', true);
      _setError('reviews', null);

      try {
        const { entities, pagination } = await reviewsService.getProductReviews(
          productId,
          filters.toQueryParams()
        );

        set((s) => ({
          reviewsByProduct    : { ...s.reviewsByProduct,     [productId]: entities },
          paginationByProduct : { ...s.paginationByProduct,  [productId]: pagination },
          filtersByProduct    : { ...s.filtersByProduct,     [productId]: filters },
          _reviewTimestamps   : { ...s._reviewTimestamps,    [productId]: Date.now() },
          activeProductId     : productId,
        }));

        return entities;
      } catch (err) {
        _setError('reviews', err.message);
        throw err;
      } finally {
        _setLoading('reviews', false);
      }
    },

    /* ── Fetch stats ──────────────────────────────────────────────── */

    fetchStats: async (productId, forceRefresh = false) => {
      const { _statsTimestamps, _setLoading, _setError } = get();

      if (!forceRefresh && !isStale(_statsTimestamps[productId], CACHE_TTL.stats)) {
        return get().statsByProduct[productId] ?? ReviewStats.empty();
      }

      _setLoading('stats', true);
      _setError('stats', null);

      try {
        const stats = await reviewsService.getStats(productId);
        set((s) => ({
          statsByProduct   : { ...s.statsByProduct,    [productId]: stats },
          _statsTimestamps : { ...s._statsTimestamps,  [productId]: Date.now() },
        }));
        return stats;
      } catch (err) {
        _setError('stats', err.message);
        // No lanzar — stats no deberían romper la UI
        return ReviewStats.empty();
      } finally {
        _setLoading('stats', false);
      }
    },

    /* ── Crear review ─────────────────────────────────────────────── */

    createReview: async (productId, data, userId) => {
      const { _setLoading, _setError } = get();

      _setLoading('create', true);
      _setError('create', null);

      try {
        const entity = await reviewsService.create(productId, data, userId);

        // Optimistic: agregar al principio de la lista
        set((s) => ({
          reviewsByProduct  : {
            ...s.reviewsByProduct,
            [productId]: [entity, ...(s.reviewsByProduct[productId] ?? [])],
          },
          // Invalidar stats
          _statsTimestamps  : { ...s._statsTimestamps, [productId]: null },
        }));

        return entity;
      } catch (err) {
        _setError('create', err.message);
        throw err;
      } finally {
        _setLoading('create', false);
      }
    },

    /* ── Actualizar review ────────────────────────────────────────── */

    updateReview: async (reviewId, data, productId, userId, userRole) => {
      const { _setLoading, _setError } = get();
      const reviews  = get().reviewsByProduct[productId] ?? [];
      const entity   = reviews.find((r) => r._id === reviewId) ?? null;

      _setLoading('update', true);
      _setError('update', null);

      try {
        const updated = await reviewsService.update(reviewId, data, entity, userId);

        set((s) => ({
          reviewsByProduct : {
            ...s.reviewsByProduct,
            [productId]: (s.reviewsByProduct[productId] ?? []).map(
              (r) => r._id === reviewId ? updated : r
            ),
          },
        }));

        return updated;
      } catch (err) {
        _setError('update', err.message);
        throw err;
      } finally {
        _setLoading('update', false);
      }
    },

    /* ── Eliminar review ──────────────────────────────────────────── */

    removeReview: async (reviewId, productId, userId, userRole) => {
      const { _setLoading, _setError } = get();
      const reviews = get().reviewsByProduct[productId] ?? [];
      const entity  = reviews.find((r) => r._id === reviewId) ?? null;

      _setLoading('delete', true);
      _setError('delete', null);

      try {
        const result = await reviewsService.remove(reviewId, entity, userId, userRole);

        set((s) => ({
          reviewsByProduct : {
            ...s.reviewsByProduct,
            [productId]: (s.reviewsByProduct[productId] ?? []).filter(
              (r) => r._id !== reviewId
            ),
          },
          _statsTimestamps : { ...s._statsTimestamps, [productId]: null },
        }));

        return result;
      } catch (err) {
        _setError('delete', err.message);
        throw err;
      } finally {
        _setLoading('delete', false);
      }
    },

    /* ── Marcar útil ──────────────────────────────────────────────── */

    markHelpful: async (reviewId, productId, userId) => {
      const { _setLoading, _setError } = get();
      const reviews = get().reviewsByProduct[productId] ?? [];
      const entity  = reviews.find((r) => r._id === reviewId) ?? null;

      _setLoading('helpful', true);
      _setError('helpful', null);

      try {
        await reviewsService.markHelpful(reviewId, entity, userId);

        // Optimistic update del contador
        set((s) => ({
          reviewsByProduct: {
            ...s.reviewsByProduct,
            [productId]: (s.reviewsByProduct[productId] ?? []).map((r) =>
              r._id === reviewId
                ? Object.assign(Object.create(Object.getPrototypeOf(r)), r, {
                    helpfulCount: (r.helpfulCount ?? 0) + 1,
                  })
                : r
            ),
          },
        }));

        return { success: true };
      } catch (err) {
        _setError('helpful', err.message);
        throw err;
      } finally {
        _setLoading('helpful', false);
      }
    },

    /* ── Reportar review ──────────────────────────────────────────── */

    reportReview: async (reviewId, reason, productId, userId) => {
      const { _setLoading, _setError } = get();
      const reviews = get().reviewsByProduct[productId] ?? [];
      const entity  = reviews.find((r) => r._id === reviewId) ?? null;

      _setLoading('report', true);
      _setError('report', null);

      try {
        await reviewsService.report(reviewId, reason, entity, userId);
        return { success: true };
      } catch (err) {
        _setError('report', err.message);
        throw err;
      } finally {
        _setLoading('report', false);
      }
    },

    /* ── Filtros / Paginación ─────────────────────────────────────── */

    setFilters: (productId, rawFilters) => {
      set((s) => ({
        filtersByProduct    : {
          ...s.filtersByProduct,
          [productId]: ReviewFilters.fromRaw(rawFilters),
        },
        // Invalidar caché para que se re-fetchee con nuevos filtros
        _reviewTimestamps   : { ...s._reviewTimestamps, [productId]: null },
      }));
    },

    setPage: (productId, page) => {
      const current = get().filtersByProduct[productId] ?? ReviewFilters.defaults();
      set((s) => ({
        filtersByProduct    : { ...s.filtersByProduct, [productId]: current.withPage(page) },
        _reviewTimestamps   : { ...s._reviewTimestamps, [productId]: null },
      }));
    },

    /* ── Admin ────────────────────────────────────────────────────── */

    fetchPending: async (filters, userRole) => {
      const { _setLoading, _setError } = get();
      _setLoading('admin', true);
      _setError('admin', null);
      try {
        return await reviewsService.getPending(filters, userRole);
      } catch (err) {
        _setError('admin', err.message);
        throw err;
      } finally {
        _setLoading('admin', false);
      }
    },

    approveReview: async (reviewId, userRole) => {
      const { _setLoading, _setError } = get();
      _setLoading('admin', true);
      _setError('admin', null);
      try {
        return await reviewsService.approve(reviewId, userRole);
      } catch (err) {
        _setError('admin', err.message);
        throw err;
      } finally {
        _setLoading('admin', false);
      }
    },

    rejectReview: async (reviewId, userRole) => {
      const { _setLoading, _setError } = get();
      _setLoading('admin', true);
      _setError('admin', null);
      try {
        return await reviewsService.reject(reviewId, userRole);
      } catch (err) {
        _setError('admin', err.message);
        throw err;
      } finally {
        _setLoading('admin', false);
      }
    },

    /* ── Invalidación / Reset ─────────────────────────────────────── */

    invalidateProduct: (productId) =>
      set((s) => ({
        _reviewTimestamps: { ...s._reviewTimestamps, [productId]: null },
        _statsTimestamps : { ...s._statsTimestamps,  [productId]: null },
      })),

    clearErrors: () =>
      set({
        error: {
          reviews: null, stats: null, create: null,
          update: null,  delete: null, helpful: null, report: null, admin: null,
        },
      }),

    reset: () => set(INITIAL_STATE),
  }))
);

/* ─── Selectores granulares ──────────────────────────────────────── */

export const selectReviewsForProduct = (productId) => (s) =>
  s.reviewsByProduct[productId] ?? [];

export const selectStatsForProduct = (productId) => (s) =>
  s.statsByProduct[productId] ?? ReviewStats.empty();

export const selectPaginationForProduct = (productId) => (s) =>
  s.paginationByProduct[productId] ?? ReviewPagination.empty();

export const selectFiltersForProduct = (productId) => (s) =>
  s.filtersByProduct[productId] ?? ReviewFilters.defaults();

export const selectActiveProductId = (s) => s.activeProductId;

// Loading
export const selectReviewsLoading = (s) => s.loading.reviews;
export const selectStatsLoading   = (s) => s.loading.stats;
export const selectCreateLoading  = (s) => s.loading.create;
export const selectUpdateLoading  = (s) => s.loading.update;
export const selectDeleteLoading  = (s) => s.loading.delete;
export const selectHelpfulLoading = (s) => s.loading.helpful;
export const selectReportLoading  = (s) => s.loading.report;
export const selectAdminLoading   = (s) => s.loading.admin;

// Errors
export const selectReviewsError   = (s) => s.error.reviews;
export const selectStatsError     = (s) => s.error.stats;
export const selectCreateError    = (s) => s.error.create;
export const selectUpdateError    = (s) => s.error.update;
export const selectDeleteError    = (s) => s.error.delete;
export const selectAdminError     = (s) => s.error.admin;