/**
 * @module categories
 * @description Barrel público del módulo Categories.
 *
 * Exporta únicamente lo que otras partes de la app necesitan consumir.
 * El resto del módulo es privado e interno.
 *
 * ─── Uso desde fuera del módulo ───────────────────────────────────
 *
 * import {
 *   // Hooks de presentación
 *   useCategories,
 *   useCategoryActions,
 *   useCategorySEO,
 *   useCategoryTree,
 *
 *   // Componentes
 *   CategoryCard,
 *
 *   // Páginas
 *   CategoriesPage,
 *   CategoryDetailPage,
 *
 *   // Store (para suscripciones directas)
 *   useCategoriesStore,
 *
 *   // Entidad (para tipado o instanceof)
 *   CategoryEntity,
 * } from 'modules/categories';
 */

/* ── Hooks ──────────────────────────────────────────────────────── */
export { default as useCategories }      from './presentation/hooks/useCategories.js';
export { default as useCategoryActions } from './presentation/hooks/useCategoryActions.js';
export { default as useCategorySEO }     from './presentation/hooks/useCategorySEO.js';
export { default as useCategoryTree }    from './presentation/hooks/useCategoryTree.js';

/* ── Store ──────────────────────────────────────────────────────── */
export {
  useCategoriesStore,
  // Selectores atómicos (útiles para suscripciones externas)
  selectCategories,
  selectTree,
  selectFlatList,
  selectFeatured,
  selectPopular,
  selectSelectedCategory,
  selectPagination,
  selectListLoading,
  selectDetailLoading,
  selectActionLoading,
  selectListError,
  selectDetailError,
  selectActionError,
  selectIsEmpty,
  selectHasTree,
  selectHasFeatured,
  selectHasPopular,
  selectInitialized,
} from './presentation/store/categories.store.js';

/* ── Componentes ─────────────────────────────────────────────────── */
export { default as CategoryCard } from './presentation/components/CategoryCard.jsx';

/* ── Páginas ─────────────────────────────────────────────────────── */
export { default as CategoriesPage }     from './pages/CategoriesPage.jsx';
export { default as CategoryDetailPage } from './pages/CategoryDetailPage.jsx';

/* ── Dominio (para tipado o guards) ─────────────────────────────── */
export { CategoryEntity }          from './domain/category.entity.js';
export { CategoryTreeNode, CategoryPagination, CategorySEOContext } from './domain/category.model.js';
export * from './domain/category.errors.js';

/* ── Utilidades de UI ────────────────────────────────────────────── */
export {
  formatProductCount,
  formatViews,
  formatCreatedAt,
  filterCategories,
  sortCategories,
  generateSlug,
  getStatusColor,
  getStatusText,
} from './utils/categoryHelpers.js';