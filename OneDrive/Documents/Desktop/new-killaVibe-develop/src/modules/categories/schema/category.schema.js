import * as yup from 'yup';

/**
 * @module CategorySchemas
 * @description Validaciones Yup sincronizadas 100% con category.validation.js (Joi)
 * 
 * ESQUEMAS:
 * - createCategorySchema: Para crear categoría (POST)
 * - updateCategorySchema: Para actualizar categoría (PUT)
 * - searchQuerySchema: Para validar búsquedas
 */

/**
 * Schema base para imágenes
 */
const imagesSchema = yup.object({
  thumbnail: yup
    .string()
    .url('La URL del thumbnail debe ser válida')
    .nullable(),
  hero: yup
    .string()
    .url('La URL del hero debe ser válida')
    .nullable(),
  icon: yup
    .string()
    .url('La URL del icon debe ser válida')
    .nullable(),
});

/**
 * Schema base para SEO
 */
const seoSchema = yup.object({
  metaTitle: yup
    .string()
    .max(60, 'El meta title no puede exceder 60 caracteres')
    .nullable(),
  metaDescription: yup
    .string()
    .max(160, 'La meta descripción no puede exceder 160 caracteres')
    .nullable(),
  keywords: yup
    .array()
    .of(
      yup.string().max(50, 'Cada keyword no puede exceder 50 caracteres')
    )
    .nullable(),
  ogImage: yup
    .string()
    .url('La URL de la imagen OG debe ser válida')
    .nullable(),
  ogDescription: yup
    .string()
    .nullable(),
});

/**
 * Schema para CREAR categoría
 * 
 * Sincronizado con: createCategoryValidation (Joi)
 */
export const createCategorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .required('El nombre es requerido'),

  description: yup
    .string()
    .trim()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable()
    .default(null),

  parentCategory: yup
    .string()
    .nullable()
    .default(null),

  images: imagesSchema.nullable().default(null),

  seo: seoSchema.nullable().default(null),

  featured: yup
    .boolean()
    .default(false),

  order: yup
    .number()
    .integer('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo')
    .default(0),
});

/**
 * Schema para ACTUALIZAR categoría
 * 
 * Sincronizado con: updateCategoryValidation (Joi)
 * NOTA: Todos los campos son opcionales excepto que al menos 1 debe estar presente
 */
export const updateCategorySchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  description: yup
    .string()
    .trim()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .nullable(),

  parentCategory: yup
    .string()
    .nullable(),

  images: imagesSchema.nullable(),

  seo: seoSchema.nullable(),

  featured: yup.boolean(),

  order: yup
    .number()
    .integer('El orden debe ser un número entero')
    .min(0, 'El orden no puede ser negativo'),

  isActive: yup.boolean(),

  status: yup
    .string()
    .oneOf(['active', 'archived', 'draft'], 'Estado inválido'),
}).test(
  'at-least-one',
  'Debe proporcionar al menos un campo para actualizar',
  (value) => Object.keys(value).length > 0
);

/**
 * Schema para búsqueda de categorías
 */
export const searchQuerySchema = yup.object({
  q: yup
    .string()
    .trim()
    .min(2, 'El término de búsqueda debe tener al menos 2 caracteres')
    .required('El término de búsqueda es requerido'),
});

/**
 * Validadores sincronos para uso en componentes
 */
export const validators = {
  /**
   * Valida nombre de categoría
   */
  validateName: (name) => {
    try {
      yup.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .validateSync(name);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Valida descripción
   */
  validateDescription: (description) => {
    try {
      yup.string()
        .trim()
        .max(1000)
        .nullable()
        .validateSync(description);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Valida URL de imagen
   */
  validateImageUrl: (url) => {
    if (!url) return { valid: true };
    try {
      yup.string().url().validateSync(url);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Valida término de búsqueda
   */
  validateSearchQuery: (query) => {
    try {
      searchQuerySchema.validateSync({ q: query });
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },
};

/**
 * Mensajes de error personalizados
 */
export const errorMessages = {
  name: {
    required: 'El nombre de la categoría es requerido',
    min: 'El nombre debe tener al menos 2 caracteres',
    max: 'El nombre no puede exceder 100 caracteres',
    unique: 'Ya existe una categoría con este nombre',
  },
  description: {
    max: 'La descripción no puede exceder 1000 caracteres',
  },
  parentCategory: {
    invalid: 'La categoría padre seleccionada no es válida',
    circular: 'No se puede crear una referencia circular',
  },
  images: {
    invalidUrl: 'La URL de la imagen no es válida',
  },
  seo: {
    metaTitleMax: 'El meta title no puede exceder 60 caracteres',
    metaDescriptionMax: 'La meta descripción no puede exceder 160 caracteres',
  },
  search: {
    min: 'El término de búsqueda debe tener al menos 2 caracteres',
  },
  delete: {
    hasSubcategories: 'No se puede eliminar una categoría con subcategorías activas',
    hasProducts: 'No se puede eliminar una categoría con productos asociados',
  },
};

/**
 * Exportación por defecto
 */
export default {
  createCategorySchema,
  updateCategorySchema,
  searchQuerySchema,
  validators,
  errorMessages,
};