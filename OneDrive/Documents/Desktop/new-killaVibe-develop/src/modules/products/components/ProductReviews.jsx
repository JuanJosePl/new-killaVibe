import { useState } from 'react';
import { Star, ThumbsUp, MessageCircle, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * ProductReviews - Sistema completo de reseñas
 * Integrado con la estructura del backend de KillaVibes
 * 
 * ✅ FIXES APLICADOS:
 * 1. Validaciones completas de rating.distribution
 * 2. Manejo de casos null/undefined
 * 3. Validación de autenticación para escribir reviews
 * 4. ReviewCard con validaciones robustas
 * 5. Nota sobre integración futura con módulo reviews
 * 
 * @param {Object} product - Producto con rating: { average, count, distribution }
 * @param {Array} reviews - Array de reseñas (cuando se integre el módulo reviews)
 * @param {Function} onSubmitReview - Callback para enviar review
 */
export function ProductReviews({ product, reviews = [], onSubmitReview, className = '' }) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews');
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  // ✅ Validación de producto
  if (!product) return null;

  // ✅ Extracción segura de rating
  const rating = product.rating || {};
  const averageRating = rating.average || 0;
  const totalReviews = rating.count || 0;
  const distribution = rating.distribution || {
    _1: 0,
    _2: 0,
    _3: 0,
    _4: 0,
    _5: 0,
  };

  // ✅ Calcular porcentajes para la distribución
  const getRatingPercentage = (starLevel) => {
    if (totalReviews === 0) return 0;
    const count = distribution[`_${starLevel}`] || 0;
    return Math.round((count / totalReviews) * 100);
  };

  // ✅ Handler con validación de autenticación
  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para escribir una reseña');
      return;
    }

    if (onSubmitReview && newReview.title && newReview.comment) {
      onSubmitReview(newReview);
      // Reset
      setNewReview({ rating: 5, title: '', comment: '' });
      setActiveTab('reviews');
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Opiniones de Clientes</h3>
      </div>

      {/* ✅ Rating Summary con validaciones */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="flex flex-col items-center justify-center text-center">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {averageRating > 0 ? averageRating.toFixed(1) : '0.0'}
            </div>
            <div className="flex items-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-6 w-6 ${
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-600">
              {totalReviews === 0 
                ? 'Sin opiniones aún' 
                : `Basado en ${totalReviews} ${totalReviews === 1 ? 'opinión' : 'opiniones'}`
              }
            </p>
          </div>

          {/* ✅ Rating Distribution con validaciones */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const percentage = getRatingPercentage(stars);
              const count = distribution[`_${stars}`] || 0;
              
              return (
                <div key={stars} className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 w-16">
                    {stars} {stars === 1 ? 'estrella' : 'estrellas'}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-yellow-400 h-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8 px-6">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Todas las opiniones ({totalReviews})
          </button>
          <button
            onClick={() => setActiveTab('write')}
            className={`py-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'write'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Escribir opinión
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'reviews' ? (
          <div className="space-y-6">
            {/* ✅ Nota sobre módulo reviews futuro */}
            {reviews && reviews.length > 0 ? (
              reviews.map((review, index) => (
                <ReviewCard key={index} review={review} />
              ))
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Aún no hay opiniones
                </h4>
                <p className="text-gray-600 mb-2">
                  Sé el primero en compartir tu experiencia con este producto
                </p>
                {/* ✅ Nota informativa */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 text-left">
                      <strong>Próximamente:</strong> Sistema completo de reseñas integrado con el backend.
                      Por ahora puedes ver el rating promedio del producto.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('write')}
                  className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Escribir la primera opinión
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* ✅ Validación de autenticación */}
            {!isAuthenticated && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-800">
                      Debes iniciar sesión para escribir una reseña
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Las reseñas verificadas ayudan a otros usuarios a tomar mejores decisiones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rating Selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                Tu calificación
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    disabled={!isAuthenticated}
                    className={`transition-transform hover:scale-110 ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Star
                      className={`h-8 w-8 cursor-pointer ${
                        star <= newReview.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 hover:text-yellow-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-4 text-sm text-gray-600">
                  {newReview.rating} de 5 estrellas
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Título de tu opinión
              </label>
              <input
                type="text"
                value={newReview.title}
                onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                placeholder="Resume tu experiencia en pocas palabras"
                disabled={!isAuthenticated}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tu opinión
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Comparte tu experiencia con este producto..."
                rows={6}
                disabled={!isAuthenticated}
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${!isAuthenticated ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setActiveTab('reviews')}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={!isAuthenticated || !newReview.title || !newReview.comment}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Publicar opinión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ReviewCard - Tarjeta individual de reseña
 * ✅ Con validaciones completas
 */
function ReviewCard({ review }) {
  const [helpful, setHelpful] = useState(false);

  // ✅ Validaciones de datos
  const userName = review.userName || review.user?.name || 'Usuario Anónimo';
  const rating = review.rating || 0;
  const title = review.title || '';
  const comment = review.comment || '';
  const date = review.date || review.createdAt;
  const verified = review.verified || false;
  const helpfulCount = review.helpfulCount || 0;

  // ✅ Formatear fecha con validación
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    
    try {
      return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no disponible';
    }
  };

  return (
    <div className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500">{formatDate(date)}</p>
          </div>
        </div>
        {verified && (
          <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Compra verificada</span>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="flex items-center space-x-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Title */}
      {title && (
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      )}

      {/* Comment */}
      {comment && (
        <p className="text-gray-700 leading-relaxed mb-4">{comment}</p>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-6">
        <button
          onClick={() => setHelpful(!helpful)}
          className={`flex items-center space-x-2 text-sm transition-colors ${
            helpful
              ? 'text-blue-600 font-semibold'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${helpful ? 'fill-current' : ''}`} />
          <span>Útil ({helpfulCount + (helpful ? 1 : 0)})</span>
        </button>
      </div>
    </div>
  );
}