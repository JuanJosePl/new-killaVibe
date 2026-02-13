/**
 * @module productHelpers
 * @description Utilidades para manejo de productos
 */

import { PLACEHOLDERS } from "../types/product.types";

/**
 * Calcula el porcentaje de descuento
 * @param {number} comparePrice
 * @param {number} price
 * @returns {number}
 */
export const calculateDiscount = (comparePrice, price) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

/**
 * Calcula el ahorro total
 * @param {number} comparePrice
 * @param {number} price
 * @returns {number}
 */
export const calculateSavings = (comparePrice, price) => {
  if (!comparePrice || comparePrice <= price) return 0;
  return comparePrice - price;
};

/**
 * Verifica si el producto está disponible para la venta.
 *
 * Nota importante:
 * - Muchos productos vienen sin flags como `isPublished` o `isActive`.
 * - No queremos marcar "Agotado" solo porque el backend no envía esos campos.
 *
 * Reglas:
 * - Si `status` existe y NO es "active" → NO disponible.
 * - Si `visibility` existe y NO es "public" → NO disponible.
 * - Si `isPublished` o `isActive` son explícitamente `false` → NO disponible.
 * - Stock:
 *   - Si `trackQuantity` es true → requiere `stock > 0` o `allowBackorder === true`.
 *   - Si `trackQuantity` es false o no existe → se considera disponible a menos que se indique lo contrario.
 *
 * @param {Object} product
 * @returns {boolean}
 */
export const isProductAvailable = (product) => {
  if (!product) return false;

  // Estado y visibilidad (solo bloquean si vienen con valores "malos")
  if (product.status && product.status !== "active") return false;
  if (product.visibility && product.visibility !== "public") return false;

  // Flags de publicación: solo bloquean si son explícitamente false
  if (product.isPublished === false) return false;
  if (product.isActive === false) return false;

  // Stock y backorder
  const trackQuantity = product.trackQuantity === true;
  const stock = Number(product.stock ?? 0);
  const allowBackorder = product.allowBackorder === true;

  if (trackQuantity) {
    return stock > 0 || allowBackorder;
  }

  // Si no se controla stock, asumimos disponible
  return true;
};

/**
 * Verifica si el stock es bajo
 * @param {Object} product
 * @returns {boolean}
 */
export const isLowStock = (product) => {
  if (!product) return false;
  return product.trackQuantity && product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);
};

/**
 * Verifica si el producto está agotado
 * @param {Object} product
 * @returns {boolean}
 */
export const isOutOfStock = (product) => {
  if (!product) return true;
  return product.trackQuantity && product.stock === 0 && !product.allowBackorder;
};

/**
 * Obtiene la imagen principal del producto de forma robusta
 * - Soporta arrays de objetos { url, secure_url, path, imageUrl }
 * - Soporta arrays de strings con URLs directas
 * - Soporta campos sueltos: image, thumbnail, primaryImage, mainImageUrl
 * - Devuelve siempre un string (usa placeholder si no hay nada válido)
 *
 * @param {Object} product
 * @returns {string}
 */
/**
 * Obtiene la imagen principal del producto de forma robusta
 * - Soporta arrays de objetos { url, secure_url, path, imageUrl }
 * - Soporta arrays de strings con URLs directas
 * - Soporta campos sueltos: image, thumbnail, primaryImage, mainImageUrl
 * - Devuelve siempre un string (usa placeholder real si no hay nada válido)
 *
 * @param {Object} product
 * @returns {string}
 */
export const getPrimaryImage = (product) => {
  // 1. DEFINIR EL FALLBACK REAL
  // Según tu arbol.txt, este archivo sí existe en tu carpeta /public
  const fallback = "/parlante-rosa-con-orejitas-de-gato-brillantes-para.jpg";

  if (!product) return fallback;

  // Función interna para normalizar la extracción de la URL
  const pickUrl = (img) => {
    if (!img) return null;
    // Si ya es un string, lo devolvemos (ej: product.images = ["url1.jpg"])
    if (typeof img === "string") return img;
    // Si es un objeto, buscamos en todas las propiedades posibles del backend
    return (
      img.url ||
      img.secure_url ||
      img.path ||
      img.imageUrl ||
      img.src ||
      null
    );
  };

  // 2. INTENTO POR ARRAY DE IMÁGENES (product.images)
  if (Array.isArray(product.images) && product.images.length > 0) {
    // Prioridad A: Buscar la que el usuario marcó como principal
    const primaryImageObj = product.images.find((img) => img?.isPrimary === true);
    const primaryUrl = pickUrl(primaryImageObj);
    if (primaryUrl) return primaryUrl;

    // Prioridad B: Si no hay principal, tomar la primera del array
    const firstUrl = pickUrl(product.images[0]);
    if (firstUrl) return firstUrl;
  }

  // 3. INTENTO POR CAMPOS SINGULARES (Compatibilidad con distintos esquemas)
  const singleSources = [
    product.primaryImage,
    product.mainImage,
    product.mainImageUrl,
    product.image,     // El campo común en muchos JSON
    product.thumbnail,
  ];

  for (const src of singleSources) {
    const url = pickUrl(src);
    if (url) return url;
  }

  // 4. FALLBACK FINAL
  // Si llegó aquí, el array estaba vacío y no había campos de imagen
  return fallback;
};

/**
 * Obtiene el estado de disponibilidad
 * @param {Object} product
 * @returns {string}
 */
export const getAvailabilityStatus = (product) => {
  if (!product) return 'unavailable';
  
  if (product.stock > (product.lowStockThreshold || 5)) {
    return 'available';
  } else if (product.stock > 0 && product.stock <= (product.lowStockThreshold || 5)) {
    return 'low_stock';
  } else if (product.stock === 0 && product.allowBackorder) {
    return 'backorder';
  } else {
    return 'out_of_stock';
  }
};

/**
 * Obtiene el texto del estado de disponibilidad
 * @param {string} status
 * @returns {string}
 */
export const getAvailabilityText = (status) => {
  const texts = {
    available: '✓ En stock',
    low_stock: '⚠️ Pocas unidades disponibles',
    backorder: '📦 Disponible para pre-orden',
    out_of_stock: '✗ Producto agotado',
    unavailable: '✗ No disponible'
  };
  
  return texts[status] || texts.unavailable;
};

/**
 * Verifica si el producto es nuevo (menos de 7 días)
 * @param {Object} product
 * @returns {boolean}
 */
export const isNewProduct = (product) => {
  if (!product || !product.createdAt) return false;
  
  const createdDate = new Date(product.createdAt);
  const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceCreation <= 7;
};

/**
 * Obtiene el rating promedio
 * @param {Object} product
 * @returns {number|null}
 */
export const getAverageRating = (product) => {
  if (!product || !product.rating) return null;
  return product.rating.average || 0;
};

/**
 * Formatea la distribución de ratings
 * @param {Object} product
 * @returns {Array}
 */
export const getRatingDistribution = (product) => {
  if (!product || !product.rating || !product.rating.distribution) {
    return [];
  }

  const dist = product.rating.distribution;
  return [
    { stars: 5, count: dist._5 || 0 },
    { stars: 4, count: dist._4 || 0 },
    { stars: 3, count: dist._3 || 0 },
    { stars: 2, count: dist._2 || 0 },
    { stars: 1, count: dist._1 || 0 }
  ];
};

/**
 * Valida si el producto tiene los datos mínimos requeridos
 * @param {Object} product
 * @returns {boolean}
 */
export const isValidProduct = (product) => {
  return !!(
    product &&
    product._id &&
    product.name &&
    product.slug &&
    product.price !== undefined &&
    product.price !== null
  );
};

/**
 * Obtiene las variantes activas
 * @param {Object} product
 * @returns {Array}
 */
export const getActiveVariants = (product) => {
  if (!product || !product.variants) return [];
  return product.variants.filter(v => v.isActive === true);
};

/**
 * Encuentra variante por SKU
 * @param {Object} product
 * @param {string} sku
 * @returns {Object|null}
 */
export const findVariantBySku = (product, sku) => {
  if (!product || !product.variants) return null;
  return product.variants.find(v => v.sku === sku) || null;
};

/**
 * Calcula el precio total con descuento
 * @param {number} price
 * @param {number} quantity
 * @returns {number}
 */
export const calculateTotalPrice = (price, quantity) => {
  return parseFloat((price * quantity).toFixed(2));
};

/**
 * Genera un slug limpio para URLs
 * @param {string} text
 * @returns {string}
 */
export const generateSlug = (text) => {
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
 * Obtiene los tags del producto
 * @param {Object} product
 * @returns {Array}
 */
export const getProductTags = (product) => {
  if (!product || !product.tags) return [];
  return product.tags.filter(Boolean);
};