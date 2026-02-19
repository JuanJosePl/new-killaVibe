/**
 * @component ReviewList
 * @description Lista paginada de reviews con paginación inteligente.
 *
 * Recibe ReviewEntity[] y ReviewPagination — no accede a store.
 */

import React from 'react';
import ReviewCard from './ReviewCard.jsx';

/* ─── Skeleton ───────────────────────────────────────────────────── */

const SkeletonCard = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
    <div className="flex items-start gap-3 mb-4">
      <div className="w-11 h-11 bg-gray-200 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-1/4" />
        <div className="h-3 bg-gray-200 rounded w-1/6" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-3.5 bg-gray-200 rounded w-full" />
      <div className="h-3.5 bg-gray-200 rounded w-5/6" />
      <div className="h-3.5 bg-gray-200 rounded w-4/6" />
    </div>
  </div>
);

/* ─── Paginación ─────────────────────────────────────────────────── */

const Pagination = ({ pagination, onPageChange }) => {
  const { current, pages } = pagination;
  if (!pages || pages <= 1) return null;

  const MAX = 5;
  let start = Math.max(1, current - Math.floor(MAX / 2));
  let end   = Math.min(pages, start + MAX - 1);
  if (end - start < MAX - 1) start = Math.max(1, end - MAX + 1);
  const nums = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btnBase  = 'w-9 h-9 flex items-center justify-center text-sm border rounded-lg transition-colors';
  const btnNorm  = `${btnBase} border-gray-300 hover:bg-gray-50`;
  const btnAct   = `${btnBase} bg-blue-600 text-white border-blue-600`;
  const btnDisab = `${btnBase} border-gray-200 text-gray-300 cursor-not-allowed`;

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button
        onClick={() => onPageChange(current - 1)}
        disabled={current === 1}
        className={current === 1 ? btnDisab : btnNorm}
      >
        ←
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnNorm}>1</button>
          {start > 2 && <span className="text-gray-400 text-sm px-1">…</span>}
        </>
      )}

      {nums.map((n) => (
        <button key={n} onClick={() => onPageChange(n)} className={n === current ? btnAct : btnNorm}>
          {n}
        </button>
      ))}

      {end < pages && (
        <>
          {end < pages - 1 && <span className="text-gray-400 text-sm px-1">…</span>}
          <button onClick={() => onPageChange(pages)} className={btnNorm}>{pages}</button>
        </>
      )}

      <button
        onClick={() => onPageChange(current + 1)}
        disabled={current === pages}
        className={current === pages ? btnDisab : btnNorm}
      >
        →
      </button>
    </div>
  );
};

/* ─── ReviewList ─────────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {import('../../domain/review.entity.js').ReviewEntity[]}  props.reviews
 * @param {import('../../domain/review.model.js').ReviewPagination} props.pagination
 * @param {boolean}  [props.loading=false]
 * @param {string|null} [props.error=null]
 * @param {Function} [props.onEdit]
 * @param {Function} [props.onDelete]
 * @param {Function} [props.onMarkHelpful]
 * @param {Function} [props.onReport]
 * @param {Function} [props.onPageChange]
 * @param {boolean}  [props.showActions=true]
 */
const ReviewList = ({
  reviews = [],
  pagination,
  loading  = false,
  error    = null,
  onEdit,
  onDelete,
  onMarkHelpful,
  onReport,
  onPageChange,
  showActions = true,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => <SkeletonCard key={n} />)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <svg className="w-10 h-10 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-800 font-medium text-sm">{error}</p>
      </div>
    );
  }

  if (!reviews.length) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
        <svg className="w-14 h-14 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-base font-semibold text-gray-700 mb-1">Sin opiniones todavía</h3>
        <p className="text-sm text-gray-500">Sé el primero en compartir tu experiencia</p>
      </div>
    );
  }

  return (
    <div>
      {/* Rango de resultados */}
      {pagination?.total > 0 && (
        <p className="text-xs text-gray-500 mb-4">
          {pagination.displayRange} reviews
        </p>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkHelpful={onMarkHelpful}
            onReport={onReport}
            showActions={showActions}
          />
        ))}
      </div>

      {pagination && onPageChange && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default ReviewList;