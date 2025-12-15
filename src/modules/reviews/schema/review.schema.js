// src/modules/reviews/schemas/review.schema.js

import * as yup from 'yup';

/**
 * @module review.schema
 * @description Schema de validación de reviews para frontend
 * Sincronizado 100% con review.validation.js del backend
 * 
 * SOURCE OF TRUTH para validaciones de reviews en el frontend
 */

/**
 * Schema de imagen de review
 */
const reviewImageSchema = yup.object({
  url: yup
    .string()
    .url('URL de imagen inválida')
    .required('La URL de la imagen es requerida'),
  alt: yup
    .string()
    .max(200, 'El texto alternativo no puede exceder 200 caracteres')
    .default('Review image'),
});

/**
 * SCHEMA PRINCIPAL - Crear Review
 * Sincronizado con review.validation.js -> createReview
 */
export const createReviewSchema = yup.object({
  rating: yup
    .number()
    .integer('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .required('La calificación es requerida'),

  title: yup
    .string()
    .trim()
    .max(100, 'El título no puede tener más de 100 caracteres')
    .optional(),

  comment: yup
    .string()
    .trim()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(1000, 'El comentario no puede tener más de 1000 caracteres')
    .required('El comentario es requerido'),

  images: yup
    .array()
    .of(reviewImageSchema)
    .max(5, 'Máximo 5 imágenes por review')
    .optional()
    .default([]),
});

/**
 * SCHEMA - Actualizar Review
 * Sincronizado con review.validation.js -> updateReview
 */
export const updateReviewSchema = yup.object({
  rating: yup
    .number()
    .integer('La calificación debe ser un número entero')
    .min(1, 'La calificación mínima es 1')
    .max(5, 'La calificación máxima es 5')
    .optional(),

  title: yup
    .string()
    .trim()
    .max(100, 'El título no puede tener más de 100 caracteres')
    .optional(),

  comment: yup
    .string()
    .trim()
    .min(10, 'El comentario debe tener al menos 10 caracteres')
    .max(1000, 'El comentario no puede tener más de 1000 caracteres')
    .optional(),

  images: yup
    .array()
    .of(reviewImageSchema)
    .max(5, 'Máximo 5 imágenes por review')
    .optional(),
}).test(
  'at-least-one',
  'Debes actualizar al menos un campo',
  (value) => Object.keys(value).length > 0
);

/**
 * SCHEMA - Reportar Review
 * Sincronizado con review.validation.js -> reportReview
 */
export const reportReviewSchema = yup.object({
  reason: yup
    .string()
    .trim()
    .min(10, 'La razón debe tener al menos 10 caracteres')
    .max(500, 'La razón no puede tener más de 500 caracteres')
    .required('La razón del reporte es requerida'),
});

/**
 * SCHEMA - Filtros de Reviews
 * Sincronizado con review.validation.js -> getProductReviews
 */
export const reviewFiltersSchema = yup.object({
  page: yup
    .number()
    .integer('La página debe ser un número entero')
    .min(1, 'La página mínima es 1')
    .default(1),

  limit: yup
    .number()
    .integer('El límite debe ser un número entero')
    .min(1, 'El límite mínimo es 1')
    .max(50, 'El límite máximo es 50')
    .default(10),

  rating: yup
    .number()
    .integer('El rating debe ser un número entero')
    .min(1, 'El rating mínimo es 1')
    .max(5, 'El rating máximo es 5')
    .optional(),

  verified: yup
    .string()
    .oneOf(['true', 'false'], 'Verified debe ser "true" o "false"')
    .optional(),

  sortBy: yup
    .string()
    .oneOf(['createdAt', 'rating', 'helpfulCount'], 'Campo de ordenamiento inválido')
    .default('createdAt'),

  sortOrder: yup
    .string()
    .oneOf(['asc', 'desc'], 'Orden inválido')
    .default('desc'),
});

/**
 * SCHEMA - Filtros Admin (Pending)
 * Sincronizado con review.validation.js -> getPending
 */
export const adminFiltersSchema = yup.object({
  page: yup
    .number()
    .integer('La página debe ser un número entero')
    .min(1, 'La página mínima es 1')
    .default(1),

  limit: yup
    .number()
    .integer('El límite debe ser un número entero')
    .min(1, 'El límite mínimo es 1')
    .max(100, 'El límite máximo es 100')
    .default(20),
});

/**
 * Validación de imagen de review
 */
export const validateReviewImage = async (file) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Use JPEG, PNG o WebP');
  }

  if (file.size > MAX_SIZE) {
    throw new Error('El archivo no puede exceder 5MB');
  }

  return true;
};

/**
 * Función helper para validar review completa
 */
export const validateReview = async (reviewData, isUpdate = false) => {
  try {
    const schema = isUpdate ? updateReviewSchema : createReviewSchema;
    await schema.validate(reviewData, { abortEarly: false });
    return { valid: true, errors: null };
  } catch (error) {
    return {
      valid: false,
      errors: error.inner.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    };
  }
};

/**
 * Validar filtros
 */
export const validateFilters = async (filters) => {
  try {
    await reviewFiltersSchema.validate(filters, { abortEarly: false });
    return { valid: true, errors: null };
  } catch (error) {
    return {
      valid: false,
      errors: error.inner.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    };
  }
};

/**
 * Validar razón de reporte
 */
export const validateReportReason = async (reason) => {
  try {
    await reportReviewSchema.validate({ reason }, { abortEarly: false });
    return { valid: true, errors: null };
  } catch (error) {
    return {
      valid: false,
      errors: error.inner.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    };
  }
};

export default createReviewSchema;