// src/modules/customer/pages/CustomerReviewsPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerActivity } from '../context/CustomerActivityContext';
import customerReviewsApi from '../api/customerReviews.api';
import customerOrdersApi from '../api/customerOrders.api';
import {
  ReviewCard,
  ReviewModal,
  ReviewStats,
  PendingReviewsAlert,
} from '../components/reviews';

/**
 * @page CustomerReviewsPage
 * @description Página de gestión de reseñas del usuario
 * 
 * Features:
 * - Lista de todas las reseñas del usuario
 * - Crear nueva reseña
 * - Editar reseña existente
 * - Eliminar reseña
 * - Estadísticas de reseñas
 * - Productos pendientes de reseñar
 */
const CustomerReviewsPage = () => {
  const navigate = useNavigate();
  const { trackPageView } = useCustomerActivity();

  // State
  const [reviews, setReviews] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [stats, setStats] = useState({ totalReviews: 0, verifiedCount: 0, averageRating: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);

  useEffect(() => {
    trackPageView('Reviews');
    loadReviewsData();
  }, [trackPageView]);

  /**
   * Cargar datos de reseñas
   */
  const loadReviewsData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar órdenes entregadas para obtener productos pendientes
      const ordersData = await customerOrdersApi.getUserOrders({
        status: 'delivered',
        limit: 100,
      }).catch(() => ({ orders: [] }));

      // Extraer productos únicos de órdenes entregadas
      const deliveredProducts = [];
      ordersData.orders?.forEach(order => {
        order.items?.forEach(item => {
          const productId = item.product?._id || item.product;
          if (!deliveredProducts.find(p => p.productId === productId)) {
            deliveredProducts.push({
              productId,
              productName: item.product?.name || 'Producto',
              productSlug: item.product?.slug,
            });
          }
        });
      });

      // TODO: Obtener reseñas del usuario desde el backend
      // Por ahora simulamos datos vacíos
      setReviews([]);
      setPendingProducts(deliveredProducts);
      
      // Calcular estadísticas
      const totalReviews = reviews.length;
      const verifiedCount = reviews.filter(r => r.isVerified).length;
      const averageRating = totalReviews > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
        : 0;

      setStats({ totalReviews, verifiedCount, averageRating });
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError(err.message || 'Error al cargar reseñas');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Crear nueva reseña
   */
  const handleCreateReview = async (reviewData) => {
    try {
      await customerReviewsApi.createReview(reviewData.productId, {
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
      });

      // Recargar reseñas
      await loadReviewsData();
      
      alert('✓ Reseña publicada exitosamente');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Editar reseña existente
   */
  const handleEditReview = async (reviewData) => {
    try {
      await customerReviewsApi.updateReview(editingReview._id, {
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
      });

      // Recargar reseñas
      await loadReviewsData();
      
      alert('✓ Reseña actualizada exitosamente');
    } catch (error) {
      throw error;
    }
  };

  /**
   * Eliminar reseña
   */
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) {
      return;
    }

    try {
      await customerReviewsApi.deleteReview(reviewId);
      
      // Recargar reseñas
      await loadReviewsData();
      
      alert('✓ Reseña eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(error.message || 'Error al eliminar reseña');
    }
  };

  /**
   * Abrir modal para nueva reseña
   */
  const handleOpenNewReview = () => {
    setEditingReview(null);
    setShowModal(true);
  };

  /**
   * Abrir modal para editar reseña
   */
  const handleOpenEditReview = (review) => {
    setEditingReview(review);
    setShowModal(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                ⭐ Mis Reseñas
              </h1>
              <p className="text-gray-600 text-lg">
                Comparte tu experiencia con otros compradores
              </p>
            </div>

            <button
              onClick={handleOpenNewReview}
              disabled={pendingProducts.length === 0}
              className="bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              ✍️ Escribir Reseña
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Reviews Alert */}
            {pendingProducts.length > 0 && (
              <PendingReviewsAlert
                count={pendingProducts.length}
                onWriteReview={handleOpenNewReview}
              />
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
              <EmptyReviews onWriteReview={handleOpenNewReview} />
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review._id}
                    review={review}
                    onEdit={() => handleOpenEditReview(review)}
                    onDelete={() => handleDeleteReview(review._id)}
                    showActions={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column - 1/3 */}
          <div className="space-y-6">
            {/* Stats */}
            <ReviewStats
              totalReviews={stats.totalReviews}
              verifiedCount={stats.verifiedCount}
              averageRating={stats.averageRating}
            />

            {/* Guidelines */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                📝 Guía de Reseñas
              </h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Se específico sobre tu experiencia con el producto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Menciona pros y contras de manera objetiva</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Agrega fotos para ayudar a otros compradores</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>Evita lenguaje ofensivo o inapropiado</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span>No incluyas información personal o de contacto</span>
                </li>
              </ul>
            </div>

            {/* Rewards Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl shadow-md p-6 border border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                🎁 Programa de Recompensas
              </h3>
              <p className="text-sm text-gray-700 mb-4">
                ¡Gana puntos por cada reseña verificada que publiques!
              </p>
              <div className="bg-white rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Tu Progreso</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((stats.verifiedCount / 10) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {stats.verifiedCount}/10
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Review Modal */}
        {showModal && (
          <ReviewModal
            review={editingReview}
            products={pendingProducts}
            onClose={() => {
              setShowModal(false);
              setEditingReview(null);
            }}
            onSubmit={editingReview ? handleEditReview : handleCreateReview}
          />
        )}
      </div>
    </div>
  );
};

/**
 * ============================================
 * COMPONENTES AUXILIARES
 * ============================================
 */

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-yellow-200 border-t-orange-600 mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl animate-pulse">⭐</span>
        </div>
      </div>
      <p className="text-gray-700 font-medium text-lg">Cargando reseñas...</p>
    </div>
  </div>
);

const EmptyReviews = ({ onWriteReview }) => (
  <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
    <div className="text-8xl mb-6 animate-bounce">⭐</div>
    <h2 className="text-3xl font-bold text-gray-900 mb-3">
      Aún no has escrito reseñas
    </h2>
    <p className="text-gray-600 text-lg mb-8">
      Comparte tu experiencia y ayuda a otros compradores
    </p>
    <button
      onClick={onWriteReview}
      className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
    >
      ✍️ Escribir Mi Primera Reseña
    </button>

    <div className="mt-12 pt-8 border-t border-gray-200">
      <p className="text-sm text-gray-500 mb-6 font-medium">
        Beneficios de escribir reseñas:
      </p>
      <div className="grid grid-cols-3 gap-6">
        <BenefitCard
          icon="🎁"
          title="Gana Puntos"
          description="Recompensas por reseñas"
        />
        <BenefitCard
          icon="👥"
          title="Ayuda a Otros"
          description="Comparte tu experiencia"
        />
        <BenefitCard
          icon="⭐"
          title="Sé Visible"
          description="Destaca en la comunidad"
        />
      </div>
    </div>
  </div>
);

const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
    <div className="text-3xl mb-2">{icon}</div>
    <h3 className="font-semibold text-gray-900 text-sm mb-1">{title}</h3>
    <p className="text-xs text-gray-600">{description}</p>
  </div>
);

export default CustomerReviewsPage;