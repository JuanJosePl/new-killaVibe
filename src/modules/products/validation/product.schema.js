/**
 * @module product.schema
 * @description Schema Yup para formularios de administración (crear/editar producto).
 *
 * DIFERENCIA CON domain/product.validators.js:
 * - Este schema valida INPUT DEL USUARIO en formularios (React Hook Form, Formik, etc.)
 * - Los validators del domain validan entidades en runtime (datos ya existentes)
 *
 * Solo importado por componentes de admin. No forma parte del core del dominio.
 */

import * as yup from 'yup';
import { TEXT_LIMITS, VALIDATION_PATTERNS } from '../types/product.types';

// ─────────────────────────────────────────────
// SUB-SCHEMAS
// ─────────────────────────────────────────────

const productImageSchema = yup.object({
  url: yup.string().url('URL de imagen inválida').required('La URL es requerida'),
  altText: yup.string().max(200, 'Máximo 200 caracteres'),
  title: yup.string().max(100, 'Máximo 100 caracteres'),
  isPrimary: yup.boolean().default(false),
  order: yup.number().integer().min(0).default(0),
});

const dimensionsSchema = yup.object({
  length: yup.number().positive('Debe ser positivo'),
  width: yup.number().positive('Debe ser positivo'),
  height: yup.number().positive('Debe ser positivo'),
  unit: yup.string().oneOf(['cm', 'm', 'in', 'ft']).default('cm'),
});

const productWeightSchema = yup.object({
  value: yup.number().positive('Debe ser positivo'),
  unit: yup.string().oneOf(['kg', 'g', 'lb', 'oz']).default('kg'),
});

const productSeoSchema = yup.object({
  title: yup.string().max(TEXT_LIMITS.SEO_TITLE_MAX, `Máximo ${TEXT_LIMITS.SEO_TITLE_MAX} caracteres`),
  description: yup.string().max(TEXT_LIMITS.SEO_DESCRIPTION_MAX, `Máximo ${TEXT_LIMITS.SEO_DESCRIPTION_MAX} caracteres`),
  metaKeywords: yup.array().of(yup.string()),
  canonicalUrl: yup.string().url('URL canónica inválida'),
});

const productVariantSchema = yup.object({
  sku: yup
    .string()
    .uppercase()
    .matches(VALIDATION_PATTERNS.SKU, 'SKU inválido (alfanumérico, guiones, 3-50 chars)')
    .required('SKU de variante requerido'),
  name: yup.string().max(120),
  price: yup.number().min(0).test('is-decimal', 'Máximo 2 decimales', (v) =>
    !v || VALIDATION_PATTERNS.PRICE.test(v.toString())
  ),
  comparePrice: yup
    .number()
    .min(0)
    .test('is-greater', 'Debe ser mayor al precio', function (value) {
      if (!value) return true;
      return value > this.parent.price;
    }),
  stock: yup.number().integer().min(0).default(0),
  isActive: yup.boolean().default(true),
});

const productRatingSchema = yup.object({
  average: yup.number().min(0).max(5).default(0),
  count: yup.number().integer().min(0).default(0),
});

// ─────────────────────────────────────────────
// SCHEMA PRINCIPAL (crear / editar completo)
// ─────────────────────────────────────────────

export const productSchema = yup.object({
  // BÁSICOS
  name: yup
    .string()
    .trim()
    .min(TEXT_LIMITS.NAME_MIN, `Mínimo ${TEXT_LIMITS.NAME_MIN} caracteres`)
    .max(TEXT_LIMITS.NAME_MAX, `Máximo ${TEXT_LIMITS.NAME_MAX} caracteres`)
    .required('El nombre es requerido'),

  slug: yup
    .string()
    .lowercase()
    .matches(VALIDATION_PATTERNS.SLUG, 'Solo minúsculas, números y guiones')
    .required('El slug es requerido'),

  description: yup
    .string()
    .trim()
    .min(TEXT_LIMITS.DESCRIPTION_MIN, `Mínimo ${TEXT_LIMITS.DESCRIPTION_MIN} caracteres`)
    .max(TEXT_LIMITS.DESCRIPTION_MAX, `Máximo ${TEXT_LIMITS.DESCRIPTION_MAX} caracteres`)
    .required('La descripción es requerida'),

  shortDescription: yup
    .string()
    .trim()
    .max(TEXT_LIMITS.SHORT_DESCRIPTION_MAX, `Máximo ${TEXT_LIMITS.SHORT_DESCRIPTION_MAX} caracteres`),

  // PRECIOS
  price: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .test('is-decimal', 'Máximo 2 decimales', (v) =>
      !v || VALIDATION_PATTERNS.PRICE.test(v.toString())
    )
    .required('El precio es requerido'),

  comparePrice: yup
    .number()
    .min(0)
    .test('is-decimal', 'Máximo 2 decimales', (v) =>
      !v || VALIDATION_PATTERNS.PRICE.test(v.toString())
    )
    .test('is-greater', 'Debe ser mayor al precio de venta', function (value) {
      if (!value) return true;
      return value > this.parent.price;
    }),

  costPrice: yup
    .number()
    .min(0)
    .test('is-lower', 'Debería ser menor al precio de venta', function (value) {
      if (!value) return true;
      return value <= this.parent.price;
    }),

  // INVENTARIO
  sku: yup
    .string()
    .uppercase()
    .trim()
    .matches(VALIDATION_PATTERNS.SKU, 'SKU inválido (alfanumérico, guiones, 3-50 chars)')
    .required('El SKU es requerido'),

  stock: yup
    .number()
    .integer('Debe ser número entero')
    .min(0, 'No puede ser negativo')
    .required('El stock es requerido'),

  trackQuantity: yup.boolean().default(true),
  allowBackorder: yup.boolean().default(false),

  lowStockThreshold: yup
    .number()
    .integer()
    .min(0)
    .default(5),

  // CATEGORIZACIÓN
  categories: yup
    .array()
    .of(yup.string().matches(VALIDATION_PATTERNS.MONGO_ID, 'ID de categoría inválido'))
    .min(1, 'Selecciona al menos una categoría')
    .required('Las categorías son requeridas'),

  mainCategory: yup
    .string()
    .matches(VALIDATION_PATTERNS.MONGO_ID, 'ID de categoría inválido')
    .required('La categoría principal es requerida'),

  tags: yup.array().of(yup.string().lowercase().trim()),
  brand: yup.string().trim().max(TEXT_LIMITS.BRAND_MAX, `Máximo ${TEXT_LIMITS.BRAND_MAX} caracteres`),

  // IMÁGENES
  images: yup
    .array()
    .of(productImageSchema)
    .min(1, 'Agrega al menos una imagen')
    .max(10, 'Máximo 10 imágenes')
    .test('has-primary', 'Debe haber una imagen principal', (images) => {
      if (!images || images.length === 0) return false;
      return images.some((img) => img.isPrimary === true);
    })
    .required('Las imágenes son requeridas'),

  // VARIANTES
  variants: yup.array().of(productVariantSchema).max(50, 'Máximo 50 variantes'),

  // SEO
  seo: productSeoSchema,

  // MÉTRICAS (solo lectura)
  views: yup.number().integer().min(0).default(0),
  salesCount: yup.number().integer().min(0).default(0),
  rating: productRatingSchema,

  // ESTADO
  status: yup
    .string()
    .oneOf(['active', 'draft', 'archived', 'discontinued'], 'Estado inválido')
    .default('draft'),

  visibility: yup
    .string()
    .oneOf(['public', 'private', 'hidden'], 'Visibilidad inválida')
    .default('public'),

  isFeatured: yup.boolean().default(false),
  isPublished: yup.boolean().default(false),
  publishedAt: yup.date().nullable(),
  isActive: yup.boolean().default(true),
  requiresShipping: yup.boolean().default(true),
  weight: productWeightSchema.nullable(),
});

// ─────────────────────────────────────────────
// SCHEMAS SIMPLIFICADOS
// ─────────────────────────────────────────────

/** Para formulario de creación rápida */
export const productQuickCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(TEXT_LIMITS.NAME_MIN)
    .max(TEXT_LIMITS.NAME_MAX)
    .required('El nombre es requerido'),
  price: yup.number().min(0).required('El precio es requerido'),
  stock: yup.number().integer().min(0).default(0),
  categories: yup.array().of(yup.string()).min(1).required(),
  description: yup.string().trim().min(TEXT_LIMITS.DESCRIPTION_MIN).required(),
});

/** Para filtros de búsqueda */
export const productFilterSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(12),
  sort: yup.string().oneOf(['createdAt', 'price', 'name', 'salesCount', 'views', 'rating.average']).default('createdAt'),
  order: yup.string().oneOf(['asc', 'desc']).default('desc'),
  category: yup.string(),
  search: yup.string().min(2).max(100),
  minPrice: yup.number().min(0),
  maxPrice: yup.number().min(0),
  status: yup.string().oneOf(['active', 'draft', 'archived', 'discontinued']).default('active'),
  visibility: yup.string().oneOf(['public', 'private', 'hidden']).default('public'),
  featured: yup.boolean(),
  inStock: yup.boolean(),
  brand: yup.string(),
});

/** Schema parcial para actualizaciones */
export const productUpdateSchema = productSchema.partial();

// ─────────────────────────────────────────────
// HELPER DE VALIDACIÓN
// ─────────────────────────────────────────────

/**
 * Valida datos de producto y retorna errores estructurados.
 * @param {Object} productData
 * @returns {Promise<{ valid: boolean, errors: null|Array }>}
 */
export const validateProduct = async (productData) => {
  try {
    await productSchema.validate(productData, { abortEarly: false });
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
 * Valida una imagen de producto (archivo File).
 * @param {File} file
 * @returns {Promise<boolean>}
 */
export const validateProductImage = async (file) => {
  const { IMAGE_CONFIG } = await import('../types/product.types');

  if (!IMAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Tipo de archivo no permitido. Use JPEG, PNG o WebP');
  }

  if (file.size > IMAGE_CONFIG.MAX_FILE_SIZE) {
    throw new Error('El archivo no puede exceder 5MB');
  }

  return true;
};

export default productSchema;