/**
 * @component ReviewCard
 * @description Tarjeta individual de review.
 *
 * Recibe un ReviewEntity — no accede a store ni Context.
 * Toda la lógica de display viene de los computed properties de la entidad.
 */

import React, { useState } from 'react';
import { useAuth } from '../../../../core/hooks/useAuth';
import { RATING_COLOR_CLASS } from '../../domain/review.model.js';

/* ─── Íconos inline ──────────────────────────────────────────────── */

const StarIcon = ({ filled }) => (
  <svg
    className={`w-5 h-5 ${filled ? 'text-yellow-400' : 'text-gray-200'}`}
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

/* ─── Modal de reporte ───────────────────────────────────────────── */

const ReportModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Reportar review</h3>
        <p className="text-sm text-gray-500 mb-4">
          Explica brevemente por qué consideras que esta review es inapropiada.
        </p>
        <textarea
          className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
          rows={4}
          placeholder="Mínimo 10 caracteres..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <p className="text-xs text-gray-400 mt-1 mb-4">{reason.length} / 500</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            disabled={reason.trim().length < 10}
            onClick={() => onConfirm(reason.trim())}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reportar
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─── ReviewCard ─────────────────────────────────────────────────── */

/**
 * @param {Object} props
 * @param {import('../../domain/review.entity.js').ReviewEntity} props.review
 * @param {Function} [props.onEdit]        - (review) => void
 * @param {Function} [props.onDelete]      - (reviewId) => Promise
 * @param {Function} [props.onMarkHelpful] - (reviewId) => Promise
 * @param {Function} [props.onReport]      - (reviewId, reason) => Promise
 * @param {boolean}  [props.showActions=true]
 */
const ReviewCard = ({
  review,
  onEdit,
  onDelete,
  onMarkHelpful,
  onReport,
  showActions = true,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [expanded, setExpanded]       = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const [showReport, setShowReport]   = useState(false);

  const isOwn         = review.isOwnedBy(user?._id);
  const hasVoted      = review.hasVotedHelpful(user?._id);
  const ratingColor   = RATING_COLOR_CLASS[review.rating] ?? 'text-gray-700';

  /* ── Handlers ─────────────────────────────────────────────────── */

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta review?')) return;
    setDeleting(true);
    try { await onDelete?.(review._id); }
    finally { setDeleting(false); }
  };

  const handleHelpful = async () => {
    if (!isAuthenticated) return;
    await onMarkHelpful?.(review._id);
  };

  const handleReportConfirm = async (reason) => {
    setShowReport(false);
    await onReport?.(review._id, reason);
  };

  /* ── Render ───────────────────────────────────────────────────── */

  const commentText = review.isLongComment()
    ? expanded ? review.comment : `${review.comment.substring(0, 300)}...`
    : review.comment;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 overflow-hidden">
              {review.user?.avatar
                ? <img src={review.user.avatar} alt={review.reviewerName} className="w-full h-full object-cover" />
                : <span>{review.reviewerInitials}</span>}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{review.reviewerName}</span>
                {review.isVerifiedPurchase && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓ Compra verificada
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{review.relativeDate}</p>
            </div>
          </div>

          {/* Acciones de propietario */}
          {showActions && isOwn && (
            <div className="flex items-center gap-3 shrink-0">
              <button onClick={() => onEdit?.(review)} className="text-xs text-blue-600 hover:underline">
                Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs text-red-500 hover:underline disabled:opacity-50"
              >
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
          )}
        </div>

        {/* Rating + título */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-1">
            {[1, 2, 3, 4, 5].map((s) => <StarIcon key={s} filled={s <= review.rating} />)}
            <span className={`text-sm font-semibold ml-1 ${ratingColor}`}>
              {review.displayRating}
            </span>
          </div>
          {review.hasTitle && (
            <h5 className="font-semibold text-gray-900">{review.title}</h5>
          )}
        </div>

        {/* Comentario */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed">{commentText}</p>
          {review.isLongComment() && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:underline text-xs font-medium mt-1"
            >
              {expanded ? 'Ver menos' : 'Ver más'}
            </button>
          )}
        </div>

        {/* Imágenes */}
        {review.hasImages && (
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {review.images.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt={img.alt || `Imagen ${i + 1}`}
                className="w-20 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 shrink-0"
                onClick={() => window.open(img.url, '_blank')}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              {/* Útil */}
              <button
                onClick={handleHelpful}
                disabled={!isAuthenticated || isOwn || hasVoted}
                title={!isAuthenticated ? 'Inicia sesión para votar' : isOwn ? 'No puedes votar tu propia review' : ''}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                </svg>
                <span>Útil ({review.helpfulCount ?? 0})</span>
              </button>

              {/* Reportar */}
              {!isOwn && isAuthenticated && (
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  <span>Reportar</span>
                </button>
              )}
            </div>

            {/* Badge admin: reportes */}
            {review.reportCount > 0 && user?.role === 'admin' && (
              <span className="text-xs text-red-500 font-medium">
                ⚠ {review.reportCount} reportes
              </span>
            )}
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal
          onConfirm={handleReportConfirm}
          onCancel={() => setShowReport(false)}
        />
      )}
    </>
  );
};

export default ReviewCard;