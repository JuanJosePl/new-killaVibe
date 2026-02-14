// src/modules/customer/components/products/detail/ReviewsSection.jsx

"use client";
import { useState, useEffect } from "react";
import { Star, PenLine, TrendingUp, Award, Filter, RefreshCw } from "lucide-react";
import ReviewCard from "../../reviews/ReviewCard";
import ReviewFormModal from "./ReviewFormModal";

/**
 * @component ReviewsSection
 * @description Sección completa de reviews CON INTEGRACIÓN AL BACKEND
 * 
 * ✅ Props actualizadas con handlers del backend
 * ✅ Sistema de filtros y ordenamiento
 * ✅ Actualización en tiempo real
 * ✅ Manejo de estados de carga
 * 
 * @param {string} productId - ID del producto
 * @param {Array} reviews - Reviews iniciales
 * @param {Object} stats - Estadísticas de reviews
 * @param {boolean} isLoading - Estado de carga
 * @param {Function} onReviewCreated - Callback cuando se crea review
 * @param {Function} onMarkHelpful - Handler para marcar útil
 * @param {Function} onReportReview - Handler para reportar
 * @param {Function} onReloadReviews - Handler para recargar reviews
 */
const ReviewsSection = ({ 
  productId, 
  reviews: initialReviews, 
  stats: initialStats, 
  isLoading = false,
  onReviewCreated,
  onMarkHelpful,
  onReportReview,
  onReloadReviews
}) => {
  // ============================================
  // ESTADO LOCAL
  // ============================================
  const [reviews, setReviews] = useState(initialReviews || []);
  const [stats, setStats] = useState(initialStats || { average: 0, total: 0, distribution: {} });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [filterRating, setFilterRating] = useState(null);
  const [sortBy, setSortBy] = useState("recent");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ============================================
  // SINCRONIZAR CON PROPS
  // ============================================
  useEffect(() => {
    setReviews(initialReviews || []);
  }, [initialReviews]);

  useEffect(() => {
    setStats(initialStats || { average: 0, total: 0, distribution: {} });
  }, [initialStats]);

  // ============================================
  // HANDLERS
  // ============================================

  /**
   * Handler cuando se crea una review exitosamente
   */
  const handleReviewSuccess = (newReview) => {
    console.log('✅ Nueva review recibida:', newReview);
    
    // 1. Agregar al estado local INMEDIATAMENTE
    setReviews(prev => [newReview, ...prev]);
    
    // 2. Actualizar stats manualmente (optimistic update)
    setStats(prev => ({
      ...prev,
      total: (prev.total || 0) + 1,
      average: prev.total 
        ? ((prev.average * prev.total + newReview.rating) / (prev.total + 1)).toFixed(1)
        : newReview.rating.toFixed(1)
    }));
    
    // 3. Cerrar modal
    setShowReviewForm(false);
    
    // 4. Callback al padre
    if (onReviewCreated) {
      onReviewCreated(newReview);
    }
  };

  /**
   * Handler para recargar reviews manualmente
   */
  const handleRefresh = async () => {
    if (!onReloadReviews) return;
    
    setIsRefreshing(true);
    try {
      await onReloadReviews();
    } finally {
      setIsRefreshing(false);
    }
  };

  // ============================================
  // FILTRADO Y ORDENAMIENTO
  // ============================================

  const filteredReviews = reviews.filter((review) => 
    !filterRating || review.rating === filterRating
  );

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "helpful") return (b.helpfulCount || 0) - (a.helpfulCount || 0);
    if (sortBy === "rating-high") return b.rating - a.rating;
    if (sortBy === "rating-low") return a.rating - b.rating;
    return 0;
  });

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <Star className="w-8 h-8 text-yellow-400 fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900">Reseñas de Clientes</h2>
              <p className="text-gray-600 font-medium">
                {stats.total || 0} {stats.total === 1 ? 'reseña' : 'reseñas'} verificadas
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botón Refresh */}
            {onReloadReviews && (
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-3 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50"
                title="Recargar reseñas"
              >
                <RefreshCw className={`w-5 h-5 text-gray-700 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            )}

            {/* Botón Escribir Reseña */}
            <button 
              onClick={() => setShowReviewForm(true)} 
              className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
            >
              <PenLine className="w-5 h-5" />
              Escribir Reseña
            </button>
          </div>
        </div>
      </div>

      {/* STATS */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-semibold">Promedio</span>
              <Award className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-gray-900">{stats.average || 0}</span>
              <span className="text-gray-500 mb-1">/ 5</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(stats.average) 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-semibold">Total Reseñas</span>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-4xl font-black text-gray-900">{stats.total || 0}</span>
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-gray-200 shadow-md hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 font-semibold">Recomendación</span>
              <Star className="w-5 h-5 text-green-500" />
            </div>
            <span className="text-4xl font-black text-green-600">
              {stats.average >= 4 ? '95%' : stats.average >= 3 ? '75%' : '50%'}
            </span>
          </div>
        </div>
      )}

      {/* FILTROS */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-bold text-gray-900">Filtrar y Ordenar</span>
        </div>
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          {/* Filtro por Rating */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterRating(null)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                filterRating === null 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Todas
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setFilterRating(rating)}
                className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1 ${
                  filterRating === rating 
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {rating} <Star className="w-4 h-4 fill-current" />
              </button>
            ))}
          </div>

          {/* Ordenar */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)} 
            className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
          >
            <option value="recent">Más recientes</option>
            <option value="helpful">Más útiles</option>
            <option value="rating-high">Mayor calificación</option>
            <option value="rating-low">Menor calificación</option>
          </select>
        </div>
      </div>

      {/* LISTA DE REVIEWS */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-yellow-400 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Cargando reseñas...</p>
          </div>
        ) : sortedReviews.length > 0 ? (
          sortedReviews.map((review) => (
            <ReviewCard 
              key={review._id} 
              review={review} 
              productId={productId}
              onHelpful={onMarkHelpful}
              onReport={onReportReview}
              showActions={false}
              isOwner={false}
            />
          ))
        ) : (
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300 p-16 text-center">
            <div className="animate-bounce mb-6">
              <Star className="w-24 h-24 text-gray-300 mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filterRating ? "No hay reseñas con esta calificación" : "No hay reseñas aún"}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {filterRating ? "Prueba con otro filtro" : "¡Sé el primero en compartir tu opinión!"}
            </p>
            {!filterRating && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center gap-2"
              >
                <PenLine className="w-5 h-5" />
                Escribir Primera Reseña
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODAL FORMULARIO */}
      {showReviewForm && (
        <ReviewFormModal
          productId={productId}
          onClose={() => setShowReviewForm(false)}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
};

export default ReviewsSection;