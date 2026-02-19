/**
 * @hook useProductFilters
 * @description Gestiona el estado de filtros con sincronización a URL.
 *
 * RESPONSABILIDAD: solo filtros y URL sync.
 * No hace fetch. No conoce productos.
 * Se usa en composición con useProductList.
 *
 * USO:
 *   const { filters, updateFilter, resetFilters } = useProductFilters();
 *   useEffect(() => { list.reload(filters); }, [filters]);
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_QUERY_PARAMS } from '../types/product.types';

/**
 * @param {Object} [initialFilters={}] - Filtros iniciales (se mezclan con DEFAULT_QUERY_PARAMS)
 * @returns {Object}
 */
export const useProductFilters = (initialFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Inicializar desde URL si existen params
  const [filters, setFilters] = useState(() => {
    const urlFilters = {};
    for (const [key, value] of searchParams.entries()) {
      urlFilters[key] = value;
    }
    return { ...DEFAULT_QUERY_PARAMS, ...initialFilters, ...urlFilters };
  });

  // Ref para comparar si los filtros realmente cambiaron (evitar sync innecesario)
  const prevFiltersRef = useRef(null);

  /**
   * Actualiza un filtro individual.
   * Resetea page a 1 si no es el campo page.
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value ?? 1),
    }));
  }, []);

  /**
   * Actualiza múltiples filtros a la vez.
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  /**
   * Limpia todos los filtros y vuelve a los defaults.
   */
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_QUERY_PARAMS, ...initialFilters });
  }, [initialFilters]);

  /**
   * Elimina un filtro específico (lo pone en undefined).
   */
  const clearFilter = useCallback((key) => {
    setFilters((prev) => {
      const next = { ...prev };
      delete next[key];
      return { ...DEFAULT_QUERY_PARAMS, ...next, page: 1 };
    });
  }, []);

  /**
   * Sincroniza filtros con URL (solo cuando cambian realmente).
   * No incluye setSearchParams en deps para evitar loop.
   */
  useEffect(() => {
    const serialized = JSON.stringify(filters);
    if (prevFiltersRef.current === serialized) return;
    prevFiltersRef.current = serialized;

    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    setSearchParams(params, { replace: true });
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
  };
};

// ─────────────────────────────────────────────
// HOOKS AUXILIARES
// ─────────────────────────────────────────────

/**
 * @hook usePriceRange
 * @description Gestiona el rango de precios con debounce.
 */
export const usePriceRange = (min = 0, max = 3_000_000, debounceMs = 500) => {
  const [range, setRange] = useState([min, max]);
  const [debouncedRange, setDebouncedRange] = useState([min, max]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRange(range), debounceMs);
    return () => clearTimeout(timer);
  }, [range, debounceMs]);

  const updateRange = useCallback((newRange) => setRange(newRange), []);

  const resetRange = useCallback(() => {
    setRange([min, max]);
    setDebouncedRange([min, max]);
  }, [min, max]);

  return { range, debouncedRange, updateRange, resetRange };
};

/**
 * @hook useProductSort
 * @description Gestiona el ordenamiento con cambio automático de dirección.
 */
export const useProductSort = (defaultSort = 'createdAt', defaultOrder = 'desc') => {
  const [sort, setSort] = useState(defaultSort);
  const [order, setOrder] = useState(defaultOrder);

  const updateSort = useCallback((newSort) => {
    setSort(newSort);
    setOrder(newSort === 'price' || newSort === 'name' ? 'asc' : 'desc');
  }, []);

  const toggleOrder = useCallback(() => {
    setOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  const resetSort = useCallback(() => {
    setSort(defaultSort);
    setOrder(defaultOrder);
  }, [defaultSort, defaultOrder]);

  return { sort, order, updateSort, toggleOrder, resetSort };
};

/**
 * @hook useActiveFilterCount
 * @description Cuenta cuántos filtros no-default están activos.
 */
export const useActiveFilterCount = (filters) => {
  const count =
    (filters.category ? 1 : 0) +
    (filters.search ? 1 : 0) +
    (filters.minPrice && filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.brand ? 1 : 0);

  return count;
};

export default useProductFilters;