/**
 * @module reviews
 * @description Barrel público del módulo Reviews.
 *
 * Importa SIEMPRE desde este archivo, nunca desde rutas internas.
 *
 * @example
 * import { useReviews, useReviewActions, ReviewEntity } from 'modules/reviews';
 */

/* ─── Domain ─────────────────────────────────────────────────────── */

export { ReviewEntity }                   from './domain/review.entity.js';
export {
  ReviewStats,
  ReviewPagination,
  ReviewFilters,
  ReviewImage,
  RATING,
  MODERATION_STATUS,
  MODERATOR_ROLES,
  TEXT_LIMITS,
  IMAGE_LIMITS,
  SORT_OPTIONS,
  SORT_ORDER,
  DEFAULT_FILTERS,
  REPORT_THRESHOLDS,
  RATING_COLOR_CLASS,
  RATING_BAR_COLOR_CLASS,
  REPORT_REASONS,
  SUCCESS_MESSAGES,
}                                          from './domain/review.model.js';
export {
  isValidRating,
  isOwner,
  canEdit,
  canDelete,
  canModerate,
  canVoteHelpful,
  canReport,
  hasExistingReview,
  shouldAutoModerate,
  requiresManualReview,
  isValidModerationStatus,
  calculateAverage,
  calculateDistribution,
}                                          from './domain/review.rules.js';
export {
  validateRating,
  validateComment,
  validateTitle,
  validateImages,
  validateReportReason,
  validateProductId,
  validateCreatePayload,
  validateUpdatePayload,
  validateFilters,
  validateImageFile,
}                                          from './domain/review.validators.js';
export {
  ReviewDomainError,
  ReviewValidationError,
  ReviewNotFoundError,
  ReviewUnauthorizedError,
  ReviewDuplicateError,
  ReviewRatingError,
  ReviewModerationError,
  ReviewAPIError,
  normalizeReviewError,
}                                          from './domain/review.errors.js';

/* ─── Store + Selectores ─────────────────────────────────────────── */

export {
  useReviewsStore,
  selectReviewsForProduct,
  selectStatsForProduct,
  selectPaginationForProduct,
  selectFiltersForProduct,
  selectActiveProductId,
  selectReviewsLoading,
  selectStatsLoading,
  selectCreateLoading,
  selectUpdateLoading,
  selectDeleteLoading,
  selectHelpfulLoading,
  selectReportLoading,
  selectAdminLoading,
  selectReviewsError,
  selectStatsError,
  selectCreateError,
  selectUpdateError,
  selectDeleteError,
  selectAdminError,
}                                          from './presentation/store/reviews.store.js';

/* ─── Hooks ──────────────────────────────────────────────────────── */

export { default as useReviews }       from './presentation/hooks/useReviews.js';
export { default as useReviewActions } from './presentation/hooks/useReviewActions.js';
export { default as useReviewStats }   from './presentation/hooks/useReviewStats.js';

/* ─── Components ─────────────────────────────────────────────────── */

export { default as ProductReviewsSection } from './presentation/components/ProductReviewsSection.jsx';
export { default as ReviewCard }            from './presentation/components/ReviewCard.jsx';
export { default as ReviewFiltersComp }     from './presentation/components/ReviewFilters.jsx';
export { default as ReviewForm }            from './presentation/components/ReviewForm.jsx';
export { default as ReviewList }            from './presentation/components/ReviewList.jsx';
export { default as ReviewStats  }          from './presentation/components/ReviewStats.jsx';