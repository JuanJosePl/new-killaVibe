/**
 * @hook useCategories
 * @description Hook de lectura de categorías.
 *
 * Consume el store Zustand. No contiene lógica de negocio.
 * Expone datos ya normalizados (CategoryEntity[]).
 *
 * @param {Object} options
 * @param {boolean} options.autoFetch  - Fetch al montar (default: true)
 * @param {boolean} options.featured   - Filtrar destacadas
 * @param {boolean} options.parentOnly - Filtrar sólo raíz
 * @param {string}  options.sortBy     - 'order'|'name'|'newest'|'views'|'productCount'
 * @param {number}  options.page       - Página
 * @param {number}  options.pageSize   - Items por página
 */

import { useEffect, useCallback, useMemo } from 'react';
import {
  useCategoriesStore,
  selectCategories,
  selectPagination,
  selectListLoading,
  selectListError,
  selectIsEmpty,
} from '../store/categories.store.js';
import { filterCategories, sortCategories } from '../../utils/categoryHelpers.js';

const useCategories = (options = {}) => {
  const {
    autoFetch  = true,
    featured   = false,
    parentOnly = false,
    sortBy     = 'order',
    page       = 1,
    pageSize   = 50,
    searchTerm = '',
  } = options;

  // Store
  const categories      = useCategoriesStore(selectCategories);
  const pagination      = useCategoriesStore(selectPagination);
  const loading         = useCategoriesStore(selectListLoading);
  const error           = useCategoriesStore(selectListError);
  const isEmpty         = useCategoriesStore(selectIsEmpty);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const searchAction    = useCategoriesStore((s) => s.searchCategories);
  const setPage         = useCategoriesStore((s) => s.setPage);

  const params = useMemo(() => ({
    featured,
    parentOnly,
    sortBy,
    page,
    limit : pageSize,
    withProductCount: true,
  }), [featured, parentOnly, sortBy, page, pageSize]);

  // Auto-fetch al montar o cuando cambien los parámetros
  useEffect(() => {
    if (autoFetch) {
      fetchCategories(params);
    }
  }, [autoFetch, fetchCategories, params]);

  // Filtrado local por término de búsqueda (complementario al backend)
  const filteredCategories = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return categories;
    return filterCategories(categories, searchTerm);
  }, [categories, searchTerm]);

  // Búsqueda contra el backend
  const search = useCallback(async (query) => {
    return searchAction(query);
  }, [searchAction]);

  // Refrescar con force
  const refresh = useCallback(() => {
    return fetchCategories(params, true);
  }, [fetchCategories, params]);

  // Paginación
  const goToPage = useCallback((p) => setPage(p), [setPage]);

  const nextPage = useCallback(() => {
    if (pagination.hasMore) setPage(pagination.page + 1);
  }, [pagination, setPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrev) setPage(pagination.page - 1);
  }, [pagination, setPage]);

  return {
    // Data
    categories        : filteredCategories,
    allCategories     : categories,        // sin filtro local
    count             : filteredCategories.length,
    isEmpty,

    // Pagination
    pagination,
    hasMore           : pagination.hasMore,
    hasPrev           : pagination.hasPrev,
    goToPage,
    nextPage,
    prevPage,

    // Loading
    loading,
    error,

    // Actions
    fetchCategories,
    search,
    refresh,
  };
};

export default useCategories;