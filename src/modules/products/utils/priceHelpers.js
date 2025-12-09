/**
 * @module priceHelpers
 * @description Utilidades para formateo y cálculo de precios
 */

/**
 * Formatea precio en pesos colombianos
 * @param {number} price
 * @returns {string}
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Formatea precio con decimales
 * @param {number} price
 * @returns {string}
 */
export const formatPriceWithDecimals = (price) => {
  if (price === null || price === undefined) return 'N/A';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Formatea precio sin símbolo de moneda
 * @param {number} price
 * @returns {string}
 */
export const formatPriceNumber = (price) => {
  if (price === null || price === undefined) return '0';
  
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Calcula el precio con IVA
 * @param {number} price
 * @param {number} taxRate - Tasa de impuesto (default 19%)
 * @returns {number}
 */
export const calculatePriceWithTax = (price, taxRate = 0.19) => {
  return parseFloat((price * (1 + taxRate)).toFixed(2));
};

/**
 * Calcula el IVA
 * @param {number} price
 * @param {number} taxRate
 * @returns {number}
 */
export const calculateTax = (price, taxRate = 0.19) => {
  return parseFloat((price * taxRate).toFixed(2));
};

/**
 * Calcula precio total por cantidad
 * @param {number} price
 * @param {number} quantity
 * @returns {number}
 */
export const calculateTotal = (price, quantity) => {
  return parseFloat((price * quantity).toFixed(2));
};

/**
 * Calcula descuento porcentual
 * @param {number} originalPrice
 * @param {number} discountedPrice
 * @returns {number}
 */
export const calculateDiscountPercentage = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice <= discountedPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

/**
 * Aplica descuento porcentual
 * @param {number} price
 * @param {number} discountPercent
 * @returns {number}
 */
export const applyDiscount = (price, discountPercent) => {
  const discount = (price * discountPercent) / 100;
  return parseFloat((price - discount).toFixed(2));
};

/**
 * Verifica si un precio es válido
 * @param {number} price
 * @returns {boolean}
 */
export const isValidPrice = (price) => {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
};

/**
 * Compara dos precios
 * @param {number} price1
 * @param {number} price2
 * @returns {number} -1, 0, or 1
 */
export const comparePrices = (price1, price2) => {
  if (price1 < price2) return -1;
  if (price1 > price2) return 1;
  return 0;
};

/**
 * Calcula el ahorro
 * @param {number} comparePrice
 * @param {number} currentPrice
 * @returns {number}
 */
export const calculateSavings = (comparePrice, currentPrice) => {
  if (!comparePrice || comparePrice <= currentPrice) return 0;
  return parseFloat((comparePrice - currentPrice).toFixed(2));
};

/**
 * Formatea rango de precios
 * @param {number} minPrice
 * @param {number} maxPrice
 * @returns {string}
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return 'N/A';
  if (!maxPrice) return `Desde ${formatPrice(minPrice)}`;
  if (!minPrice) return `Hasta ${formatPrice(maxPrice)}`;
  
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

/**
 * Parsea string de precio a número
 * @param {string} priceString
 * @returns {number|null}
 */
export const parsePrice = (priceString) => {
  if (!priceString) return null;
  
  const cleaned = priceString.replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  
  return isNaN(parsed) ? null : parsed;
};

/**
 * Redondea precio a múltiplo más cercano
 * @param {number} price
 * @param {number} multiple - Múltiplo (e.g., 100, 1000)
 * @returns {number}
 */
export const roundToMultiple = (price, multiple = 100) => {
  return Math.round(price / multiple) * multiple;
};

/**
 * Calcula cuotas mensuales
 * @param {number} price
 * @param {number} months
 * @param {number} interestRate - Tasa de interés mensual
 * @returns {number}
 */
export const calculateInstallment = (price, months, interestRate = 0) => {
  if (interestRate === 0) {
    return parseFloat((price / months).toFixed(2));
  }
  
  const monthlyRate = interestRate / 100;
  const factor = Math.pow(1 + monthlyRate, months);
  const installment = (price * monthlyRate * factor) / (factor - 1);
  
  return parseFloat(installment.toFixed(2));
};