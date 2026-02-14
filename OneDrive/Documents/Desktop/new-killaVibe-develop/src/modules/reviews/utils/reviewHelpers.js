// src/modules/reviews/utils/reviewHelpers.js

import { RATING_COLORS, RATING_ICONS, TEXT_LIMITS } from '../types/review.types';

/**
 * @module reviewHelpers
 * @description Utilidades para manejo de reviews
 */

/**
 * Calcula el porcentaje de cada rating en la distribución
 * @param {Object} distribution - { 5: 80, 4: 30, 3: 5, 2: 3, 1: 2 }
 * @param {number} total - Total de reviews
 * @returns {Object} - { 5: 67%, 4: 25%, ... }
 */
export const calculateRatingPercentages = (distribution, total) => {
  if (!distribution || total === 0) {
    return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  }

  const percentages = {};
  for (let rating = 1; rating <= 5; rating++) {
    const count = distribution[rating] || 0;
    percentages[rating] = Math.round((count / total) * 100);
  }

  return percentages;
};

/**
 * Formatea el promedio de rating
 * @param {number} average - Rating promedio
 * @returns {string} - "4.5"
 */
export const formatAverageRating = (average) => {
  if (!average || average === 0) return '0.0';
  return average.toFixed(1);
};

/**
 * Obtiene el color de rating según el valor
 * @param {number} rating - Valor de rating (1-5)
 * @returns {string} - Clase CSS de color
 */
export const getRatingColor = (rating) => {
  return RATING_COLORS[rating] || RATING_COLORS[5];
};

/**
 * Obtiene los iconos de rating según el valor
 * @param {number} rating - Valor de rating (1-5)
 * @returns {string} - String de estrellas
 */
export const getRatingIcons = (rating) => {
  return RATING_ICONS[rating] || '⭐';
};

/**
 * Genera array de estrellas para renderizar
 * @param {number} rating - Rating (1-5)
 * @param {number} maxRating - Máximo (default 5)
 * @returns {Array} - [{filled: true}, {filled: false}, ...]
 */
export const generateStarsArray = (rating, maxRating = 5) => {
  return Array.from({ length: maxRating }, (_, index) => ({
    value: index + 1,
    filled: index < Math.floor(rating),
    halfFilled: index < rating && index >= Math.floor(rating),
  }));
};

/**
 * Verifica si una review es del usuario actual
 * @param {Object} review - Review object
 * @param {string} userId - ID del usuario actual
 * @returns {boolean}
 */
export const isOwnReview = (review, userId) => {
  if (!review || !userId) return false;
  return review.user?._id === userId || review.user === userId;
};

/**
 * Verifica si una review está verificada
 * @param {Object} review - Review object
 * @returns {boolean}
 */
export const isVerifiedReview = (review) => {
  return review?.isVerified === true;
};

/**
 * Verifica si una review está aprobada
 * @param {Object} review - Review object
 * @returns {boolean}
 */
export const isApprovedReview = (review) => {
  return review?.isApproved === true;
};

/**
 * Verifica si una review tiene imágenes
 * @param {Object} review - Review object
 * @returns {boolean}
 */
export const hasImages = (review) => {
  return review?.images && review.images.length > 0;
};

/**
 * Obtiene el número de imágenes de una review
 * @param {Object} review - Review object
 * @returns {number}
 */
export const getImageCount = (review) => {
  return review?.images?.length || 0;
};

/**
 * Trunca texto a un límite de caracteres
 * @param {string} text - Texto a truncar
 * @param {number} limit - Límite de caracteres
 * @returns {string}
 */
export const truncateText = (text, limit = TEXT_LIMITS.COMMENT_MAX) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return `${text.substring(0, limit)}...`;
};

/**
 * Formatea fecha de review
 * @param {string|Date} date - Fecha
 * @returns {string} - "hace 2 días"
 */
export const formatReviewDate = (date) => {
  if (!date) return '';

  const reviewDate = new Date(date);
  const now = new Date();
  const diffMs = now - reviewDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }

  const years = Math.floor(diffDays / 365);
  return `Hace ${years} ${years === 1 ? 'año' : 'años'}`;
};

/**
 * Formatea fecha completa
 * @param {string|Date} date - Fecha
 * @returns {string} - "15 de marzo de 2025"
 */
export const formatFullDate = (date) => {
  if (!date) return '';

  const reviewDate = new Date(date);
  return reviewDate.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Obtiene el nombre del usuario de una review
 * @param {Object} review - Review object
 * @returns {string}
 */
export const getReviewerName = (review) => {
  if (!review || !review.user) return 'Usuario';

  const user = review.user;

  if (user.profile) {
    const firstName = user.profile.firstName || '';
    const lastName = user.profile.lastName || '';
    return `${firstName} ${lastName}`.trim() || 'Usuario';
  }

  return user.userName || 'Usuario';
};

/**
 * Obtiene las iniciales del usuario
 * @param {Object} review - Review object
 * @returns {string} - "JD"
 */
export const getReviewerInitials = (review) => {
  const name = getReviewerName(review);
  const parts = name.split(' ');

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
};

/**
 * Calcula estadísticas agregadas de reviews
 * @param {Array} reviews - Array de reviews
 * @returns {Object} - { average, total, distribution }
 */
export const calculateReviewStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      average: 0,
      total: 0,
      distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    };
  }

  const total = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sum = 0;

  reviews.forEach((review) => {
    const rating = review.rating || 0;
    sum += rating;
    distribution[rating] = (distribution[rating] || 0) + 1;
  });

  const average = total > 0 ? sum / total : 0;

  return {
    average: Math.round(average * 10) / 10,
    total,
    distribution,
  };
};

/**
 * Ordena reviews según criterio
 * @param {Array} reviews - Array de reviews
 * @param {string} sortBy - 'createdAt', 'rating', 'helpfulCount'
 * @param {string} order - 'asc', 'desc'
 * @returns {Array}
 */
export const sortReviews = (reviews, sortBy = 'createdAt', order = 'desc') => {
  if (!reviews || reviews.length === 0) return [];

  const sorted = [...reviews].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case 'rating':
        aVal = a.rating || 0;
        bVal = b.rating || 0;
        break;
      case 'helpfulCount':
        aVal = a.helpfulCount || 0;
        bVal = b.helpfulCount || 0;
        break;
      case 'createdAt':
      default:
        aVal = new Date(a.createdAt || 0).getTime();
        bVal = new Date(b.createdAt || 0).getTime();
        break;
    }

    return order === 'desc' ? bVal - aVal : aVal - bVal;
  });

  return sorted;
};

/**
 * Filtra reviews por criterios
 * @param {Array} reviews - Array de reviews
 * @param {Object} filters - { rating, verified }
 * @returns {Array}
 */
export const filterReviews = (reviews, filters = {}) => {
  if (!reviews || reviews.length === 0) return [];

  return reviews.filter((review) => {
    // Filtrar por rating
    if (filters.rating && review.rating !== parseInt(filters.rating)) {
      return false;
    }

    // Filtrar por verificados
    if (filters.verified === 'true' && !review.isVerified) {
      return false;
    }

    // Filtrar por con imágenes
    if (filters.withImages && (!review.images || review.images.length === 0)) {
      return false;
    }

    return true;
  });
};

/**
 * Valida que una review tenga los campos mínimos
 * @param {Object} review - Review object
 * @returns {boolean}
 */
export const isValidReview = (review) => {
  return !!(
    review &&
    review._id &&
    review.rating &&
    review.comment &&
    review.product &&
    review.user
  );
};

/**
 * Genera texto de resumen de distribución
 * @param {Object} distribution - { 5: 80, 4: 30, ... }
 * @param {number} total
 * @returns {string} - "80% de los usuarios dieron 5 estrellas"
 */
export const getDistributionSummary = (distribution, total) => {
  if (!distribution || total === 0) return 'Sin reviews aún';

  const percentages = calculateRatingPercentages(distribution, total);
  const topRating = Object.entries(percentages).reduce((max, [rating, percent]) =>
    percent > max.percent ? { rating, percent } : max
  , { rating: 5, percent: 0 });

  return `${topRating.percent}% de los usuarios dieron ${topRating.rating} estrellas`;
};

/**
 * Verifica si el usuario puede editar/eliminar la review
 * @param {Object} review - Review object
 * @param {string} userId - ID del usuario actual
 * @param {Array} userRoles - Roles del usuario
 * @returns {boolean}
 */
export const canModifyReview = (review, userId, userRoles = []) => {
  if (!review || !userId) return false;

  // El dueño puede editar
  if (isOwnReview(review, userId)) return true;

  // Admins y moderadores pueden editar
  if (userRoles.includes('admin') || userRoles.includes('moderator')) return true;

  return false;
};

/**
 * Genera placeholder de avatar basado en nombre
 * @param {string} name - Nombre del usuario
 * @returns {string} - Color CSS class
 */
export const getAvatarColor = (name) => {
  const colors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
  ];

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};