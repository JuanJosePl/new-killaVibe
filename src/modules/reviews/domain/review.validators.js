/**
 * @module ReviewValidators
 * @description Validaciones de dominio para Review.
 *
 * Fuente única de verdad. Sincronizado con review.validation.js del backend.
 * Sin dependencias de Yup, React ni otros frameworks — 100% JavaScript puro.
 * Reemplaza: review.schema.js (Yup) + validaciones inline en Context y hooks.
 *
 * Retornan siempre: { valid: boolean, error?: string }
 */

import { RATING, TEXT_LIMITS, IMAGE_LIMITS } from './review.model.js';

/* ─── Primitivas ─────────────────────────────────────────────────── */

const ok  = ()    => ({ valid: true });
const err = (msg) => ({ valid: false, error: msg });

/* ─── Validadores de campo ───────────────────────────────────────── */

export const validateRating = (rating) => {
  if (rating === null || rating === undefined || rating === 0) {
    return err('La calificación es requerida.');
  }
  const n = Number(rating);
  if (!Number.isInteger(n))          return err('La calificación debe ser un número entero.');
  if (n < RATING.MIN)                return err(`La calificación mínima es ${RATING.MIN}.`);
  if (n > RATING.MAX)                return err(`La calificación máxima es ${RATING.MAX}.`);
  return ok();
};

export const validateComment = (comment) => {
  if (!comment || typeof comment !== 'string') return err('El comentario es requerido.');
  const trimmed = comment.trim();
  if (trimmed.length === 0)                    return err('El comentario es requerido.');
  if (trimmed.length < TEXT_LIMITS.COMMENT_MIN) {
    return err(`El comentario debe tener al menos ${TEXT_LIMITS.COMMENT_MIN} caracteres.`);
  }
  if (trimmed.length > TEXT_LIMITS.COMMENT_MAX) {
    return err(`El comentario no puede tener más de ${TEXT_LIMITS.COMMENT_MAX} caracteres.`);
  }
  return ok();
};

export const validateTitle = (title) => {
  if (!title) return ok(); // opcional
  if (title.trim().length > TEXT_LIMITS.TITLE_MAX) {
    return err(`El título no puede tener más de ${TEXT_LIMITS.TITLE_MAX} caracteres.`);
  }
  return ok();
};

export const validateImages = (images) => {
  if (!images || images.length === 0) return ok(); // opcional
  if (images.length > IMAGE_LIMITS.MAX_IMAGES) {
    return err(`Máximo ${IMAGE_LIMITS.MAX_IMAGES} imágenes por review.`);
  }
  for (const img of images) {
    if (!img.url) return err('Cada imagen debe tener una URL.');
    try { new URL(img.url); }
    catch { return err(`URL de imagen inválida: ${img.url}`); }
  }
  return ok();
};

export const validateReportReason = (reason) => {
  if (!reason || typeof reason !== 'string') return err('La razón del reporte es requerida.');
  const trimmed = reason.trim();
  if (trimmed.length < TEXT_LIMITS.REPORT_REASON_MIN) {
    return err(`La razón debe tener al menos ${TEXT_LIMITS.REPORT_REASON_MIN} caracteres.`);
  }
  if (trimmed.length > TEXT_LIMITS.REPORT_REASON_MAX) {
    return err(`La razón no puede superar ${TEXT_LIMITS.REPORT_REASON_MAX} caracteres.`);
  }
  return ok();
};

export const validateProductId = (productId) => {
  if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
    return err('productId es requerido.');
  }
  return ok();
};

/* ─── Validadores de objeto completo ─────────────────────────────── */

/**
 * Valida datos para CREAR una review.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateCreatePayload = (data = {}) => {
  const errors = {};

  const r = validateRating(data.rating);
  if (!r.valid)  errors.rating = r.error;

  const c = validateComment(data.comment);
  if (!c.valid)  errors.comment = c.error;

  const t = validateTitle(data.title);
  if (!t.valid)  errors.title = t.error;

  const i = validateImages(data.images);
  if (!i.valid)  errors.images = i.error;

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Valida datos para ACTUALIZAR una review.
 * Al menos un campo debe estar presente.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateUpdatePayload = (data = {}) => {
  const errors = {};

  if (Object.keys(data).length === 0) {
    return { valid: false, errors: { _root: 'Debes actualizar al menos un campo.' } };
  }

  if (data.rating !== undefined) {
    const r = validateRating(data.rating);
    if (!r.valid) errors.rating = r.error;
  }

  if (data.comment !== undefined) {
    const c = validateComment(data.comment);
    if (!c.valid) errors.comment = c.error;
  }

  if (data.title !== undefined) {
    const t = validateTitle(data.title);
    if (!t.valid) errors.title = t.error;
  }

  if (data.images !== undefined) {
    const i = validateImages(data.images);
    if (!i.valid) errors.images = i.error;
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Valida filtros de consulta de reviews.
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export const validateFilters = (filters = {}) => {
  const errors = {};
  const VALID_SORT_BY    = ['createdAt', 'rating', 'helpfulCount'];
  const VALID_SORT_ORDER = ['asc', 'desc'];

  if (filters.page !== undefined) {
    const p = Number(filters.page);
    if (!Number.isInteger(p) || p < 1) errors.page = 'La página debe ser un entero positivo.';
  }

  if (filters.limit !== undefined) {
    const l = Number(filters.limit);
    if (!Number.isInteger(l) || l < 1 || l > 50) {
      errors.limit = 'El límite debe ser un entero entre 1 y 50.';
    }
  }

  if (filters.rating !== undefined && filters.rating !== null && filters.rating !== '') {
    const rn = Number(filters.rating);
    if (!Number.isInteger(rn) || rn < 1 || rn > 5) {
      errors.rating = 'El rating debe ser un entero entre 1 y 5.';
    }
  }

  if (filters.sortBy && !VALID_SORT_BY.includes(filters.sortBy)) {
    errors.sortBy = `sortBy debe ser uno de: ${VALID_SORT_BY.join(', ')}.`;
  }

  if (filters.sortOrder && !VALID_SORT_ORDER.includes(filters.sortOrder)) {
    errors.sortOrder = `sortOrder debe ser 'asc' o 'desc'.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * Validación de imagen de archivo (para upload, no URL).
 */
export const validateImageFile = (file) => {
  if (!file) return err('Archivo requerido.');
  if (!IMAGE_LIMITS.ALLOWED_TYPES.includes(file.type)) {
    return err('Tipo de archivo no permitido. Use JPEG, PNG o WebP.');
  }
  if (file.size > IMAGE_LIMITS.MAX_FILE_SIZE) {
    return err('El archivo no puede exceder 5MB.');
  }
  return ok();
};