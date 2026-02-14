// src/modules/customer/components/reviews/ReviewCard.jsx

import { useState } from 'react';
import { Star, ThumbsUp, Flag, CheckCircle, Clock } from 'lucide-react';

/**
 * @component ReviewCard
 * @description Card de reseña CON INTEGRACIÓN COMPLETA AL BACKEND
 * 
 * ✅ Sistema de "útiles" funcional
 * ✅ Sistema de reportes funcional
 * ✅ Badges de verificación y aprobación
 * ✅ Manejo de errores
 * 
 * @param {Object} review - Reseña completa
 * @param {string} productId - ID del producto
 * @param {Function} onHelpful - Handler para marcar útil (del backend)
 * @param {Function} onReport - Handler para reportar (del backend)
 * @param {boolean} showActions - Mostrar acciones de editar/eliminar
 * @param {boolean} isOwner - Si el usuario actual es el propietario
 */
const ReviewCard = ({ 
  review, 
  productId,
  onHelpful,
  onReport,
  showActions = false,
  isOwner = false 
}) => {
  // ============================================
  // ESTADO LOCAL
  // ============================================
  const [isHelpfulLoading, setIsHelpfulLoading] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [localHelpfulCount, setLocalHelpfulCount] = useState(review.helpfulCount || 0);
  const [hasVoted, setHasVoted] = useState(false);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Renderizar estrellas de rating
   */
  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  /**
   * Handler: Marcar como útil
   */
  const handleHelpful = async () => {
    if (hasVoted || isHelpfulLoading || !onHelpful) return;

    setIsHelpfulLoading(true);
    try {
      await onHelpful(review._id);
      
      // Actualizar contador localmente (optimistic update)
      setLocalHelpfulCount(prev => prev + 1);
      setHasVoted(true);
    } catch (error) {
      console.error('Error al marcar como útil:', error);
      alert('Error al marcar como útil. Intenta de nuevo.');
    } finally {
      setIsHelpfulLoading(false);
    }
  };

  /**
   * Handler: Reportar review
   */
  const handleReport = async () => {
    if (!reportReason.trim() || reportReason.length < 10) {
      alert('La razón debe tener al menos 10 caracteres');
      return;
    }

    if (!onReport) return;

    try {
      await onReport(review._id, reportReason);
      
      setIsReportModalOpen(false);
      setReportReason('');
      
      alert('✅ Reseña reportada exitosamente. Gracias por tu colaboración.');
    } catch (error) {
      console.error('Error al reportar:', error);
      alert('❌ Error al reportar la reseña. Intenta de nuevo.');
    }
  };

  /**
   * Formatear fecha
   */
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
        
        {/* HEADER */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {/* Rating + Badges */}
            <div className="flex items-center gap-3 mb-2">
              {renderStars(review.rating)}
              
              {review.isVerified && (
                <div className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2.5 py-1 rounded-full font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Compra Verificada
                </div>
              )}

              {!review.isApproved && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2.5 py-1 rounded-full font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Pendiente de Aprobación
                </div>
              )}
            </div>

            {/* Title */}
            {review.title && (
              <h3 className="font-bold text-lg text-gray-900 mb-1">
                {review.title}
              </h3>
            )}

            {/* User Info */}
            <p className="text-sm text-gray-600">
              Por <span className="font-semibold">
                {review.user?.profile?.firstName || 'Usuario'} {review.user?.profile?.lastName || ''}
              </span>
              {' · '}
              <span>{formatDate(review.createdAt)}</span>
            </p>
          </div>
        </div>

        {/* COMMENT */}
        <p className="text-gray-700 leading-relaxed mb-4">
          {review.comment}
        </p>

        {/* IMAGES */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {review.images.map((img, index) => (
              <div 
                key={index} 
                className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => window.open(img.url, '_blank')}
              >
                <img
                  src={img.url}
                  alt={img.alt || `Review image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* FOOTER - Interactions */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-gray-100">
          
          {/* Helpful Button */}
          <button
            onClick={handleHelpful}
            disabled={hasVoted || isHelpfulLoading || !onHelpful}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
              hasVoted 
                ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            } ${!onHelpful ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasVoted ? 'fill-current' : ''}`} />
            <span>
              {isHelpfulLoading ? 'Cargando...' : `Útil (${localHelpfulCount})`}
            </span>
          </button>

          {/* Report Button */}
          {!isOwner && onReport && (
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
            >
              <Flag className="w-4 h-4" />
              <span>Reportar</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL: Report Review */}
      {isReportModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Reportar Reseña
            </h3>
            <p className="text-gray-600 mb-4">
              Por favor explica por qué consideras que esta reseña es inapropiada.
            </p>

            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Ejemplo: Contenido ofensivo, spam, información falsa..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all resize-none"
              rows={4}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1 mb-6">
              {reportReason.length}/500 caracteres (mínimo 10)
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleReport}
                disabled={reportReason.length < 10}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Enviar Reporte
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReviewCard;