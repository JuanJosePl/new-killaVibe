// src/modules/reviews/components/ProductReviewsSection.jsx

import React, { useState } from 'react';
import { useReviews, useReviewStats, useReviewActions } from '../hooks/useReviews';
import ReviewStats from './ReviewStats';
import ReviewFilters from './ReviewFilters';
import ReviewList from './ReviewList';
import ReviewForm from './ReviewForm';
import { useAuth } from '../../../core/hooks/useAuth';

/**
 * @component ProductReviewsSection
 * @description Sección completa de reviews para integrar en ProductDetail
 * Incluye: estadísticas, filtros, lista y formulario
 */

/**ProductReviewsSection.jsx - Sección completa para integrar en ProductDetail */
const ProductReviewsSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  // Hooks
  const {
    reviews,
    loading: reviewsLoading,
    error: reviewsError,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    changePage,
    refetch: refetchReviews
  } = useReviews(productId);

  const {
    stats,
    loading: statsLoading,
    refetch: refetchStats
  } = useReviewStats(productId);

  const {
    createReview,
    updateReview,
    deleteReview,
    markAsHelpful,
    reportReview,
    loading: actionLoading
  } = useReviewActions(productId, () => {
    refetchReviews();
    refetchStats();
    setShowForm(false);
    setEditingReview(null);
  });

  // Handlers
  const handleCreateReview = async (formData) => {
    const result = await createReview(formData);
    if (result.success) {
      alert('Review creada exitosamente');
    } else {
      alert(result.error || 'Error al crear review');
    }
  };

  const handleUpdateReview = async (formData) => {
    const result = await updateReview(editingReview._id, formData);
    if (result.success) {
      alert('Review actualizada exitosamente');
    } else {
      alert(result.error || 'Error al actualizar review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const result = await deleteReview(reviewId);
    if (result.success) {
      alert('Review eliminada exitosamente');
    } else {
      alert(result.error || 'Error al eliminar review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    const result = await markAsHelpful(reviewId);
    if (result.success) {
      refetchReviews();
    } else {
      alert(result.error || 'Error al marcar como útil');
    }
  };

  const handleReport = async (reviewId, reason) => {
    const result = await reportReview(reviewId, reason);
    if (result.success) {
      alert('Review reportada exitosamente');
    } else {
      alert(result.error || 'Error al reportar review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingReview(null);
  };

  return (
    <div className="space-y-6">
      {/* Título de sección */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Opiniones de clientes
        </h2>
        
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Escribir opinión
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <ReviewStats stats={stats} loading={statsLoading} />

      {/* Formulario (solo si está activo) */}
      {showForm && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            {editingReview ? 'Editar opinión' : 'Escribe tu opinión'}
          </h3>
          <ReviewForm
            productId={productId}
            initialData={editingReview}
            onSubmit={editingReview ? handleUpdateReview : handleCreateReview}
            onCancel={handleCancelForm}
            isLoading={actionLoading}
          />
        </div>
      )}

      {/* Separador */}
      <div className="border-t border-gray-200" />

      {/* Filtros */}
      <ReviewFilters
        currentFilters={filters}
        onFilterChange={updateFilters}
        onReset={resetFilters}
        stats={stats}
      />

      {/* Lista de reviews */}
      <ReviewList
        reviews={reviews}
        pagination={pagination}
        loading={reviewsLoading}
        error={reviewsError}
        onEdit={handleEdit}
        onDelete={handleDeleteReview}
        onMarkHelpful={handleMarkHelpful}
        onReport={handleReport}
        onPageChange={changePage}
        showActions={true}
      />
    </div>
  );
};

export default ProductReviewsSection;