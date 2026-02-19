/**
 * @module ReviewRules
 * @description Reglas de negocio del dominio Review.
 *
 * Invariantes y políticas sin estado, sin efectos secundarios, 100% puras.
 * No conocen React, Zustand, API ni ningún framework.
 */

import { RATING, MODERATION_STATUS, MODERATOR_ROLES, REPORT_THRESHOLDS } from './review.model.js';

/* ─── Reglas de Rating ───────────────────────────────────────────── */

/**
 * El rating debe ser un entero entre 1 y 5.
 */
export const isValidRating = (rating) => {
  if (rating === null || rating === undefined) return false;
  const n = Number(rating);
  return Number.isInteger(n) && n >= RATING.MIN && n <= RATING.MAX;
};

/* ─── Reglas de Propiedad ────────────────────────────────────────── */

/**
 * Un usuario es propietario de una review si su ID coincide con review.user._id.
 */
export const isOwner = (review, userId) => {
  if (!review || !userId) return false;
  const reviewUserId = review.userId ?? review.user?._id ?? review.user;
  return String(reviewUserId) === String(userId);
};

/**
 * Un usuario puede editar su review si es el propietario.
 */
export const canEdit = (review, userId) => isOwner(review, userId);

/**
 * Un usuario puede eliminar su review si es propietario o moderador.
 */
export const canDelete = (review, userId, userRole) => {
  if (!review || !userId) return false;
  return isOwner(review, userId) || MODERATOR_ROLES.includes(userRole);
};

/**
 * Un usuario puede moderar si tiene rol de admin o moderador.
 */
export const canModerate = (userRole) => MODERATOR_ROLES.includes(userRole);

/* ─── Reglas de Interacción ──────────────────────────────────────── */

/**
 * Un usuario no puede marcar su propia review como útil.
 */
export const canVoteHelpful = (review, userId) => {
  if (!review || !userId) return false;
  return !isOwner(review, userId);
};

/**
 * Un usuario no puede reportar su propia review.
 */
export const canReport = (review, userId) => {
  if (!review || !userId) return false;
  return !isOwner(review, userId);
};

/* ─── Reglas de Unicidad ─────────────────────────────────────────── */

/**
 * Verifica si un usuario ya tiene una review para un producto dado
 * en una lista de reviews existentes.
 * NOTA: La regla de unicidad real la aplica el backend (unique index).
 * Esta función sirve para feedback inmediato en UI.
 */
export const hasExistingReview = (reviews, userId, productId) => {
  if (!userId || !productId || !Array.isArray(reviews)) return false;
  return reviews.some((r) => {
    const rUserId    = String(r.userId ?? r.user?._id ?? r.user ?? '');
    const rProductId = String(r.productId ?? r.product?._id ?? r.product ?? '');
    return rUserId === String(userId) && rProductId === String(productId);
  });
};

/* ─── Reglas de Moderación ───────────────────────────────────────── */

/**
 * Una review debe ser auto-moderada si alcanza el umbral de reportes.
 */
export const shouldAutoModerate = (review) => {
  return (review?.reportCount ?? 0) >= REPORT_THRESHOLDS.AUTO_MODERATE;
};

/**
 * Una review requiere revisión manual si supera el umbral inferior.
 */
export const requiresManualReview = (review) => {
  const count = review?.reportCount ?? 0;
  return count >= REPORT_THRESHOLDS.REVIEW_REQUIRED && count < REPORT_THRESHOLDS.AUTO_MODERATE;
};

/**
 * El estado de moderación es válido.
 */
export const isValidModerationStatus = (status) => {
  return Object.values(MODERATION_STATUS).includes(status);
};

/* ─── Reglas de Estadísticas ─────────────────────────────────────── */

/**
 * Calcula el promedio de rating de un array de entidades.
 * Sin dependencia de ReviewStats (puede usarse antes de construirlo).
 *
 * @param {Array} reviews - ReviewEntity[]
 * @returns {number} Promedio con 1 decimal, o 0 si no hay reviews
 */
export const calculateAverage = (reviews) => {
  if (!Array.isArray(reviews) || reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
  return Math.round((sum / reviews.length) * 10) / 10;
};

/**
 * Calcula la distribución de ratings de un array de entidades.
 *
 * @param {Array} reviews - ReviewEntity[]
 * @returns {{ 5: n, 4: n, 3: n, 2: n, 1: n }}
 */
export const calculateDistribution = (reviews) => {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (!Array.isArray(reviews)) return dist;
  reviews.forEach((r) => {
    const rating = Number(r.rating);
    if (rating >= 1 && rating <= 5) dist[rating]++;
  });
  return dist;
};