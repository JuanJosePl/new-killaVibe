/**
 * @component ProductReviewsSection
 * @description Sección completa de reviews para integrar en ProductDetail.
 *
 * Orquesta: estadísticas + filtros + lista + formulario.
 * No importa Context. Usa hooks del módulo reviews directamente.
 */

import React, { useState, useCallback } from 'react';
import { useAuth } from '../../../../core/hooks/useAuth';
import useReviews       from '../hooks/useReviews.js';
import useReviewStats   from '../hooks/useReviewStats.js';
import useReviewActions from '../hooks/useReviewActions.js';
import ReviewStats   from './ReviewStats.jsx';
import ReviewFilters from './ReviewFilters.jsx';
import ReviewList    from './ReviewList.jsx';
import ReviewForm    from './ReviewForm.jsx';

/**
 * @param {{ productId: string }} props
 */
const ProductReviewsSection = ({ productId }) => {
  const { isAuthenticated } = useAuth();

  const [showForm,      setShowForm]      = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  /* ── Hooks de datos ─────────────────────────────────────────────── */

  const {
    reviews,
    pagination,
    filters,
    loading  : reviewsLoading,
    error    : reviewsError,
    updateFilters,
    resetFilters,
    changePage,
    refetch  : refetchReviews,
  } = useReviews(productId);

  const { stats, loading: statsLoading, refetch: refetchStats } = useReviewStats(productId);

  const { user } = useAuth();

  const { create, update, remove, helpful, report, createLoading, updateLoading, deleteLoading } =
    useReviewActions(productId, {
      onSuccess: (_msg) => {
        refetchReviews();
        refetchStats();
        setShowForm(false);
        setEditingReview(null);
      },
    });

  /* ── Handlers ───────────────────────────────────────────────────── */

  const handleEdit = useCallback((review) => {
    setEditingReview(review);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingReview(null);
  }, []);

  const handleSubmit = useCallback(async (formData) => {
    if (editingReview) {
      await update(editingReview._id, formData);
    } else {
      await create(formData);
    }
  }, [editingReview, create, update]);

  const handleDelete = useCallback(async (reviewId) => {
    await remove(reviewId);
  }, [remove]);

  const handleHelpful = useCallback(async (reviewId) => {
    await helpful(reviewId);
  }, [helpful]);

  const handleReport = useCallback(async (reviewId, reason) => {
    await report(reviewId, reason);
  }, [report]);

  const actionBusy = createLoading || updateLoading || deleteLoading;

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Opiniones de clientes</h2>

        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Escribir opinión
          </button>
        )}
      </div>

      {/* Estadísticas */}
      <ReviewStats stats={stats} loading={statsLoading} />

      {/* Formulario */}
      {showForm && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingReview ? 'Editar tu opinión' : 'Escribe tu opinión'}
          </h3>
          <ReviewForm
            initialData={editingReview}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={actionBusy}
          />
        </div>
      )}

      <div className="border-t border-gray-100" />

      {/* Filtros */}
      <ReviewFilters
        currentFilters={filters}
        stats={stats}
        onFilterChange={updateFilters}
        onReset={resetFilters}
      />

      {/* Lista */}
      <ReviewList
        reviews={reviews}
        pagination={pagination}
        loading={reviewsLoading}
        error={reviewsError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onMarkHelpful={handleHelpful}
        onReport={handleReport}
        onPageChange={changePage}
        showActions={true}
      />
    </section>
  );
};

export default ProductReviewsSection;