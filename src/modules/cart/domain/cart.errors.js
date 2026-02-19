/**
 * @module cart.errors
 * @description Errores tipados del dominio Cart.
 *
 * Ventaja: el resto del sistema compara instancias (instanceof),
 * no strings. Un solo lugar interpreta err.response?.data?.message.
 */

export class CartError extends Error {
  constructor(message, code) {
    super(message);
    this.name  = 'CartError';
    this.code  = code || 'CART_ERROR';
  }
}

export class CartNotFoundError extends CartError {
  constructor(msg = 'Carrito no encontrado') {
    super(msg, 'CART_NOT_FOUND');
    this.name = 'CartNotFoundError';
  }
}

export class CartProductNotFoundError extends CartError {
  constructor(msg = 'Producto no encontrado en el carrito') {
    super(msg, 'CART_PRODUCT_NOT_FOUND');
    this.name = 'CartProductNotFoundError';
  }
}

export class CartValidationError extends CartError {
  constructor(msg = 'Datos inválidos', fields = {}) {
    super(msg, 'CART_VALIDATION');
    this.name   = 'CartValidationError';
    this.fields = fields;
  }
}

export class CartStockError extends CartError {
  constructor(msg = 'Stock insuficiente', available = 0) {
    super(msg, 'CART_INSUFFICIENT_STOCK');
    this.name      = 'CartStockError';
    this.available = available;
  }
}

export class CartCouponError extends CartError {
  constructor(msg = 'Cupón inválido o expirado') {
    super(msg, 'CART_COUPON_INVALID');
    this.name = 'CartCouponError';
  }
}

export class CartAuthError extends CartError {
  constructor(msg = 'Debes iniciar sesión para realizar esta acción') {
    super(msg, 'CART_UNAUTHORIZED');
    this.name = 'CartAuthError';
  }
}

export class CartNetworkError extends CartError {
  constructor(msg = 'Error de conexión al servidor', original) {
    super(msg, 'CART_NETWORK');
    this.name     = 'CartNetworkError';
    this.original = original || null;
  }
}

export class CartSyncError extends CartError {
  constructor(msg = 'Error al sincronizar el carrito', detail) {
    super(msg, 'CART_SYNC_ERROR');
    this.name   = 'CartSyncError';
    this.detail = detail || null;
  }
}

// ── FACTORY ────────────────────────────────────────────────────────────────

/**
 * Convierte cualquier error de red/API en un CartError tipado.
 * Un único lugar que interpreta err.response?.data?.message.
 *
 * @param {Error} err
 * @returns {CartError}
 */
export const fromHttpError = (err) => {
  const status  = err.response?.status;
  const message = err.response?.data?.message || err.message || 'Error desconocido';

  if (status === 401 || status === 403) return new CartAuthError(message);
  if (status === 404)                   return new CartNotFoundError(message);
  if (status === 422 || status === 400) {
    if (/stock|disponible/i.test(message)) {
      const match = message.match(/\d+/);
      return new CartStockError(message, match ? Number(match[0]) : 0);
    }
    if (/cup[oó]n/i.test(message)) return new CartCouponError(message);
    return new CartValidationError(message);
  }
  if (!status) return new CartNetworkError(message, err);

  return new CartError(message);
};