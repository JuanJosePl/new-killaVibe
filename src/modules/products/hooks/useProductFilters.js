import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_QUERY_PARAMS } from '../types/product.types';

/**
 * @hook useProductFilters
 * @description Hook para manejo de filtros de productos con sincronización URL
 * @returns {Object} { filters, updateFilter, clearFilters, resetFilters }
 */
export const useProductFilters = (initialFilters = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState(() => {
    // Inicializar desde URL params si existen
    const urlFilters = {};
    
    for (const [key, value] of searchParams.entries()) {
      urlFilters[key] = value;
    }
    
    return {
      ...DEFAULT_QUERY_PARAMS,
      ...initialFilters,
      ...urlFilters
    };
  });

  /**
   * Actualiza un filtro específico
   */
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => {
      const newFilters = {
        ...prev,
        [key]: value
      };
      
      // Si cambia algún filtro (excepto page), resetear página a 1
      if (key !== 'page') {
        newFilters.page = 1;
      }
      
      return newFilters;
    });
  }, []);

  /**
   * Actualiza múltiples filtros a la vez
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1
    }));
  }, []);

  /**
   * Limpia todos los filtros excepto los básicos
   */
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_QUERY_PARAMS);
  }, []);

  /**
   * Resetea a filtros iniciales
   */
  const resetFilters = useCallback(() => {
    setFilters({
      ...DEFAULT_QUERY_PARAMS,
      ...initialFilters
    });
  }, [initialFilters]);

  /**
   * Sincroniza filtros con URL
   */
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });
    
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  return {
    filters,
    updateFilter,
    updateFilters,
    clearFilters,
    resetFilters
  };
};

/**
 * @hook usePriceRange
 * @description Hook para manejo de rango de precios
 * @param {number} min
 * @param {number} max
 * @returns {Object}
 */
export const usePriceRange = (min = 0, max = 300000) => {
  const [priceRange, setPriceRange] = useState([min, max]);
  const [debouncedRange, setDebouncedRange] = useState([min, max]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRange(priceRange);
    }, 500);

    return () => clearTimeout(timer);
  }, [priceRange]);

  const updateRange = useCallback((newRange) => {
    setPriceRange(newRange);
  }, []);

  const resetRange = useCallback(() => {
    setPriceRange([min, max]);
    setDebouncedRange([min, max]);
  }, [min, max]);

  return {
    priceRange,
    debouncedRange,
    updateRange,
    resetRange
  };
};

/**
 * @hook useProductSort
 * @description Hook para manejo de ordenamiento
 * @param {string} defaultSort
 * @param {string} defaultOrder
 * @returns {Object}
 */
export const useProductSort = (defaultSort = 'createdAt', defaultOrder = 'desc') => {
  const [sort, setSort] = useState(defaultSort);
  const [order, setOrder] = useState(defaultOrder);

  const updateSort = useCallback((newSort) => {
    setSort(newSort);
    
    // Cambiar orden automáticamente para ciertos campos
    if (newSort === 'price' || newSort === 'name') {
      setOrder('asc');
    } else {
      setOrder('desc');
    }
  }, []);

  const toggleOrder = useCallback(() => {
    setOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const resetSort = useCallback(() => {
    setSort(defaultSort);
    setOrder(defaultOrder);
  }, [defaultSort, defaultOrder]);

  return {
    sort,
    order,
    updateSort,
    toggleOrder,
    resetSort
  };
};

/**
 * @hook useCategoryFilter
 * @description Hook para manejo de filtros de categoría
 * @returns {Object}
 */
export const useCategoryFilter = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = useCallback((categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  }, []);

  const clearCategories = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  const isSelected = useCallback((categoryId) => {
    return selectedCategories.includes(categoryId);
  }, [selectedCategories]);

  return {
    selectedCategories,
    toggleCategory,
    clearCategories,
    isSelected
  };
};

/**
 * @hook useFilterCount
 * @description Hook para contar filtros activos
 * @param {Object} filters
 * @returns {number}
 */
export const useFilterCount = (filters) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let activeCount = 0;
    
    // Contar solo filtros que no son defaults
    if (filters.category) activeCount++;
    if (filters.search) activeCount++;
    if (filters.minPrice && filters.minPrice > 0) activeCount++;
    if (filters.maxPrice && filters.maxPrice < 300000) activeCount++;
    if (filters.featured) activeCount++;
    if (filters.inStock) activeCount++;
    if (filters.brand) activeCount++;
    
    setCount(activeCount);
  }, [filters]);

  return count;
};