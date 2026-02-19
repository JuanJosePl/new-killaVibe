/**
 * @module products.normalizer
 * @description Transforma cualquier formato de respuesta del backend
 * al formato canónico de product.entity.
 *
 * Centraliza toda la lógica de normalización.
 * El resto del sistema recibe siempre Product canónico.
 */

import {
  createProductImage,
  createProductVariant,
  createProductRating,
  createProductSEO,
} from '../domain/product.entity';
import { PRODUCT_STATUS, PRODUCT_VISIBILITY } from '../types/product.types';

// ─────────────────────────────────────────────
// NORMALIZACIÓN DE ENTIDAD
// ─────────────────────────────────────────────

/**
 * Normaliza un objeto crudo del backend a Product canónico.
 * @param {Object} raw - Objeto producto crudo del backend
 * @returns {import('../domain/product.entity').Product}
 */
export const normalizeProduct = (raw) => {
  if (!raw || typeof raw !== 'object') return null;

  // Normalizar imágenes
  const images = normalizeImages(raw.images);

  // Normalizar variantes
  const variants = Array.isArray(raw.variants)
    ? raw.variants.map(createProductVariant)
    : [];

  return {
    // IDENTIFICADORES
    _id: raw._id ?? raw.id ?? '',
    slug: raw.slug ?? '',
    sku: raw.sku ?? '',

    // INFORMACIÓN BÁSICA
    name: raw.name ?? '',
    description: raw.description ?? '',
    shortDescription: raw.shortDescription ?? '',
    brand: raw.brand ?? '',

    // PRECIOS
    price: Number(raw.price ?? 0),
    comparePrice: raw.comparePrice != null ? Number(raw.comparePrice) : undefined,
    costPrice: raw.costPrice != null ? Number(raw.costPrice) : undefined,

    // INVENTARIO
    stock: Number(raw.stock ?? 0),
    trackQuantity: raw.trackQuantity !== false, // default true
    allowBackorder: raw.allowBackorder === true,
    lowStockThreshold: Number(raw.lowStockThreshold ?? 5),

    // CATEGORIZACIÓN
    categories: normalizeCategories(raw.categories),
    mainCategory: raw.mainCategory ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags.filter(Boolean) : [],

    // MEDIA
    images,

    // ATRIBUTOS Y VARIANTES
    attributes: raw.attributes ?? {},
    variants,

    // SEO
    seo: createProductSEO(raw.seo),

    // MÉTRICAS
    views: Number(raw.views ?? 0),
    salesCount: Number(raw.salesCount ?? 0),
    rating: createProductRating(raw.rating),

    // ESTADO
    status: raw.status ?? PRODUCT_STATUS.ACTIVE,
    visibility: raw.visibility ?? PRODUCT_VISIBILITY.PUBLIC,
    isPublished: raw.isPublished !== false,
    isActive: raw.isActive !== false,
    isFeatured: raw.isFeatured === true,

    // CONFIG
    requiresShipping: raw.requiresShipping !== false,
    weight: raw.weight ?? null,
    dimensions: raw.dimensions ?? null,

    // TIMESTAMPS
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
};

/**
 * Normaliza un array de imágenes.
 * @param {any} images
 * @returns {import('../domain/product.entity').ProductImage[]}
 */
const normalizeImages = (images) => {
  if (!Array.isArray(images) || images.length === 0) return [];

  const normalized = images.map((img, index) =>
    createProductImage(img, false, index)
  );

  // Si ninguna es primary, marcar la primera
  const hasPrimary = normalized.some((img) => img.isPrimary);
  if (!hasPrimary && normalized.length > 0) {
    normalized[0] = { ...normalized[0], isPrimary: true };
  }

  return normalized;
};

/**
 * Normaliza categorías (pueden venir como strings o como objetos populados).
 * @param {any} categories
 * @returns {string[]}
 */
const normalizeCategories = (categories) => {
  if (!Array.isArray(categories)) return [];
  return categories
    .map((cat) => (typeof cat === 'string' ? cat : cat?._id ?? cat?.id ?? ''))
    .filter(Boolean);
};

// ─────────────────────────────────────────────
// NORMALIZACIÓN DE LISTAS Y PAGINACIÓN
// ─────────────────────────────────────────────

/**
 * @typedef {Object} NormalizedPagination
 * @property {number} page
 * @property {number} pages
 * @property {number} total
 * @property {number} limit
 * @property {boolean} hasNextPage
 * @property {boolean} hasPrevPage
 */

/**
 * @typedef {Object} NormalizedProductList
 * @property {import('../domain/product.entity').Product[]} products
 * @property {NormalizedPagination} pagination
 */

/**
 * Normaliza cualquiera de los 3 formatos de respuesta del backend
 * a { products[], pagination }.
 *
 * Formato 1: { success, data: [...], pagination: {...} }
 * Formato 2: { success, products: [...], pagination: {...} }
 * Formato 3: Array directo [...]
 *
 * @param {Object|Array} response
 * @returns {NormalizedProductList}
 */
export const normalizeProductList = (response) => {
  let rawProducts = [];
  let rawPagination = null;

  // Formato 1: { data: [...], pagination }
  if (response?.data && Array.isArray(response.data)) {
    rawProducts = response.data;
    rawPagination = response.pagination;
  }
  // Formato 2: { products: [...], pagination }
  else if (response?.products && Array.isArray(response.products)) {
    rawProducts = response.products;
    rawPagination = response.pagination;
  }
  // Formato 3: Array directo
  else if (Array.isArray(response)) {
    rawProducts = response;
  }

  const products = rawProducts.map(normalizeProduct).filter(Boolean);

  const pagination = normalizePagination(rawPagination, {
    total: rawProducts.length,
  });

  return { products, pagination };
};

/**
 * Normaliza el objeto paginación del backend.
 * @param {Object|null} raw
 * @param {{ total?: number }} fallback
 * @returns {NormalizedPagination}
 */
export const normalizePagination = (raw, fallback = {}) => {
  const page = Number(raw?.page ?? raw?.current ?? 1);
  const pages = Number(raw?.pages ?? raw?.totalPages ?? 1);
  const total = Number(raw?.total ?? fallback.total ?? 0);
  const limit = Number(raw?.limit ?? 12);

  return {
    page,
    pages,
    total,
    limit,
    hasNextPage: page < pages,
    hasPrevPage: page > 1,
  };
};

// ─────────────────────────────────────────────
// NORMALIZACIÓN DE ERRORES
// ─────────────────────────────────────────────

/**
 * @typedef {'PRODUCT_NOT_FOUND'|'STOCK_INSUFFICIENT'|'VALIDATION_ERROR'|'NETWORK_ERROR'|'UNKNOWN_ERROR'} ProductErrorCode
 */

/**
 * @typedef {Object} ProductError
 * @property {ProductErrorCode} code
 * @property {string} message
 * @property {number} [statusCode]
 */

/**
 * Transforma errores HTTP/axios a errores de dominio semánticos.
 * Los hooks deciden qué hacer con estos errores.
 *
 * @param {any} error
 * @returns {ProductError}
 */
export const normalizeError = (error) => {
  const statusCode = error?.response?.status ?? error?.statusCode;
  const serverMessage = error?.response?.data?.message ?? error?.message ?? 'Error desconocido';

  let code = 'UNKNOWN_ERROR';

  if (!error?.response) code = 'NETWORK_ERROR';
  else if (statusCode === 404) code = 'PRODUCT_NOT_FOUND';
  else if (statusCode === 409) code = 'STOCK_INSUFFICIENT';
  else if (statusCode === 400 || statusCode === 422) code = 'VALIDATION_ERROR';
  else if (statusCode === 401 || statusCode === 403) code = 'AUTH_ERROR';

  return {
    code,
    message: serverMessage,
    statusCode,
  };
};