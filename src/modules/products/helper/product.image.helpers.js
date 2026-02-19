/**
 * @module product.image.helpers
 * @description Utilidades para manejo de imágenes de productos.
 *
 * Extrae y centraliza la lógica de getPrimaryImage que existía en productHelpers.js,
 * con soporte para todos los formatos de imagen detectados en el backend.
 */

import { IMAGE_CONFIG } from '../types/product.types';

/**
 * Obtiene la URL de imagen de un objeto de imagen (cualquier formato del backend).
 * @param {Object|string|null} img
 * @returns {string|null}
 */
const extractImageUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img || null;
  return img.url ?? img.secure_url ?? img.path ?? img.imageUrl ?? img.src ?? null;
};

/**
 * Obtiene la imagen principal de un producto de forma robusta.
 *
 * Prioridad:
 * 1. Imagen con isPrimary=true en product.images[]
 * 2. Primera imagen de product.images[]
 * 3. Campos sueltos: primaryImage, mainImage, mainImageUrl, image, thumbnail
 * 4. Placeholder fallback
 *
 * @param {import('../domain/product.entity').Product|null} product
 * @param {string} [fallback]
 * @returns {string}
 */
export const getPrimaryImage = (product, fallback = IMAGE_CONFIG.FALLBACK_URL) => {
  if (!product) return fallback;

  // 1. Array product.images[]
  if (Array.isArray(product.images) && product.images.length > 0) {
    // Prioridad A: Buscar isPrimary
    const primaryObj = product.images.find((img) => img?.isPrimary === true);
    const primaryUrl = extractImageUrl(primaryObj);
    if (primaryUrl) return primaryUrl;

    // Prioridad B: Primera del array
    const firstUrl = extractImageUrl(product.images[0]);
    if (firstUrl) return firstUrl;
  }

  // 2. Campos sueltos
  const singleFields = [
    product.primaryImage,
    product.mainImage,
    product.mainImageUrl,
    product.image,
    product.thumbnail,
  ];

  for (const src of singleFields) {
    const url = extractImageUrl(src);
    if (url) return url;
  }

  return fallback;
};

/**
 * Obtiene todas las URLs de imágenes de un producto, ordenadas por order.
 * @param {import('../domain/product.entity').Product} product
 * @returns {string[]}
 */
export const getAllImageUrls = (product) => {
  if (!product || !Array.isArray(product.images)) return [];

  return [...product.images]
    .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
    .map(extractImageUrl)
    .filter(Boolean);
};

/**
 * Obtiene la imagen de la variante activa, con fallback a la imagen principal del producto.
 * @param {import('../domain/product.entity').Product} product
 * @param {string} variantSku
 * @returns {string}
 */
export const getVariantImage = (product, variantSku) => {
  if (!product || !variantSku) return getPrimaryImage(product);

  const variant = product.variants?.find((v) => v.sku === variantSku);
  if (variant?.images?.[0]) {
    const url = extractImageUrl(variant.images[0]);
    if (url) return url;
  }

  return getPrimaryImage(product);
};