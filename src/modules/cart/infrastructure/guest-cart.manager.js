/**
 * @module guest-cart.manager
 * @description Gestiona la persistencia del carrito guest en localStorage.
 *
 * RESPONSABILIDADES:
 * - Leer / escribir / borrar carrito guest
 * - Detectar y migrar formato legacy (array plano)
 * - Manejar corrupción de datos de forma segura
 * - Expiración de carrito (TTL configurable)
 *
 * NO conoce React, Zustand ni la API.
 * NO tiene efectos secundarios fuera de localStorage.
 * La clave CART_STORAGE_KEY existe SOLO aquí.
 */

import {
  CART_STORAGE_KEY,
  EMPTY_CART_STRUCTURE,
} from '../domain/cart.constants';

import {
  createGuestCartItem,
  recalculateLocalCart,
  createCart,
} from '../domain/cart.model';

import {
  resolveProductId,
} from '../domain/cart.model';

import {
  areAttributesEqual,
} from '../domain/cart.validators';

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 días

// ── LECTURA ────────────────────────────────────────────────────────────────

/**
 * Lee y normaliza el carrito guest desde localStorage.
 * Maneja:
 *   - Formato nuevo: { items, subtotal, … }
 *   - Formato legacy: Array de items
 *   - Expiración por TTL
 *   - Corrupción JSON
 *
 * @returns {Cart} Carrito normalizado (vacío si no existe o expiró)
 */
export const loadGuestCart = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { ...EMPTY_CART_STRUCTURE };

    const parsed = JSON.parse(raw);

    // Verificar TTL
    if (parsed.savedAt && Date.now() - parsed.savedAt > TTL_MS) {
      localStorage.removeItem(CART_STORAGE_KEY);
      return { ...EMPTY_CART_STRUCTURE };
    }

    // Formato nuevo: objeto con .items
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Array.isArray(parsed.items)) {
      return recalculateLocalCart(parsed.items, {
        coupon:          parsed.coupon          || null,
        shippingMethod:  parsed.shippingMethod  || 'standard',
        shippingAddress: parsed.shippingAddress || null,
      });
    }

    // Formato legacy: array plano
    if (Array.isArray(parsed)) {
      return recalculateLocalCart(parsed);
    }

    return { ...EMPTY_CART_STRUCTURE };
  } catch {
    return { ...EMPTY_CART_STRUCTURE };
  }
};

// ── ESCRITURA ──────────────────────────────────────────────────────────────

/**
 * Persiste el carrito en localStorage.
 * Agrega timestamp para TTL.
 *
 * @param {Cart} cart
 */
export const saveGuestCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      ...cart,
      savedAt: Date.now(),
    }));
  } catch {
    // quota exceeded u otro error de storage — falla silenciosamente
  }
};

/**
 * Elimina el carrito guest del localStorage.
 * Llamar SOLO después de un sync exitoso.
 */
export const clearGuestCart = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch { /* noop */ }
};

// ── OPERACIONES CRUD (modo guest) ──────────────────────────────────────────

/**
 * Agrega o incrementa un item en el carrito guest.
 *
 * @param {Object} productData - Objeto producto completo
 * @param {number} quantity
 * @param {Object} attributes
 * @returns {Cart} Nuevo estado del carrito
 */
export const addGuestItem = (productData, quantity = 1, attributes = {}) => {
  const currentCart = loadGuestCart();
  const productId   = String(productData._id || productData.id || productData.productId || '');

  if (!productId) throw new Error('[GuestCart] productId inválido');

  const availableStock = productData.stock ?? 99;
  const qty            = Number(quantity);
  const items          = [...currentCart.items];
  const existingIdx    = items.findIndex(i =>
    i.productId === productId && areAttributesEqual(i.attributes, attributes)
  );

  if (existingIdx > -1) {
    const newQty = items[existingIdx].quantity + qty;
    if (productData.trackQuantity && newQty > availableStock) {
      throw new Error(`Solo hay ${availableStock} unidades disponibles`);
    }
    items[existingIdx] = { ...items[existingIdx], quantity: newQty };
  } else {
    if (productData.trackQuantity && qty > availableStock) {
      throw new Error(`Solo hay ${availableStock} unidades disponibles`);
    }
    items.push(createGuestCartItem(productData, qty, attributes));
  }

  const updatedCart = recalculateLocalCart(items, {
    coupon:         currentCart.coupon,
    shippingMethod: currentCart.shippingMethod,
  });

  saveGuestCart(updatedCart);
  return updatedCart;
};

/**
 * Actualiza la cantidad de un item en el carrito guest.
 *
 * @param {string} productId
 * @param {number} newQuantity
 * @param {Object} attributes
 * @returns {Cart}
 */
export const updateGuestItem = (productId, newQuantity, attributes = {}) => {
  const currentCart = loadGuestCart();
  const items       = [...currentCart.items];
  const idx         = items.findIndex(i =>
    i.productId === String(productId) && areAttributesEqual(i.attributes, attributes)
  );

  if (idx === -1) throw new Error('[GuestCart] Producto no encontrado en el carrito');

  const product = items[idx].product;
  if (product?.trackQuantity && newQuantity > (product?.stock || 99)) {
    throw new Error(`Solo hay ${product.stock} unidades disponibles`);
  }

  items[idx] = { ...items[idx], quantity: Number(newQuantity) };

  const updatedCart = recalculateLocalCart(items, {
    coupon:         currentCart.coupon,
    shippingMethod: currentCart.shippingMethod,
  });

  saveGuestCart(updatedCart);
  return updatedCart;
};

/**
 * Elimina un item del carrito guest por productId + attributes.
 *
 * @param {string} productId
 * @param {Object} attributes
 * @returns {Cart}
 */
export const removeGuestItem = (productId, attributes = {}) => {
  const currentCart = loadGuestCart();
  const items       = currentCart.items.filter(i =>
    !(i.productId === String(productId) && areAttributesEqual(i.attributes, attributes))
  );

  const updatedCart = recalculateLocalCart(items, {
    coupon:         currentCart.coupon,
    shippingMethod: currentCart.shippingMethod,
  });

  saveGuestCart(updatedCart);
  return updatedCart;
};

/**
 * Vacía el carrito guest (en memoria + localStorage).
 *
 * @returns {Cart} Carrito vacío
 */
export const clearGuestItems = () => {
  clearGuestCart();
  return { ...EMPTY_CART_STRUCTURE };
};

/**
 * Devuelve los items guest sin modificar el estado.
 * Usado por el sync service antes del swap.
 *
 * @returns {CartItem[]}
 */
export const getGuestItems = () => {
  const cart = loadGuestCart();
  return cart.items || [];
};