// src/modules/reviews/components/ReviewCard.jsx

import React, { useState } from 'react';
import { 
  formatReviewDate, 
  getReviewerName, 
  getReviewerInitials,
  getRatingColor,
  isVerifiedReview,
  hasImages,
  isOwnReview
} from '../utils/reviewHelpers';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @component ReviewCard
 * @description Tarjeta individual de review
 * Sincronizado 100% con review.model.js del backend
 */
const ReviewCard = ({ 
  review, 
  onEdit, 
  onDelete, 
  onMarkHelpful, 
  onReport,
  showActions = true 
}) => {
  const { user, isAuthenticated } = useAuth();
  const [showFullComment, setShowFullComment] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Verificar si es review propia
  const isOwn = isOwnReview(review, user?._id);
  const isVerified = isVerifiedReview(review);
  const reviewerName = getReviewerName(review);
  const reviewerInitials = getReviewerInitials(review);
  const formattedDate = formatReviewDate(review.createdAt);
  const ratingColor = getRatingColor(review.rating);

  // Renderizar estrellas
  const renderStars = () => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  // Manejar eliminación
  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de eliminar esta review?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(review._id);
    } finally {
      setIsDeleting(false);
    }
  };

  // Manejar marcar como útil
  const handleMarkHelpful = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para marcar como útil');
      return;
    }
    await onMarkHelpful(review._id);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header - Usuario y fecha */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {review.user?.profile?.avatar ? (
              <img 
                src={review.user.profile.avatar} 
                alt={reviewerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <span>{reviewerInitials}</span>
            )}
          </div>

          {/* Info usuario */}
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{reviewerName}</h4>
              {isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  ✓ Compra verificada
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>
        </div>

        {/* Acciones propietario */}
        {showActions && isOwn && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(review)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Editar
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>

      {/* Rating y título */}
      <div className="mb-3">
        <div className="flex items-center gap-3 mb-2">
          {renderStars()}
          <span className={`font-semibold ${ratingColor}`}>
            {review.rating}.0
          </span>
        </div>
        
        {review.title && (
          <h5 className="font-semibold text-gray-900 text-lg">
            {review.title}
          </h5>
        )}
      </div>

      {/* Comentario */}
      <div className="mb-4">
        <p className="text-gray-700 leading-relaxed">
          {showFullComment || review.comment.length <= 300
            ? review.comment
            : `${review.comment.substring(0, 300)}...`}
        </p>
        
        {review.comment.length > 300 && (
          <button
            onClick={() => setShowFullComment(!showFullComment)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
          >
            {showFullComment ? 'Ver menos' : 'Ver más'}
          </button>
        )}
      </div>

      {/* Imágenes */}
      {hasImages(review) && (
        <div className="mb-4 flex gap-2 overflow-x-auto">
          {review.images.map((image, index) => (
            <img
              key={index}
              src={image.url}
              alt={image.alt || `Review image ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => window.open(image.url, '_blank')}
            />
          ))}
        </div>
      )}

      {/* Footer - Acciones */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {/* Botón útil */}
            <button
              onClick={handleMarkHelpful}
              disabled={!isAuthenticated}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>Útil ({review.helpfulCount || 0})</span>
            </button>

            {/* Botón reportar */}
            {!isOwn && isAuthenticated && (
              <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
                <span>Reportar</span>
              </button>
            )}
          </div>

          {/* Indicador de reportes (solo para moderadores) */}
          {review.reportCount > 0 && user?.role === 'admin' && (
            <span className="text-xs text-red-600 font-medium">
              ⚠️ {review.reportCount} reportes
            </span>
          )}
        </div>
      )}

      {/* Modal de reporte (simplificado) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reportar review</h3>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4"
              rows="4"
              placeholder="Explica por qué esta review es inapropiada (mínimo 10 caracteres)"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  const reason = document.querySelector('textarea').value;
                  if (reason.length >= 10) {
                    await onReport(review._id, reason);
                    setShowReportModal(false);
                  } else {
                    alert('La razón debe tener al menos 10 caracteres');
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;