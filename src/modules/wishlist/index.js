/**
 * @module wishlist
 * @description API pública del módulo Wishlist.
 *
 * Todo lo que los componentes y módulos externos necesitan importar
 * viene de aquí. Nada se importa directamente desde subcarpetas.
 *
 * PRINCIPIO: Si no está exportado aquí, es un detalle de implementación interno.
 *
 * @example
 * // ✅ Correcto
 * import { useWishlist, useWishlistActions } from '@/modules/wishlist';
 *
 * // ❌ Incorrecto (acoplamiento a implementación interna)
 * import useWishlist from '@/modules/wishlist/hooks/useWishlist';
 */

// ============================================================================
// HOOKS (API principal para componentes)
// ============================================================================

export { default as useWishlist }        from './hooks/useWishlist';
export { default as useWishlistActions } from './hooks/useWishlistActions';
export { default as useWishlistSync }    from './hooks/useWishlistSync';

// ============================================================================
// STORE (para acceso directo si se necesita fuera de React, ej: middleware de auth)
// ============================================================================

export { useWishlistStore, wishlistSelectors } from './store/wishlist.store';

// ============================================================================
// DOMAIN (para typing y constantes — no lógica)
// ============================================================================

export { WishlistMode, SyncStatus } from './domain/wishlist.model';
export {
  WishlistError,
  WishlistDuplicateError,
  WishlistNotFoundError,
  WishlistValidationError,
  WishlistSyncError,
  WishlistModeError,
  WishlistNetworkError,
} from './domain/wishlist.errors';

// ============================================================================
// SCHEMA YUP (para formularios)
// ============================================================================

export {
  addItemSchema,
  moveToCartSchema,
  validateAddItem,
  validateMoveToCart,
  getValidationErrors,
} from './validation/wishlist.schema';

// ============================================================================
// REPOSITORY (para casos avanzados: SSR, testing, inicialización manual)
// ============================================================================

export { wishlistRepository } from './repository/wishlist.repository';

// PAGES
export { default as WishlistPage } from './pages/WishlistPage';

// COMPONENTS reutilizables fuera del módulo
export { default as WishlistButton }     from './components/WishlistButton';
export { default as WishlistEmptyState } from './components/WishlistEmptyState';