/**
 * @module product.schema
 * @description Schema de validación de productos para frontend
 * Sincronizado 100% con product.model.js del backend
 * 
 * SOURCE OF TRUTH para validaciones de productos en el frontend
 */

import * as yup from 'yup';

/**
 * Schema de imagen de producto
 */
const productImageSchema = yup.object({
  url: yup
    .string()
    .url('URL de imagen inválida')
    .required('La URL de la imagen es requerida'),
  altText: yup.string().max(200, 'El texto alternativo no puede exceder 200 caracteres'),
  title: yup.string().max(100, 'El título no puede exceder 100 caracteres'),
  isPrimary: yup.boolean().default(false),
  order: yup.number().integer().min(0).default(0),
});

/**
 * Schema de dimensiones
 */
const dimensionsSchema = yup.object({
  length: yup.number().positive('La longitud debe ser positiva'),
  width: yup.number().positive('El ancho debe ser positivo'),
  height: yup.number().positive('La altura debe ser positiva'),
  unit: yup
    .string()
    .oneOf(['cm', 'm', 'in', 'ft'], 'Unidad de medida inválida')
    .default('cm'),
});

/**
 * Schema de atributos de producto
 */
const productAttributesSchema = yup.object({
  size: yup.array().of(yup.string()),
  color: yup.array().of(yup.string()),
  material: yup.array().of(yup.string()),
  weight: yup.string(),
  dimensions: dimensionsSchema.nullable(),
});

/**
 * Schema de variante de producto
 */
const productVariantSchema = yup.object({
  sku: yup
    .string()
    .uppercase()
    .matches(/^[A-Z0-9-_]{3,50}$/, 'SKU debe ser alfanumérico, guiones y guiones bajos (3-50 caracteres)')
    .required('El SKU de la variante es requerido'),
  name: yup.string().max(120, 'El nombre no puede exceder 120 caracteres'),
  price: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .test('is-decimal', 'El precio debe tener máximo 2 decimales', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    }),
  comparePrice: yup
    .number()
    .min(0, 'El precio de comparación no puede ser negativo')
    .test('is-decimal', 'El precio debe tener máximo 2 decimales', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .test('is-greater', 'El precio de comparación debe ser mayor al precio', function (value) {
      if (!value) return true;
      return value > this.parent.price;
    }),
  stock: yup.number().integer().min(0, 'El stock no puede ser negativo').default(0),
  attributes: yup.object({
    size: yup.string(),
    color: yup.string(),
    material: yup.string(),
  }),
  images: yup.array().of(yup.string().url('URL de imagen inválida')),
  isActive: yup.boolean().default(true),
});

/**
 * Schema de SEO
 */
const productSeoSchema = yup.object({
  title: yup.string().max(60, 'El título SEO no puede exceder 60 caracteres'),
  description: yup.string().max(160, 'La descripción SEO no puede exceder 160 caracteres'),
  metaKeywords: yup.array().of(yup.string()),
  canonicalUrl: yup.string().url('URL canónica inválida'),
});

/**
 * Schema de rating (solo lectura en frontend)
 */
const productRatingSchema = yup.object({
  average: yup.number().min(0).max(5).default(0),
  count: yup.number().integer().min(0).default(0),
  distribution: yup.object({
    _1: yup.number().integer().min(0).default(0),
    _2: yup.number().integer().min(0).default(0),
    _3: yup.number().integer().min(0).default(0),
    _4: yup.number().integer().min(0).default(0),
    _5: yup.number().integer().min(0).default(0),
  }),
});

/**
 * Schema de peso
 */
const productWeightSchema = yup.object({
  value: yup.number().positive('El peso debe ser positivo'),
  unit: yup
    .string()
    .oneOf(['kg', 'g', 'lb', 'oz'], 'Unidad de peso inválida')
    .default('kg'),
});

/**
 * SCHEMA PRINCIPAL DE PRODUCTO
 * Validación completa para creación/edición
 */
export const productSchema = yup.object({
  // ============================================
  // INFORMACIÓN BÁSICA
  // ============================================
  name: yup
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .required('El nombre del producto es requerido'),

  slug: yup
    .string()
    .lowercase()
    .matches(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones')
    .required('El slug es requerido'),

  description: yup
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(5000, 'La descripción no puede exceder 5000 caracteres')
    .required('La descripción es requerida'),

  shortDescription: yup
    .string()
    .trim()
    .max(300, 'La descripción corta no puede exceder 300 caracteres'),

  // ============================================
  // PRECIOS Y COSTOS
  // ============================================
  price: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .test('is-decimal', 'El precio debe tener máximo 2 decimales', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .required('El precio es requerido'),

  comparePrice: yup
    .number()
    .min(0, 'El precio de comparación no puede ser negativo')
    .test('is-decimal', 'El precio debe tener máximo 2 decimales', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .test('is-greater', 'El precio de comparación debe ser mayor al precio de venta', function (value) {
      if (!value) return true;
      return value > this.parent.price;
    }),

  costPrice: yup
    .number()
    .min(0, 'El precio de costo no puede ser negativo')
    .test('is-decimal', 'El precio debe tener máximo 2 decimales', (value) => {
      if (!value) return true;
      return /^\d+(\.\d{1,2})?$/.test(value.toString());
    })
    .test('is-lower', 'El precio de costo debería ser menor al precio de venta', function (value) {
      if (!value) return true;
      return value <= this.parent.price;
    }),

  // ============================================
  // INVENTARIO Y SKU
  // ============================================
  sku: yup
    .string()
    .uppercase()
    .trim()
    .matches(/^[A-Z0-9-_]{3,50}$/, 'SKU debe ser alfanumérico, guiones y guiones bajos (3-50 caracteres)')
    .required('El SKU es requerido'),

  stock: yup
    .number()
    .integer('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .required('El stock es requerido'),

  trackQuantity: yup.boolean().default(true),

  allowBackorder: yup.boolean().default(false),

  lowStockThreshold: yup
    .number()
    .integer('El umbral debe ser un número entero')
    .min(0, 'El umbral no puede ser negativo')
    .default(5),

  // ============================================
  // CATEGORIZACIÓN
  // ============================================
  categories: yup
    .array()
    .of(yup.string().matches(/^[0-9a-fA-F]{24}$/, 'ID de categoría inválido'))
    .min(1, 'Debe seleccionar al menos una categoría')
    .required('Las categorías son requeridas'),

  mainCategory: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, 'ID de categoría principal inválido')
    .required('La categoría principal es requerida'),

  tags: yup.array().of(yup.string().lowercase().trim()),

  // ============================================
  // MEDIOS (IMÁGENES)
  // ============================================
  images: yup
    .array()
    .of(productImageSchema)
    .min(1, 'Debe agregar al menos una imagen')
    .max(10, 'No puede agregar más de 10 imágenes')
    .test('has-primary', 'Debe haber una imagen principal', (images) => {
      if (!images || images.length === 0) return false;
      return images.some((img) => img.isPrimary === true);
    })
    .required('Las imágenes son requeridas'),

  // ============================================
  // ATRIBUTOS Y VARIANTES
  // ============================================
  brand: yup.string().trim().max(100, 'La marca no puede exceder 100 caracteres'),

  attributes: productAttributesSchema,

  variants: yup.array().of(productVariantSchema).max(50, 'No puede agregar más de 50 variantes'),

  // ============================================
  // SEO
  // ============================================
  seo: productSeoSchema,

  // ============================================
  // MÉTRICAS (Solo lectura en frontend)
  // ============================================
  views: yup.number().integer().min(0).default(0),
  salesCount: yup.number().integer().min(0).default(0),
  rating: productRatingSchema,

  // ============================================
  // ESTADO Y CONTROL
  // ============================================
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

  // ============================================
  // CONFIGURACIÓN
  // ============================================
  isActive: yup.boolean().default(true),

  requiresShipping: yup.boolean().default(true),

  weight: productWeightSchema.nullable(),
});

/**
 * Schema simplificado para búsqueda/filtrado
 */
export const productFilterSchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(12),
  sort: yup
    .string()
    .oneOf(['createdAt', 'price', 'name', 'salesCount', 'views', 'rating.average'], 'Campo de ordenamiento inválido')
    .default('createdAt'),
  order: yup.string().oneOf(['asc', 'desc'], 'Orden inválido').default('desc'),
  category: yup.string(),
  search: yup.string().min(2, 'La búsqueda debe tener al menos 2 caracteres').max(100),
  minPrice: yup.number().min(0),
  maxPrice: yup.number().min(0),
  status: yup.string().oneOf(['active', 'draft', 'archived', 'discontinued']).default('active'),
  visibility: yup.string().oneOf(['public', 'private', 'hidden']).default('public'),
  featured: yup.boolean(),
  inStock: yup.boolean(),
  brand: yup.string(),
});

/**
 * Schema para creación rápida de producto (formulario básico)
 */
export const productQuickCreateSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(120, 'El nombre no puede exceder 120 caracteres')
    .required('El nombre del producto es requerido'),

  price: yup
    .number()
    .min(0, 'El precio no puede ser negativo')
    .required('El precio es requerido'),

  stock: yup
    .number()
    .integer('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo')
    .default(0),

  categories: yup
    .array()
    .of(yup.string())
    .min(1, 'Debe seleccionar al menos una categoría')
    .required('Las categorías son requeridas'),

  description: yup
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .required('La descripción es requerida'),
});

/**
 * Schema para actualización parcial
 */
export const productUpdateSchema = productSchema.partial();

/**
 * Validación de disponibilidad de producto
 */
export const validateProductAvailability = (product) => {
  return (
    product.status === 'active' &&
    product.isPublished === true &&
    product.isActive === true &&
    (product.stock > 0 || product.allowBackorder === true)
  );
};

/**
 * Validación de stock
 */
export const validateStock = (product, requestedQuantity) => {
  if (!product.trackQuantity) return { valid: true };

  if (product.stock >= requestedQuantity) {
    return { valid: true };
  }

  if (product.allowBackorder) {
    return { valid: true, backorder: true };
  }

  return {
    valid: false,
    message: `Stock insuficiente. Disponible: ${product.stock}`,
  };
};

/**
 * Validación de imagen
 */
export const validateProductImage = async (file) => {
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
 * Función helper para validar producto completo
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

export default productSchema;