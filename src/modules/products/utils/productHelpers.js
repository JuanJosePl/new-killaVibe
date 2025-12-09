/**
 * @module productHelpers
 * @description Utilidades para manejo de productos
 */

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
 * Verifica si el producto está disponible
 * @param {Object} product
 * @returns {boolean}
 */
export const isProductAvailable = (product) => {
  if (!product) return false;
  
  return (
    product.status === 'active' &&
    product.isPublished === true &&
    product.isActive === true &&
    (product.stock > 0 || product.allowBackorder === true)
  );
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
 * Obtiene la imagen principal del producto
 * @param {Object} product
 * @returns {string|null}
 */
export const getPrimaryImage = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return null;
  }
  
  const primaryImage = product.images.find(img => img.isPrimary);
  return primaryImage ? primaryImage.url : product.images[0].url;
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