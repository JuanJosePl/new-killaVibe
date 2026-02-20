/**
 * @module products
 * @description Punto de entrada público del módulo Products.
 *
 * REGLA: Importar siempre desde este índice, nunca desde rutas internas.
 *
 * ✅ import { useProductList } from '@/modules/products';
 * ❌ import { useProductList } from '@/modules/products/hooks/useProductList';
 */

// ─────────────────────────────────────────────
// DOMAIN (pure functions)
// ─────────────────────────────────────────────

export {
  // Availability
  canPurchase,
  canAddQuantity,
  getAvailabilityStatus,
  isLowStock,
  isOutOfStock,
  isBackorder,
  getRemainingStock,
} from './domain/product.availability';

export {
  // Pricing
  getEffectivePrice,
  getComparePrice,
  hasDiscount,
  getDiscountPercentage,
  getAbsoluteSaving,
  getPriceWithTax,
  getTaxAmount,
  getInstallmentAmount,
  getLineTotal,
  formatCOP,
  formatCOPWithDecimals,
  formatPriceNumber,
  formatPriceRange,
  isValidPrice,
  parsePrice,
  roundToMultiple,
} from './domain/product.pricing';

export {
  // Validators
  isValidProduct,
  hasValidImages,
  isValidSKU,
  isValidSlug,
  isValidComparePrice,
  hasValidCategories,
  filterValidProducts,
  generateSlug,
  isNewProduct,
} from './domain/product.validators';

// ─────────────────────────────────────────────
// REPOSITORY
// ─────────────────────────────────────────────

export { createProductsRepository } from './repository/products.repository';
export { normalizeProduct, normalizeProductList, normalizeError } from './repository/products.normalizer';

// ─────────────────────────────────────────────
// CACHE
// ─────────────────────────────────────────────

export { default as productCache } from './cache/product.cache';

// ─────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────

export { default as useProductsRepository } from './hooks/useProductsRepository';
export { default as useProductList } from './hooks/useProductList';
export { default as useProductDetail } from './hooks/useProductDetail';
export { default as useFeaturedProducts } from './hooks/useFeaturedProducts';
export { default as useProductStock } from './hooks/useProductStock';
export { useRelatedProducts } from './hooks/useProductStock';

export {
  default as useProductSearch,
  useProductSuggestions,
  useSearchHistory,
} from './hooks/useProductSearch';

export {
  default as useProductFilters,
  usePriceRange,
  useProductSort,
  useActiveFilterCount,
} from './hooks/useProductFilters';

// ─────────────────────────────────────────────
// INTEGRATION BRIDGES
// ─────────────────────────────────────────────

export { default as useProductCart } from './integration/useProductCart';
export { default as useProductWishlist } from './integration/useProductWishlist';

// ─────────────────────────────────────────────
// VALIDATION (admin forms)
// ─────────────────────────────────────────────

export {
  productSchema,
  productQuickCreateSchema,
  productUpdateSchema,
  productFilterSchema,
  validateProduct,
  validateProductImage,
} from './validation/product.schema';

// ─────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────

export {
  PRODUCT_STATUS,
  PRODUCT_VISIBILITY,
  AVAILABILITY_STATUS,
  SORT_ORDER,
  PRODUCT_SORT_OPTIONS,
  VALID_SORT_FIELDS,
  PAGINATION_LIMITS,
  STOCK_LIMITS,
  PRICE_LIMITS,
  TEXT_LIMITS,
  IMAGE_CONFIG,
  VALID_FILTERS,
  DEFAULT_QUERY_PARAMS,
  SEARCH_CONFIG,
  CACHE_CONFIG,
  VALIDATION_PATTERNS,
  AVAILABILITY_MESSAGES,
  AVAILABILITY_CLASSES,
  STATUS_LABELS,
  STATUS_BADGE_COLORS,
  CATEGORY_ICONS,
  NEW_PRODUCT_DAYS,
  WEIGHT_UNITS,
  DIMENSION_UNITS,
  RATING,
} from './types/product.types';

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────

export {
  getPrimaryImage,
  getAllImageUrls,
  getVariantImage,
} from './helper/product.image.helpers';