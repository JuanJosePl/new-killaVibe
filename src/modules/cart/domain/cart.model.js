/**
 * @module cart.model
 * @description Entidades canónicas del dominio Cart.
 * Única fuente de verdad sobre la forma de los datos.
 * NO conoce React, Zustand, API ni localStorage.
 */

import {
  EMPTY_CART_STRUCTURE,
  CART_LIMITS,
  SHIPPING_METHODS,
  CART_THRESHOLDS,
  DEFAULT_SHIPPING_COST,
  DEFAULT_TAX_RATE,
  COUPON_TYPES,
} from './cart.constants';

// ── MODOS ──────────────────────────────────────────────────────────────────

export const CartMode = Object.freeze({
  GUEST:         'guest',
  AUTHENTICATED: 'authenticated',
});

export const CartSyncStatus = Object.freeze({
  IDLE:        'idle',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  FAILED:      'failed',
});

// ── RESOLUCIÓN DE ID (un único lugar en todo el sistema) ───────────────────

/**
 * Extrae productId de cualquier forma que pueda llegar un item.
 * Consolida la cadena productData._id || productData.id || item.productId
 * que estaba duplicada en 6+ lugares del código anterior.
 *
 * @param {Object} raw
 * @returns {string|null}
 */
export const resolveProductId = (raw) => {
  if (!raw) return null;
  const id =
    raw.product?._id  ||
    raw.product?.id   ||
    raw.productId     ||
    raw._id           ||
    raw.id            ||
    null;
  return id ? String(id) : null;
};

// ── CONSTRUCTORES ──────────────────────────────────────────────────────────

/**
 * Normaliza cualquier item raw (API / localStorage) al modelo canónico.
 *
 * @typedef {Object} CartItem
 * @property {string}      productId
 * @property {Object|null} product     - Datos populados del producto
 * @property {number}      quantity
 * @property {number}      price       - Precio unitario en el momento de agregar
 * @property {Object}      attributes  - Variantes: size, color, material
 */
export const createCartItem = (raw) => {
  const productId = resolveProductId(raw);
  if (!productId) throw new Error('[CartItem] No se pudo resolver productId');

  const product = (typeof raw.product === 'object' && raw.product !== null)
    ? raw.product
    : null;

  const price    = Number(raw.price) || Number(product?.price) || 0;
  const quantity = Math.max(
    CART_LIMITS.MIN_QUANTITY,
    Math.min(Number(raw.quantity) || 1, CART_LIMITS.MAX_QUANTITY)
  );

  return {
    productId,
    product,
    quantity,
    price,
    attributes: raw.attributes || raw.options || {},
  };
};

/**
 * Crea un CartItem completo para modo guest.
 * Preserva todos los campos necesarios para renderizar UI sin backend.
 */
export const createGuestCartItem = (productData, quantity = 1, attributes = {}) => {
  const productId = productData._id || productData.id || productData.productId;
  if (!productId) throw new Error('[GuestCartItem] productId es requerido');

  const qty = Math.max(
    CART_LIMITS.MIN_QUANTITY,
    Math.min(Number(quantity), CART_LIMITS.MAX_QUANTITY)
  );

  return {
    productId: String(productId),
    product: {
      _id:           productId,
      id:            productId,
      name:          productData.name           || 'Producto',
      price:         Number(productData.price)  || 0,
      comparePrice:  Number(productData.comparePrice) || 0,
      images:        productData.images || (productData.image ? [{ url: productData.image }] : []),
      slug:          productData.slug           || '',
      stock:         productData.stock          ?? 99,
      trackQuantity: productData.trackQuantity  || false,
      mainCategory:  productData.mainCategory   || productData.category || null,
      rating:        productData.rating         || null,
      isFeatured:    productData.isFeatured     || productData.featured  || false,
    },
    quantity:   qty,
    price:      Number(productData.price) || 0,
    attributes,
  };
};

/**
 * Normaliza un carrito raw (API / localStorage) al modelo canónico.
 */
export const createCart = (raw) => {
  if (!raw) return { ...EMPTY_CART_STRUCTURE };

  const rawItems = Array.isArray(raw.items) ? raw.items : [];
  const items = rawItems.reduce((acc, rawItem) => {
    try { acc.push(createCartItem(rawItem)); } catch (_) { /* descarte silencioso */ }
    return acc;
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return {
    items,
    subtotal:        Number(raw.subtotal)      || 0,
    tax:             Number(raw.tax)           || 0,
    shipping:        Number(raw.shipping)      || Number(raw.shippingCost) || 0,
    shippingCost:    Number(raw.shippingCost)  || Number(raw.shipping)     || 0,
    discount:        Number(raw.discount)      || Number(raw.discountAmount) || 0,
    total:           Number(raw.total)         || 0,
    coupon:          raw.coupon                || null,
    shippingMethod:  raw.shippingMethod        || SHIPPING_METHODS.STANDARD,
    shippingAddress: raw.shippingAddress       || null,
    taxRate:         Number(raw.taxRate)       ?? DEFAULT_TAX_RATE,
    itemCount,
  };
};

// ── CÁLCULO LOCAL DE TOTALES (modo guest) ──────────────────────────────────

const _calcCouponDiscount = (subtotal, coupon) => {
  if (!coupon?.code || typeof coupon.discount !== 'number') return 0;
  if (coupon.type === COUPON_TYPES.PERCENTAGE) {
    return (subtotal * Math.min(Math.max(coupon.discount, 0), 100)) / 100;
  }
  if (coupon.type === COUPON_TYPES.FIXED) {
    return Math.min(Math.max(coupon.discount, 0), subtotal);
  }
  return 0;
};

/**
 * Recalcula subtotal, shipping y total a partir de los items.
 * Lógica COP: envío gratis a partir de 150.000 COP, costo base 15.000 COP.
 * Equivalente a calculateLocalCartTotals del CartContext original.
 *
 * @param {CartItem[]} items
 * @param {Object}     [options]
 * @returns {Cart}
 */
export const recalculateLocalCart = (items = [], options = {}) => {
  const {
    coupon          = null,
    shippingMethod  = SHIPPING_METHODS.STANDARD,
    shippingAddress = null,
    taxRate         = DEFAULT_TAX_RATE,
  } = options;

  const subtotal       = items.reduce((acc, item) => {
    return acc + (Number(item.product?.price || item.price || 0) * item.quantity);
  }, 0);

  const couponDiscount = _calcCouponDiscount(subtotal, coupon);
  const isFreeShipping = subtotal >= CART_THRESHOLDS.MIN_FREE_SHIPPING;
  const shippingCost   = isFreeShipping ? 0 : DEFAULT_SHIPPING_COST;
  const tax            = (subtotal - couponDiscount) * (taxRate / 100);
  const total          = Math.max(0, subtotal - couponDiscount + shippingCost + tax);
  const itemCount      = items.reduce((s, i) => s + i.quantity, 0);

  return {
    items,
    subtotal,
    tax,
    shipping:        shippingCost,
    shippingCost,
    discount:        couponDiscount,
    total,
    coupon,
    shippingMethod,
    shippingAddress,
    taxRate,
    itemCount,
  };
};

/**
 * Genera el resumen legible del carrito para la UI.
 */
export const generateCartSummary = (cart) => {
  if (!cart) return null;

  const subtotal     = cart.subtotal || 0;
  const discount     = cart.discount || _calcCouponDiscount(subtotal, cart.coupon);
  const isFree       = subtotal >= CART_THRESHOLDS.MIN_FREE_SHIPPING;
  const shippingCost = cart.shippingCost || DEFAULT_SHIPPING_COST;
  const shipping     = isFree ? 0 : shippingCost;
  const taxRate      = Number(cart.taxRate) || DEFAULT_TAX_RATE;
  const tax          = (subtotal - discount) * (taxRate / 100);
  const total        = Math.max(0, subtotal - discount + shipping + tax);
  const itemCount    = cart.itemCount
    || cart.items?.reduce((s, i) => s + i.quantity, 0)
    || 0;

  return {
    subtotal,
    discount,
    shipping,
    tax,
    total,
    itemCount,
    savings:                  discount,
    freeShippingRemaining:    Math.max(0, CART_THRESHOLDS.MIN_FREE_SHIPPING - subtotal),
    qualifiesForFreeShipping: isFree,
  };
};

// ── ESTADO INICIAL DEL STORE ───────────────────────────────────────────────

export const createInitialCartState = () => ({
  cart:        createCart(null),
  mode:        CartMode.GUEST,
  loading: {
    global: false,
    items:  new Set(),
  },
  error:       null,
  initialized: false,
  cache: {
    data:      null,
    timestamp: null,
  },
  syncStatus: CartSyncStatus.IDLE,
  syncResult: null,
});