// wishlist/utils/wishlistHelpers.js

/**
 * @module WishlistHelpers
 * @description Funciones utilitarias para Wishlist
 * 
 * 🆕 MEJORADO:
 * - Validación de nullish
 * - canMoveToCart corregido (usa isPublished)
 * - isProductInWishlist maneja productos sin popular
 */

/**
 * Verifica si la wishlist está vacía
 */
export const isWishlistEmpty = (wishlist) => {
  return !wishlist || !wishlist.items || wishlist.items.length === 0;
};

/**
 * Obtiene el count de items
 */
export const getItemCount = (wishlist) => {
  return wishlist?.itemCount || wishlist?.items?.length || 0;
};

/**
 * 🆕 MEJORADO: Verifica si un producto está en la wishlist
 * Maneja caso de producto sin popular (solo ID)
 */
export const isProductInWishlist = (wishlist, productId) => {
  if (!wishlist || !wishlist.items) return false;
  return wishlist.items.some(item => {
    const id = item.product?._id || item.product?.id || item.productId || item._id || item.id;
    return String(id) === String(productId);
  });
};

/**
 * Encuentra un item por productId
 */
export const findWishlistItem = (wishlist, productId) => {
  if (!wishlist || !wishlist.items || !productId) return null;
  
  return wishlist.items.find(item => {
    if (typeof item.product === 'object' && item.product !== null) {
      return item.product._id === productId || item.product.id === productId;
    }
    return item.product === productId;
  }) || null;
};

/**
 * Filtra items disponibles (en stock y publicados)
 */
export const getAvailableItems = (wishlist) => {
  if (!wishlist || !wishlist.items) return [];
  
  return wishlist.items.filter(item => item.isAvailable === true);
};

/**
 * Filtra items no disponibles
 */
export const getUnavailableItems = (wishlist) => {
  if (!wishlist || !wishlist.items) return [];
  
  return wishlist.items.filter(item => item.isAvailable === false);
};

/**
 * Obtiene items con cambio de precio
 */
export const getItemsWithPriceChange = (wishlist) => {
  if (!wishlist || !wishlist.items) return [];
  
  return wishlist.items.filter(item => item.priceChanged === true);
};

/**
 * Obtiene items con precio reducido
 */
export const getItemsWithPriceDrop = (wishlist) => {
  if (!wishlist || !wishlist.items) return [];
  
  return wishlist.items.filter(item => item.priceDropped === true);
};

/**
 * Formatea el cambio de precio
 */
export const formatPriceChange = (item) => {
  if (!item || !item.priceChanged || typeof item.priceDifference !== 'number') {
    return '';
  }
  
  const sign = item.priceDifference > 0 ? '+' : '';
  return `${sign}$${Math.abs(item.priceDifference).toFixed(2)}`;
};

/**
 * Formatea el porcentaje de cambio de precio
 */
export const formatPriceChangePercentage = (item) => {
  // 🔍 NORMALIZACIÓN: Buscar el producto en item.product o en item
  const product = item.product || item; 
  if (!item.priceChanged || !item.priceWhenAdded || !product?.price) {
    return '';
  }
  
  const percentage = (
    (product.price - item.priceWhenAdded) / item.priceWhenAdded * 100
  ).toFixed(1);
  
  const sign = percentage > 0 ? '+' : '';
  return `${sign}${percentage}%`;
};

/**
 * Formatea precio con moneda
 */
export const formatPrice = (amount, currency = 'USD') => {
  // CORRECCIÓN: Manejar strings que vienen del input o valores nulos
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numericAmount) || numericAmount === null) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: currency === 'USD' ? 'currency' : 'decimal',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numericAmount);
};

/**
 * Calcula el total de ahorros por cambios de precio
 */
export const calculateTotalSavings = (wishlist) => {
  if (!wishlist || !wishlist.items) return 0;
  
  return wishlist.items.reduce((total, item) => {
    if (item.priceDropped && typeof item.priceDifference === 'number' && item.priceDifference < 0) {
      return total + Math.abs(item.priceDifference);
    }
    return total;
  }, 0);
};

/**
 * Ordena items por fecha agregada (más reciente primero)
 */
export const sortByDateAdded = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return [...items].sort((a, b) => {
    return new Date(b.addedAt) - new Date(a.addedAt);
  });
};

/**
 * Ordena items por cambio de precio (mayor descuento primero)
 */
export const sortByPriceDrop = (items) => {
  if (!items || !Array.isArray(items)) return [];
  
  return [...items].sort((a, b) => {
    const diffA = Number(a.priceDifference) || 0;
    const diffB = Number(b.priceDifference) || 0;
    return diffA - diffB;
  });
};

/**
 * Genera mensaje de notificación para cambio de precio
 */
export const getPriceChangeMessage = (item) => {
  if (!item || !item.priceChanged) return '';
  
  if (item.priceDropped) {
    return `¡Precio reducido! Ahorra ${formatPriceChange(item)}`;
  } else {
    return `Precio aumentó ${formatPriceChange(item)}`;
  }
};

/**
 * Genera resumen de la wishlist
 */
export const generateWishlistSummary = (wishlist) => {
  const itemCount = getItemCount(wishlist);
  const availableCount = getAvailableItems(wishlist).length;
  const unavailableCount = getUnavailableItems(wishlist).length;
  const priceChangesCount = getItemsWithPriceChange(wishlist).length;
  const priceDropsCount = getItemsWithPriceDrop(wishlist).length;
  const totalSavings = calculateTotalSavings(wishlist);
  
  return {
    itemCount,
    availableCount,
    unavailableCount,
    priceChangesCount,
    priceDropsCount,
    totalSavings,
    isEmpty: isWishlistEmpty(wishlist)
  };
};

/**
 * Formatea fecha de agregado
 */
export const formatAddedDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;
  
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Obtiene clase CSS para badge de cambio de precio
 */
export const getPriceChangeBadgeClass = (item) => {
  if (!item || !item.priceChanged) return '';
  
  if (item.priceDropped) {
    return 'bg-green-100 text-green-800 border-green-200';
  } else {
    return 'bg-red-100 text-red-800 border-red-200';
  }
};

/**
 * 🆕 CORREGIDO: Valida si se puede mover item a carrito
 * Usa isPublished en lugar de status
 */
export const canMoveToCart = (item) => {
  // 🔍 NORMALIZACIÓN
  const product = item.product || item; 
  
  // Si no hay nombre, es un objeto corrupto o vacío
  if (!product.name && !product.title) return { canMove: false, reason: 'Datos incompletos' };

  // Priorizar el estado de disponibilidad del item, luego del producto
  const available = item.isAvailable ?? product.isAvailable ?? (product.stock > 0);

  if (!available) return { canMove: false, reason: 'No disponible' };
  if (product.stock === 0) return { canMove: false, reason: 'Sin stock' };
  
  return { canMove: true, reason: '' };
};

export default {
  isWishlistEmpty,
  getItemCount,
  isProductInWishlist,
  findWishlistItem,
  getAvailableItems,
  getUnavailableItems,
  getItemsWithPriceChange,
  getItemsWithPriceDrop,
  formatPriceChange,
  formatPriceChangePercentage,
  formatPrice,
  calculateTotalSavings,
  sortByDateAdded,
  sortByPriceDrop,
  getPriceChangeMessage,
  generateWishlistSummary,
  formatAddedDate,
  getPriceChangeBadgeClass,
  canMoveToCart
};