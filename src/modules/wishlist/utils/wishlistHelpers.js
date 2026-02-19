/**
 * @module wishlist.helpers
 * @description Utilidades puras de presentación para el dominio Wishlist.
 *
 * FASE 5 — VERSIÓN LIMPIA
 *
 * QUÉ SE ELIMINÓ vs wishlistHelpers.js anterior:
 * ❌ isWishlistEmpty()        → wishlist.items.length === 0 (inline en store/hooks)
 * ❌ getItemCount()           → wishlist.itemCount (propiedad del modelo)
 * ❌ isProductInWishlist()    → useWishlist().isInWishlist() (hook con selector)
 * ❌ findWishlistItem()       → items.find() (inline donde se necesite)
 * ❌ getAvailableItems()      → calculado en useWishlist (hook)
 * ❌ getUnavailableItems()    → calculado en useWishlist (hook)
 * ❌ getItemsWithPriceChange() → calculado en useWishlist (hook)
 * ❌ getItemsWithPriceDrop()  → calculado en useWishlist (hook)
 * ❌ sortByDateAdded()        → calculado en useWishlist (hook)
 * ❌ sortByPriceDrop()        → calculado en useWishlist (hook)
 * ❌ generateWishlistSummary() → calculado en useWishlist (hook)
 * ❌ canMoveToCart()          → canMoveItemToCart() en domain/wishlist.validators.js
 *
 * QUÉ QUEDA (solo formateo y utilidades de presentación puras):
 * ✅ formatPrice()
 * ✅ formatPriceChange()
 * ✅ formatPriceChangePercentage()
 * ✅ formatAddedDate()
 * ✅ getPriceChangeMessage()
 * ✅ getPriceChangeBadgeClass()
 * ✅ calculateTotalSavings()
 *
 * Todas son funciones puras: input → output, sin estado, sin efectos.
 * Testeables con un simple assert.
 */

// ============================================================================
// FORMATEO DE PRECIOS
// ============================================================================

/**
 * Formatea un monto con símbolo de moneda.
 *
 * @param {number|string} amount
 * @param {string} [currency='USD']
 * @returns {string} Ej: "$29.99"
 */
export const formatPrice = (amount, currency = 'USD') => {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numeric) || numeric === null || numeric === undefined) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

/**
 * Formatea la diferencia de precio de un item con signo.
 *
 * @param {import('./domain/wishlist.model').WishlistItem} item
 * @returns {string} Ej: "-$20.00" | "+$5.00" | ""
 */
export const formatPriceChange = (item) => {
  if (!item?.priceChanged || typeof item.priceDifference !== 'number') {
    return '';
  }

  const sign = item.priceDifference > 0 ? '+' : '';
  return `${sign}${formatPrice(Math.abs(item.priceDifference))}`;
};

/**
 * Formatea el porcentaje de cambio de precio de un item.
 *
 * @param {import('./domain/wishlist.model').WishlistItem} item
 * @returns {string} Ej: "-20.0%" | "+5.0%" | ""
 */
export const formatPriceChangePercentage = (item) => {
  if (!item?.priceChanged || !item.priceWhenAdded || !item.product?.price) {
    return '';
  }

  const percentage = (
    (item.product.price - item.priceWhenAdded) / item.priceWhenAdded * 100
  ).toFixed(1);

  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage}%`;
};

// ============================================================================
// FORMATEO DE FECHAS
// ============================================================================

/**
 * Formatea la fecha en que un producto fue agregado a la wishlist,
 * en términos relativos legibles.
 *
 * @param {string|Date} date - ISO string o Date object
 * @returns {string} Ej: "Hoy" | "Ayer" | "Hace 3 días" | "Hace 2 semanas"
 */
export const formatAddedDate = (date) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7)  return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// ============================================================================
// MENSAJES Y CLASES CSS
// ============================================================================

/**
 * Genera el mensaje de notificación para un cambio de precio.
 *
 * @param {import('./domain/wishlist.model').WishlistItem} item
 * @returns {string} Ej: "¡Precio reducido! Ahorra $20.00" | ""
 */
export const getPriceChangeMessage = (item) => {
  if (!item?.priceChanged) return '';

  if (item.priceDropped) {
    return `¡Precio reducido! Ahorra ${formatPriceChange(item)}`;
  }

  return `Precio aumentó ${formatPriceChange(item)}`;
};

/**
 * Retorna las clases Tailwind para el badge de cambio de precio.
 * Verde para bajada, rojo para subida.
 *
 * @param {import('./domain/wishlist.model').WishlistItem} item
 * @returns {string} Clases CSS
 */
export const getPriceChangeBadgeClass = (item) => {
  if (!item?.priceChanged) return '';

  return item.priceDropped
    ? 'bg-green-100 text-green-800 border-green-200'
    : 'bg-red-100 text-red-800 border-red-200';
};

// ============================================================================
// CÁLCULOS AGREGADOS
// ============================================================================

/**
 * Calcula el total de ahorros por bajadas de precio en la wishlist.
 *
 * @param {import('./domain/wishlist.model').WishlistItem[]} items
 * @returns {number} Total de ahorro en la moneda de los productos
 */
export const calculateTotalSavings = (items) => {
  if (!Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    if (
      item.priceDropped &&
      typeof item.priceDifference === 'number' &&
      item.priceDifference < 0
    ) {
      return total + Math.abs(item.priceDifference);
    }
    return total;
  }, 0);
};

export default {
  formatPrice,
  formatPriceChange,
  formatPriceChangePercentage,
  formatAddedDate,
  getPriceChangeMessage,
  getPriceChangeBadgeClass,
  calculateTotalSavings,
};