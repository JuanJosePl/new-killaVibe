/**
 * @module product.validators
 * @description Validaciones puras de runtime para entidades Product.
 *
 * Diferencia con validation/product.schema.js:
 * - Estos validators operan sobre datos ya existentes (runtime checks).
 * - El schema Yup valida input del usuario en formularios.
 *
 * PURO: Sin React, sin HTTP, sin dependencias externas.
 */

import { VALIDATION_PATTERNS } from '../types/product.types';

// ─────────────────────────────────────────────
// VALIDADORES DE ENTIDAD
// ─────────────────────────────────────────────

/**
 * ¿Tiene el producto los datos mínimos requeridos para operar?
 * @param {any} product
 * @returns {boolean}
 */
export const isValidProduct = (product) => {
  return !!(
    product &&
    typeof product === 'object' &&
    product._id &&
    product.name &&
    product.slug &&
    product.price !== undefined &&
    product.price !== null
  );
};

/**
 * ¿Tiene el producto al menos una imagen con URL válida?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const hasValidImages = (product) => {
  if (!product || !Array.isArray(product.images)) return false;
  return product.images.some((img) => {
    const url = typeof img === 'string' ? img : img?.url;
    return url && url.startsWith('http');
  });
};

/**
 * ¿Es un SKU válido según las reglas del dominio?
 * @param {string} sku
 * @returns {boolean}
 */
export const isValidSKU = (sku) => {
  if (!sku || typeof sku !== 'string') return false;
  return VALIDATION_PATTERNS.SKU.test(sku.toUpperCase());
};

/**
 * ¿Es un slug válido?
 * @param {string} slug
 * @returns {boolean}
 */
export const isValidSlug = (slug) => {
  if (!slug || typeof slug !== 'string') return false;
  return VALIDATION_PATTERNS.SLUG.test(slug);
};

/**
 * ¿Es un precio válido (número no negativo con máx. 2 decimales)?
 * @param {number} price
 * @returns {boolean}
 */
export const isValidPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price) || price < 0) return false;
  return VALIDATION_PATTERNS.PRICE.test(price.toString());
};

/**
 * ¿Es el comparePrice mayor al price?
 * @param {number} price
 * @param {number} comparePrice
 * @returns {boolean}
 */
export const isValidComparePrice = (price, comparePrice) => {
  if (!comparePrice) return true; // opcional
  return isValidPrice(comparePrice) && comparePrice > price;
};

/**
 * ¿Tiene el producto al menos una categoría?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const hasValidCategories = (product) => {
  if (!product) return false;
  return Array.isArray(product.categories) && product.categories.length > 0;
};

// ─────────────────────────────────────────────
// VALIDADORES DE COLECCIÓN
// ─────────────────────────────────────────────

/**
 * Filtra una lista de productos dejando solo los válidos.
 * @param {any[]} products
 * @returns {import('./product.entity').Product[]}
 */
export const filterValidProducts = (products) => {
  if (!Array.isArray(products)) return [];
  return products.filter(isValidProduct);
};

// ─────────────────────────────────────────────
// UTILIDADES
// ─────────────────────────────────────────────

/**
 * Genera un slug limpio desde texto.
 * @param {string} text
 * @returns {string}
 */
export const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

/**
 * Verifica si el producto es nuevo (menos de N días desde creación).
 * @param {import('./product.entity').Product} product
 * @param {number} [days=7]
 * @returns {boolean}
 */
export const isNewProduct = (product, days = 7) => {
  if (!product?.createdAt) return false;
  const msThreshold = days * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(product.createdAt).getTime() <= msThreshold;
};