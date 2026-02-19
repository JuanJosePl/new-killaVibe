/**
 * @module product.pricing
 * @description Reglas de negocio de precios de productos.
 *
 * Fuente única de verdad para toda la lógica de precios.
 * Reemplaza y unifica: priceHelpers.js + funciones duplicadas en productHelpers.js.
 *
 * PURO: Sin React, sin HTTP, sin localStorage, sin efectos secundarios.
 */

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const DEFAULT_TAX_RATE = 0.19; // IVA Colombia 19%
const COP_LOCALE = 'es-CO';
const COP_CURRENCY = 'COP';

// ─────────────────────────────────────────────
// PRECIO EFECTIVO
// ─────────────────────────────────────────────

/**
 * Precio real de venta del producto.
 * Si el producto tiene variantes activas con precio propio, usa el mínimo.
 * De lo contrario, usa product.price.
 *
 * @param {import('./product.entity').Product} product
 * @returns {number}
 */
export const getEffectivePrice = (product) => {
  if (!product) return 0;

  const activeVariants = (product.variants ?? []).filter(
    (v) => v.isActive && v.price != null
  );

  if (activeVariants.length > 0) {
    return Math.min(...activeVariants.map((v) => Number(v.price)));
  }

  return Number(product.price ?? 0);
};

/**
 * Precio de comparación (tachado) del producto.
 * @param {import('./product.entity').Product} product
 * @returns {number|null}
 */
export const getComparePrice = (product) => {
  if (!product) return null;
  const cp = Number(product.comparePrice ?? 0);
  return cp > 0 ? cp : null;
};

// ─────────────────────────────────────────────
// DESCUENTOS
// ─────────────────────────────────────────────

/**
 * ¿Tiene este producto descuento activo?
 * @param {import('./product.entity').Product} product
 * @returns {boolean}
 */
export const hasDiscount = (product) => {
  if (!product) return false;
  const comparePrice = getComparePrice(product);
  if (!comparePrice) return false;
  return comparePrice > getEffectivePrice(product);
};

/**
 * Porcentaje de descuento (0-100). 0 si no hay descuento.
 * @param {import('./product.entity').Product} product
 * @returns {number}
 */
export const getDiscountPercentage = (product) => {
  if (!hasDiscount(product)) return 0;
  const price = getEffectivePrice(product);
  const comparePrice = getComparePrice(product);
  return Math.round(((comparePrice - price) / comparePrice) * 100);
};

/**
 * Ahorro absoluto en COP. 0 si no hay descuento.
 * @param {import('./product.entity').Product} product
 * @returns {number}
 */
export const getAbsoluteSaving = (product) => {
  if (!hasDiscount(product)) return 0;
  const price = getEffectivePrice(product);
  const comparePrice = getComparePrice(product);
  return parseFloat((comparePrice - price).toFixed(2));
};

// ─────────────────────────────────────────────
// IMPUESTOS
// ─────────────────────────────────────────────

/**
 * Precio con IVA.
 * @param {number} price
 * @param {number} [taxRate=0.19]
 * @returns {number}
 */
export const getPriceWithTax = (price, taxRate = DEFAULT_TAX_RATE) => {
  if (!isValidPrice(price)) return 0;
  return parseFloat((price * (1 + taxRate)).toFixed(2));
};

/**
 * Valor del IVA.
 * @param {number} price
 * @param {number} [taxRate=0.19]
 * @returns {number}
 */
export const getTaxAmount = (price, taxRate = DEFAULT_TAX_RATE) => {
  if (!isValidPrice(price)) return 0;
  return parseFloat((price * taxRate).toFixed(2));
};

// ─────────────────────────────────────────────
// CUOTAS
// ─────────────────────────────────────────────

/**
 * Cuota mensual.
 * Si interestRate = 0, divide directamente (sin interés).
 *
 * @param {number} price
 * @param {number} months
 * @param {number} [interestRate=0]  - Tasa mensual en % (ej: 1.5 = 1.5%)
 * @returns {number}
 */
export const getInstallmentAmount = (price, months, interestRate = 0) => {
  if (!isValidPrice(price) || months < 1) return 0;

  if (interestRate === 0) {
    return parseFloat((price / months).toFixed(2));
  }

  const monthlyRate = interestRate / 100;
  const factor = Math.pow(1 + monthlyRate, months);
  return parseFloat(((price * monthlyRate * factor) / (factor - 1)).toFixed(2));
};

// ─────────────────────────────────────────────
// TOTALES
// ─────────────────────────────────────────────

/**
 * Total para una cantidad dada.
 * @param {number} price
 * @param {number} quantity
 * @returns {number}
 */
export const getLineTotal = (price, quantity) => {
  if (!isValidPrice(price) || quantity < 1) return 0;
  return parseFloat((price * quantity).toFixed(2));
};

// ─────────────────────────────────────────────
// FORMATEO
// ─────────────────────────────────────────────

/**
 * Formatea un número como precio en COP (sin decimales).
 * @param {number|null|undefined} price
 * @returns {string}
 */
export const formatCOP = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat(COP_LOCALE, {
    style: 'currency',
    currency: COP_CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatea un número como precio en COP (con decimales).
 * @param {number|null|undefined} price
 * @returns {string}
 */
export const formatCOPWithDecimals = (price) => {
  if (price === null || price === undefined) return 'N/A';
  return new Intl.NumberFormat(COP_LOCALE, {
    style: 'currency',
    currency: COP_CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

/**
 * Formatea solo el número sin símbolo de moneda.
 * @param {number|null|undefined} price
 * @returns {string}
 */
export const formatPriceNumber = (price) => {
  if (price === null || price === undefined) return '0';
  return new Intl.NumberFormat(COP_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

/**
 * Formatea un rango de precios.
 * @param {number|null} minPrice
 * @param {number|null} maxPrice
 * @returns {string}
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return 'N/A';
  if (!maxPrice) return `Desde ${formatCOP(minPrice)}`;
  if (!minPrice) return `Hasta ${formatCOP(maxPrice)}`;
  return `${formatCOP(minPrice)} - ${formatCOP(maxPrice)}`;
};

// ─────────────────────────────────────────────
// VALIDACIÓN
// ─────────────────────────────────────────────

/**
 * ¿Es un precio válido?
 * @param {any} price
 * @returns {boolean}
 */
export const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0 && !isNaN(price) && isFinite(price);
};

/**
 * Parsea un string de precio a número.
 * @param {string} priceString
 * @returns {number|null}
 */
export const parsePrice = (priceString) => {
  if (!priceString) return null;
  const cleaned = String(priceString).replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

/**
 * Redondea a múltiplo más cercano.
 * @param {number} price
 * @param {number} [multiple=100]
 * @returns {number}
 */
export const roundToMultiple = (price, multiple = 100) => {
  return Math.round(price / multiple) * multiple;
};