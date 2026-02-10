// cart/utils/cartHelpers.js

import {
  SHIPPING_METHOD_LABELS,
  SHIPPING_COSTS,
  COUPON_TYPES,
  CART_THRESHOLDS,
  DEFAULT_TAX_RATE,
  DEFAULT_SHIPPING_COST,
} from "../types/cart.types";

/**
 * @module CartHelpers
 * @description Funciones utilidad para el módulo Cart
 */

// ============================================================================
// CÁLCULOS DE TOTALES
// ============================================================================

export const calculateSubtotal = (items = []) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((total, item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 0;
    return total + price * quantity;
  }, 0);
};

export const calculateCouponDiscount = (subtotal, coupon) => {
  if (!coupon || !coupon.code || typeof coupon.discount !== "number") {
    return 0;
  }
  const subtotalNum = Number(subtotal) || 0;
  if (coupon.type === COUPON_TYPES.PERCENTAGE) {
    const percentage = Math.min(Math.max(coupon.discount, 0), 100);
    return (subtotalNum * percentage) / 100;
  } else if (coupon.type === COUPON_TYPES.FIXED) {
    return Math.min(Math.max(coupon.discount, 0), subtotalNum);
  }
  return 0;
};

export const calculateShippingDiscount = (shippingCost, coupon) => {
  if (!coupon || !coupon.code || coupon.type !== COUPON_TYPES.SHIPPING) {
    return 0;
  }
  const shippingNum = Number(shippingCost) || 0;
  const discountNum = Number(coupon.discount) || 0;
  return Math.min(discountNum, shippingNum);
};

export const calculateTax = (amount, taxRate = DEFAULT_TAX_RATE) => {
  const amountNum = Number(amount) || 0;
  const rateNum = Number(taxRate) || 0;
  return (amountNum * rateNum) / 100;
};

export const calculateTotal = (cart) => {
  if (!cart) return 0;
  const subtotal = Number(cart.subtotal) || calculateSubtotal(cart.items);
  const couponDiscount = calculateCouponDiscount(subtotal, cart.coupon);
  const shippingCost = Number(cart.shippingCost) || Number(cart.shipping) || 0;
  const shippingDiscount = calculateShippingDiscount(shippingCost, cart.coupon);
  const beforeTax =
    subtotal - couponDiscount + (shippingCost - shippingDiscount);
  const tax = calculateTax(beforeTax, cart.taxRate);
  return Math.max(0, beforeTax + tax);
};

export const normalizeCartStructure = (items = [], options = {}) => {
  const {
    coupon = null,
    shippingMethod = "standard",
    shippingAddress = null,
    taxRate = DEFAULT_TAX_RATE,
  } = options;

  const subtotal = calculateSubtotal(items);
  const discount = calculateCouponDiscount(subtotal, coupon);
  const shippingCost = SHIPPING_COSTS[shippingMethod] || 0;
  const shippingDiscount = calculateShippingDiscount(shippingCost, coupon);
  const shipping = shippingCost - shippingDiscount;
  const beforeTax = subtotal - discount + shipping;
  const tax = calculateTax(beforeTax, taxRate);
  const total = Math.max(0, beforeTax + tax);

  return {
    items,
    subtotal,
    tax,
    shipping,
    shippingCost,
    discount,
    total,
    coupon,
    shippingMethod,
    shippingAddress,
    taxRate,
  };
};

/**
 * ✅ INTEGRADO del funcional: calcula totales con lógica COP real del proyecto.
 * Envío gratis a partir de 150.000 COP, costo base 15.000 COP.
 * Esta función es usada por CartContext en modo guest para garantizar
 * que los totales mostrados sean consistentes con CartSummary.
 *
 * @param {Array} items - Items del carrito (array plano)
 * @returns {Object} Carrito con totales calculados
 */
export const calculateLocalCartTotals = (items = []) => {
  if (!Array.isArray(items)) items = [];

  const subtotal = items.reduce((acc, item) => {
    const price = Number(item.product?.price || item.price || 0);
    const qty = Number(item.quantity || 0);
    return acc + price * qty;
  }, 0);

  const shippingCost =
    subtotal >= CART_THRESHOLDS.MIN_FREE_SHIPPING ? 0 : DEFAULT_SHIPPING_COST;

  const taxRate = DEFAULT_TAX_RATE;
  const tax = subtotal * (taxRate / 100);

  const total = subtotal + shippingCost;

  return {
    items,
    subtotal,
    tax,
    shippingCost,
    shipping: shippingCost,
    discount: 0,
    total,
    coupon: null,
    shippingMethod: "standard",
    shippingAddress: null,
    taxRate,
  };
};

export const calculateItemCount = (items = []) => {
  if (!Array.isArray(items)) return 0;
  return items.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
};

export const calculateUniqueItems = (items = []) => {
  if (!Array.isArray(items)) return 0;
  return items.length;
};

// ============================================================================
// FORMATEO DE PRECIOS
// ============================================================================

export const formatPrice = (amount, currency = "COP") => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDiscount = (coupon) => {
  if (!coupon || !coupon.code) return "";
  if (coupon.type === COUPON_TYPES.PERCENTAGE) {
    return `-${coupon.discount}%`;
  } else if (coupon.type === COUPON_TYPES.FIXED) {
    return `-${formatPrice(coupon.discount)}`;
  } else if (coupon.type === COUPON_TYPES.SHIPPING) {
    return `Envío gratis`;
  }
  return "";
};

export const formatSavingsPercentage = (original, final) => {
  const orig = Number(original) || 0;
  const fin = Number(final) || 0;
  if (orig <= fin) return "";
  const savings = ((orig - fin) / orig) * 100;
  return `${savings.toFixed(0)}%`;
};

// ============================================================================
// VALIDACIONES Y VERIFICACIONES
// ============================================================================

export const isCartEmpty = (cart) => {
  return !cart || !cart.items || cart.items.length === 0;
};

export const hasCouponApplied = (cart) => {
  return !!cart?.coupon?.code;
};

export const qualifiesForFreeShipping = (
  subtotal,
  threshold = CART_THRESHOLDS.MIN_FREE_SHIPPING
) => {
  const sub = Number(subtotal) || 0;
  const thres = Number(threshold) || 0;
  return sub >= thres;
};

export const amountForFreeShipping = (
  subtotal,
  threshold = CART_THRESHOLDS.MIN_FREE_SHIPPING
) => {
  const sub = Number(subtotal) || 0;
  const thres = Number(threshold) || 0;
  return Math.max(0, thres - sub);
};

export const isProductInCart = (items = [], productId, attributes = {}) => {
  if (!Array.isArray(items) || !productId) return false;
  return items.some((item) => {
    const itemProductId =
      item.product?._id || item.product?.id || item.productId;
    if (itemProductId !== productId) return false;
    return areAttributesEqual(item.attributes, attributes);
  });
};

export const findCartItem = (items = [], productId, attributes = {}) => {
  if (!Array.isArray(items) || !productId) return null;
  return (
    items.find((item) => {
      const itemProductId =
        item.product?._id || item.product?.id || item.productId;
      if (itemProductId !== productId) return false;
      return areAttributesEqual(item.attributes, attributes);
    }) || null
  );
};

export const hasLowStockItems = (items = []) => {
  if (!Array.isArray(items)) return false;
  return items.some((item) => {
    const stock = Number(item.product?.stock) || 0;
    return stock > 0 && stock <= CART_THRESHOLDS.LOW_STOCK_WARNING;
  });
};

export const getLowStockItems = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => {
    const stock = Number(item.product?.stock) || 0;
    return stock > 0 && stock <= CART_THRESHOLDS.LOW_STOCK_WARNING;
  });
};

// ============================================================================
// HELPERS DE UI
// ============================================================================

export const getShippingMethodLabel = (method) => {
  return SHIPPING_METHOD_LABELS[method] || method;
};

export const getShippingCost = (method) => {
  return SHIPPING_COSTS[method] || 0;
};

/**
 * ✅ INTEGRADO del funcional: lógica COP real para el resumen del checkout.
 * Envío gratis a partir de 150.000 COP, costo base 15.000 COP.
 * Mantiene todos los campos del contrato original.
 */
export const generateCartSummary = (cart) => {
  if (!cart) {
    return {
      subtotal: 0,
      discount: 0,
      shipping: 0,
      shippingDiscount: 0,
      tax: 0,
      total: 0,
      itemCount: 0,
      uniqueItems: 0,
      savings: 0,
      freeShippingRemaining: CART_THRESHOLDS.MIN_FREE_SHIPPING,
    };
  }

  const subtotal = Number(cart.subtotal) || calculateSubtotal(cart.items);
  const discount =
    Number(cart.discount) || calculateCouponDiscount(subtotal, cart.coupon);
  const shippingCostBase = Number(cart.shippingCost) || DEFAULT_SHIPPING_COST;
  // ✅ Lógica real del proyecto: envío gratis a partir de MIN_FREE_SHIPPING
  const isFreeShipping = subtotal >= CART_THRESHOLDS.MIN_FREE_SHIPPING;
  const shippingDiscount = calculateShippingDiscount(
    shippingCostBase,
    cart.coupon
  );
  const shipping = isFreeShipping
    ? 0
    : Math.max(0, shippingCostBase - shippingDiscount);

  const tax =
    Number(cart.tax) ||
    calculateTax(subtotal - discount + shipping, cart.taxRate);
  const total = subtotal - discount + shipping;

  return {
    subtotal,
    discount,
    shipping,
    shippingDiscount,
    tax,
    total,
    itemCount: calculateItemCount(cart.items),
    uniqueItems: calculateUniqueItems(cart.items),
    savings: discount + shippingDiscount,
    freeShippingRemaining: Math.max(
      0,
      CART_THRESHOLDS.MIN_FREE_SHIPPING - subtotal
    ),
  };
};

export const formatAttributes = (attributes = {}) => {
  if (!attributes || typeof attributes !== "object") return "";
  const parts = [];
  if (attributes.size) parts.push(`Talla: ${attributes.size}`);
  if (attributes.color) parts.push(`Color: ${attributes.color}`);
  if (attributes.material) parts.push(`Material: ${attributes.material}`);
  return parts.join(" | ");
};

export const getStockMessage = (stock) => {
  const stockNum = Number(stock) || 0;
  if (stockNum === 0) return "Sin stock";
  if (stockNum <= CART_THRESHOLDS.LOW_STOCK_WARNING) {
    return `¡Solo quedan ${stockNum}!`;
  }
  return "En stock";
};

export const isCouponValid = (coupon) => {
  if (!coupon || !coupon.code) return false;
  if (!coupon.expiresAt) return true;
  return new Date(coupon.expiresAt) > new Date();
};

export const areAttributesEqual = (attr1 = {}, attr2 = {}) => {
  const a1 = attr1 || {};
  const a2 = attr2 || {};
  const keys1 = Object.keys(a1).sort();
  const keys2 = Object.keys(a2).sort();
  if (keys1.length !== keys2.length) return false;
  return keys1.every((key, index) => {
    return keys2[index] === key && a1[key] === a2[key];
  });
};

export const generateCartItemKey = (productId, attributes = {}) => {
  const attrKeys = Object.keys(attributes || {}).sort();
  const attrString = attrKeys
    .map((key) => `${key}:${attributes[key]}`)
    .join("|");
  return `${productId}${attrString ? `::${attrString}` : ""}`;
};

export default {
  calculateSubtotal,
  calculateCouponDiscount,
  calculateShippingDiscount,
  calculateTax,
  calculateTotal,
  normalizeCartStructure,
  calculateLocalCartTotals,
  calculateItemCount,
  calculateUniqueItems,
  formatPrice,
  formatDiscount,
  formatSavingsPercentage,
  isCartEmpty,
  hasCouponApplied,
  qualifiesForFreeShipping,
  amountForFreeShipping,
  isProductInCart,
  findCartItem,
  hasLowStockItems,
  getLowStockItems,
  getShippingMethodLabel,
  getShippingCost,
  generateCartSummary,
  formatAttributes,
  getStockMessage,
  isCouponValid,
  areAttributesEqual,
  generateCartItemKey,
};
