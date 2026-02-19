/**
 * @hook useReviewActions
 * @description Hook para mutaciones CRUD de reviews.
 *
 * Delega toda la lógica de negocio al store → service → repository.
 * Soporta callbacks onSuccess / onError para feedback en UI.
 *
 * @param {string} productId - Producto al que pertenecen las acciones
 * @param {Object} [options={}]
 * @param {Function} [options.onSuccess] - (message, entity?) => void
 * @param {Function} [options.onError]   - (ReviewDomainError) => void
 */

import { useCallback } from 'react';
import { useAuth } from '../../../../core/hooks/useAuth';
import {
  useReviewsStore,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  selectHelpfulLoading,
  selectReportLoading,
  selectAdminLoading,
  selectCreateError,
  selectUpdateError,
  selectDeleteError,
  selectAdminError,
} from '../store/reviews.store.js';
import { SUCCESS_MESSAGES } from '../../domain/review.model.js';

const useReviewActions = (productId, options = {}) => {
  const { onSuccess = null, onError = null } = options;
  const { user } = useAuth();

  // Store bindings
  const createReview   = useReviewsStore((s) => s.createReview);
  const updateReview   = useReviewsStore((s) => s.updateReview);
  const removeReview   = useReviewsStore((s) => s.removeReview);
  const markHelpful    = useReviewsStore((s) => s.markHelpful);
  const reportReview   = useReviewsStore((s) => s.reportReview);
  const approveReview  = useReviewsStore((s) => s.approveReview);
  const rejectReview   = useReviewsStore((s) => s.rejectReview);
  const fetchPending   = useReviewsStore((s) => s.fetchPending);
  const clearErrors    = useReviewsStore((s) => s.clearErrors);

  // Loading states (atómicos)
  const createLoading  = useReviewsStore(selectCreateLoading);
  const updateLoading  = useReviewsStore(selectUpdateLoading);
  const deleteLoading  = useReviewsStore(selectDeleteLoading);
  const helpfulLoading = useReviewsStore(selectHelpfulLoading);
  const reportLoading  = useReviewsStore(selectReportLoading);
  const adminLoading   = useReviewsStore(selectAdminLoading);

  // Error states
  const createError    = useReviewsStore(selectCreateError);
  const updateError    = useReviewsStore(selectUpdateError);
  const deleteError    = useReviewsStore(selectDeleteError);
  const adminError     = useReviewsStore(selectAdminError);

  /* ── Crear ──────────────────────────────────────────────────────── */

  const create = useCallback(async (data) => {
    try {
      const entity = await createReview(productId, data, user?._id);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_CREATED, entity);
      return entity;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [createReview, productId, user, onSuccess, onError]);

  /* ── Actualizar ─────────────────────────────────────────────────── */

  const update = useCallback(async (reviewId, data) => {
    try {
      const entity = await updateReview(reviewId, data, productId, user?._id, user?.role);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_UPDATED, entity);
      return entity;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [updateReview, productId, user, onSuccess, onError]);

  /* ── Eliminar ───────────────────────────────────────────────────── */

  const remove = useCallback(async (reviewId) => {
    try {
      const result = await removeReview(reviewId, productId, user?._id, user?.role);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_DELETED);
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [removeReview, productId, user, onSuccess, onError]);

  /* ── Marcar útil ────────────────────────────────────────────────── */

  const helpful = useCallback(async (reviewId) => {
    try {
      const result = await markHelpful(reviewId, productId, user?._id);
      onSuccess?.(SUCCESS_MESSAGES.MARKED_HELPFUL);
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [markHelpful, productId, user, onSuccess, onError]);

  /* ── Reportar ───────────────────────────────────────────────────── */

  const report = useCallback(async (reviewId, reason) => {
    try {
      const result = await reportReview(reviewId, reason, productId, user?._id);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_REPORTED);
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [reportReview, productId, user, onSuccess, onError]);

  /* ── Admin ──────────────────────────────────────────────────────── */

  const getPending = useCallback(async (filters = {}) => {
    try {
      return await fetchPending(filters, user?.role);
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [fetchPending, user, onError]);

  const approve = useCallback(async (reviewId) => {
    try {
      const result = await approveReview(reviewId, user?.role);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_APPROVED);
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [approveReview, user, onSuccess, onError]);

  const reject = useCallback(async (reviewId) => {
    try {
      const result = await rejectReview(reviewId, user?.role);
      onSuccess?.(SUCCESS_MESSAGES.REVIEW_REJECTED);
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [rejectReview, user, onSuccess, onError]);

  /* ── Utils ──────────────────────────────────────────────────────── */

  const clearError = useCallback(() => clearErrors(), [clearErrors]);

  return {
    // Acciones de usuario
    create,
    update,
    remove,
    helpful,
    report,

    // Acciones admin
    getPending,
    approve,
    reject,

    // Loading (atómico por operación)
    createLoading,
    updateLoading,
    deleteLoading,
    helpfulLoading,
    reportLoading,
    adminLoading,
    anyLoading : createLoading || updateLoading || deleteLoading,

    // Errores
    createError,
    updateError,
    deleteError,
    adminError,

    // Utils
    clearError,
  };
};

export default useReviewActions;