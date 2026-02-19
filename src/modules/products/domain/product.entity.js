/**
 * @module product.entity
 * @description Entidad canónica del dominio Products.
 *
 * Este archivo define la forma interna de un producto.
 * NO conoce axios, React, localStorage, ni Context.
 *
 * Toda la app habla este lenguaje. El normalizer convierte
 * el formato del backend a este formato canónico.
 */

// ─────────────────────────────────────────────
// VALUE OBJECTS
// ─────────────────────────────────────────────

/**
 * @typedef {Object} ProductImage
 * @property {string}  url        - URL canónica de la imagen
 * @property {string}  [altText]
 * @property {string}  [title]
 * @property {boolean} isPrimary
 * @property {number}  order
 */

/**
 * @typedef {Object} ProductVariant
 * @property {string}  sku
 * @property {string}  [name]
 * @property {number}  [price]
 * @property {number}  [comparePrice]
 * @property {number}  stock
 * @property {Object}  [attributes]   - { size, color, material }
 * @property {string[]} [images]
 * @property {boolean} isActive
 */

/**
 * @typedef {Object} ProductRating
 * @property {number} average
 * @property {number} count
 * @property {Object} distribution  - { _1, _2, _3, _4, _5 }
 */

/**
 * @typedef {Object} ProductSEO
 * @property {string}   [title]
 * @property {string}   [description]
 * @property {string[]} [metaKeywords]
 * @property {string}   [canonicalUrl]
 */

/**
 * @typedef {Object} ProductWeight
 * @property {number} value
 * @property {'kg'|'g'|'lb'|'oz'} unit
 */

/**
 * @typedef {Object} ProductDimensions
 * @property {number} length
 * @property {number} width
 * @property {number} height
 * @property {'cm'|'m'|'in'|'ft'} unit
 */

// ─────────────────────────────────────────────
// ENTIDAD PRINCIPAL
// ─────────────────────────────────────────────

/**
 * @typedef {Object} Product
 *
 * IDENTIFICADORES
 * @property {string}  _id
 * @property {string}  slug
 * @property {string}  sku
 *
 * INFORMACIÓN BÁSICA
 * @property {string}  name
 * @property {string}  description
 * @property {string}  [shortDescription]
 * @property {string}  [brand]
 *
 * PRECIOS
 * @property {number}  price
 * @property {number}  [comparePrice]
 * @property {number}  [costPrice]
 *
 * INVENTARIO
 * @property {number}  stock
 * @property {boolean} trackQuantity
 * @property {boolean} allowBackorder
 * @property {number}  lowStockThreshold
 *
 * CATEGORIZACIÓN
 * @property {string[]} categories
 * @property {string}   [mainCategory]
 * @property {string[]} [tags]
 *
 * MEDIA
 * @property {ProductImage[]} images
 *
 * ATRIBUTOS Y VARIANTES
 * @property {Object}           [attributes]
 * @property {ProductVariant[]} [variants]
 *
 * SEO
 * @property {ProductSEO} [seo]
 *
 * MÉTRICAS (solo lectura)
 * @property {number}        [views]
 * @property {number}        [salesCount]
 * @property {ProductRating} [rating]
 *
 * ESTADO
 * @property {'active'|'draft'|'archived'|'discontinued'} status
 * @property {'public'|'private'|'hidden'} visibility
 * @property {boolean} isPublished
 * @property {boolean} isActive
 * @property {boolean} [isFeatured]
 *
 * CONFIG
 * @property {boolean}          [requiresShipping]
 * @property {ProductWeight}    [weight]
 * @property {ProductDimensions} [dimensions]
 *
 * TIMESTAMPS
 * @property {string} [createdAt]
 * @property {string} [updatedAt]
 */

// ─────────────────────────────────────────────
// FACTORIES / CONSTRUCTORES CANÓNICOS
// ─────────────────────────────────────────────

/**
 * Crea una imagen canónica desde cualquier formato de entrada.
 * @param {Object|string} raw
 * @param {boolean} isPrimary
 * @param {number} order
 * @returns {ProductImage}
 */
export const createProductImage = (raw, isPrimary = false, order = 0) => {
  if (typeof raw === 'string') {
    return { url: raw, altText: '', title: '', isPrimary, order };
  }
  return {
    url: raw?.url ?? raw?.secure_url ?? raw?.path ?? raw?.imageUrl ?? raw?.src ?? '',
    altText: raw?.altText ?? raw?.alt ?? '',
    title: raw?.title ?? '',
    isPrimary: raw?.isPrimary ?? isPrimary,
    order: raw?.order ?? order,
  };
};

/**
 * Crea una variante canónica.
 * @param {Object} raw
 * @returns {ProductVariant}
 */
export const createProductVariant = (raw = {}) => ({
  sku: raw.sku ?? '',
  name: raw.name ?? '',
  price: raw.price != null ? Number(raw.price) : undefined,
  comparePrice: raw.comparePrice != null ? Number(raw.comparePrice) : undefined,
  stock: Number(raw.stock ?? 0),
  attributes: raw.attributes ?? {},
  images: Array.isArray(raw.images) ? raw.images : [],
  isActive: raw.isActive !== false,
});

/**
 * Crea un rating canónico.
 * @param {Object} raw
 * @returns {ProductRating}
 */
export const createProductRating = (raw = {}) => ({
  average: Number(raw.average ?? 0),
  count: Number(raw.count ?? 0),
  distribution: {
    _1: Number(raw.distribution?._1 ?? 0),
    _2: Number(raw.distribution?._2 ?? 0),
    _3: Number(raw.distribution?._3 ?? 0),
    _4: Number(raw.distribution?._4 ?? 0),
    _5: Number(raw.distribution?._5 ?? 0),
  },
});

/**
 * Crea un SEO canónico.
 * @param {Object} raw
 * @returns {ProductSEO}
 */
export const createProductSEO = (raw = {}) => ({
  title: raw.title ?? '',
  description: raw.description ?? '',
  metaKeywords: Array.isArray(raw.metaKeywords) ? raw.metaKeywords : [],
  canonicalUrl: raw.canonicalUrl ?? '',
});