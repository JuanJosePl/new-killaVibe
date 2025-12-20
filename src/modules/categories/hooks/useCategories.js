import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategories, searchCategories } from '../api/categories.api';

/**
 * @hook useCategories
 * @description Hook principal para gestionar categorías con cache y filtros
 * 
 * CARACTERÍSTICAS:
 * - Cache en memoria (5 min TTL)
 * - Filtros avanzados
 * - Paginación
 * - Búsqueda
 * - Auto-refresh
 * 
 * @param {Object} options - Opciones del hook
 * @param {boolean} options.featured - Solo categorías destacadas
 * @param {boolean} options.parentOnly - Solo categorías raíz
 * @param {boolean} options.withProductCount - Incluir conteo de productos
 * @param {string} options.sortBy - 'order'|'newest'|'views'|'name'|'productCount'
 * @param {number} options.initialPage - Página inicial
 * @param {number} options.pageSize - Items por página
 * @param {boolean} options.autoFetch - Auto fetch al montar (default: true)
 * @param {number} options.cacheTTL - TTL del cache en ms (default: 5min)
 * 
 * @returns {Object} Estado y métodos
 */
const useCategories = (options = {}) => {
  const {
    featured = false,
    parentOnly = false,
    withProductCount = false,
    sortBy = 'order',
    initialPage = 1,
    pageSize = 50,
    autoFetch = true,
    cacheTTL = 5 * 60 * 1000, // 5 minutos
  } = options;

  // Estado
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: pageSize,
    total: 0,
    pages: 0,
  });

  // Cache
  const cache = useRef({
    data: null,
    timestamp: null,
    key: null,
  });

  /**
   * Genera clave de cache basada en params
   */
  const getCacheKey = useCallback((params) => {
    return JSON.stringify({
      featured: params.featured,
      parentOnly: params.parentOnly,
      withProductCount: params.withProductCount,
      sortBy: params.sortBy,
      page: params.page,
      limit: params.limit,
    });
  }, []);

  /**
   * Verifica si el cache es válido
   */
  const isCacheValid = useCallback((key) => {
    if (!cache.current.data || !cache.current.timestamp) {
      return false;
    }

    if (cache.current.key !== key) {
      return false;
    }

    const now = Date.now();
    const elapsed = now - cache.current.timestamp;

    return elapsed < cacheTTL;
  }, [cacheTTL]);

  /**
   * Actualiza el cache
   */
  const updateCache = useCallback((key, data) => {
    cache.current = {
      data,
      timestamp: Date.now(),
      key,
    };
  }, []);

  /**
   * Limpia el cache
   */
  const clearCache = useCallback(() => {
    cache.current = {
      data: null,
      timestamp: null,
      key: null,
    };
  }, []);

  /**
   * Obtener categorías con cache
   */
  const fetchCategories = useCallback(async (params = {}, forceRefresh = false) => {
    const queryParams = {
      featured: params.featured ?? featured,
      parentOnly: params.parentOnly ?? parentOnly,
      withProductCount: params.withProductCount ?? withProductCount,
      sortBy: params.sortBy ?? sortBy,
      page: params.page ?? pagination.page,
      limit: params.limit ?? pagination.limit,
    };

    const cacheKey = getCacheKey(queryParams);

    // Usar cache si es válido y no es force refresh
    if (!forceRefresh && isCacheValid(cacheKey)) {
      const cached = cache.current.data;
      setCategories(cached.data);
      setPagination(cached.pagination);
      return cached;
    }

    setLoading(true);
    setError(null);

try {
  const response = await getCategories(queryParams);
  // console.log("Respuesta de la API:", response); // Revisa esto en la consola
  
  const dataArray = Array.isArray(response) ? response : (response?.data || []);

  // SOLUCIÓN: Asegurar que data y pagination tengan valores por defecto
  const result = {
    data: dataArray, 
    pagination: response?.pagination || { 
      page: queryParams.page, 
      limit: queryParams.limit, 
      total: dataArray.length, 
      pages: 1 
    },
  };

  setCategories(result.data);
  setPagination(result.pagination);
  updateCache(cacheKey, result);

  return result;
} catch (err) {
  // Si hay error, mantenemos la paginación coherente para que el componente no rompa
  setCategories([]); 
  // No dejes la paginación como undefined
 setError(err.message || 'Error al obtener categorías');
  // Es recomendable no relanzar el error (throw err) si quieres que 
  // la UI lo maneje mediante el estado 'error'
} finally {
  // ESTO ES LO MÁS IMPORTANTE: Desbloquea el estado de carga siempre.
  setLoading(false);
}
  }, [
    featured,
    parentOnly,
    withProductCount,
    sortBy,
    pagination.page,
    pagination.limit,
    getCacheKey,
    isCacheValid,
    updateCache,
  ]);

  /**
   * Cambiar página
   */
  const goToPage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  /**
   * Página siguiente
   */
  const nextPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.page < prev.pages) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  /**
   * Página anterior
   */
  const prevPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.page > 1) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

  /**
   * Refrescar datos
   */
  const refresh = useCallback(() => {
    return fetchCategories({}, true);
  }, [fetchCategories]);

  /**
   * Buscar categorías
   */
  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setError('El término de búsqueda debe tener al menos 2 caracteres');
      return;
    }

    setLoading(true);

    try {
      const response = await searchCategories(query);

      const results = Array.isArray(response) ? response : (response?.data || []);

      setCategories(results);
      setPagination({
        page: 1,
        limit: results.length,
        total: results.length,
        pages: 1,
      });
      return results;
    } catch (err) {
      setError(err.message || 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reiniciar filtros
   */
  const resetFilters = useCallback(() => {
    clearCache();
    setPagination({
      page: 1,
      limit: pageSize,
      total: 0,
      pages: 0,
    });
  }, [clearCache, pageSize]);

  // Auto fetch al montar o cuando cambie la página
  useEffect(() => {
    if (autoFetch) {
      fetchCategories();
    }
  }, [pagination.page, autoFetch, fetchCategories]); // Solo re-fetch cuando cambia la página

  // Computed values
  const isEmpty = categories.length === 0;
  const hasMore = pagination.page < pagination.pages;
  const hasPrev = pagination.page > 1;
  const count = categories.length;

  return {
    // Data
    categories,
    category: categories[0] || null, // Primera categoría (útil para single fetch)
    count,
    
    // Loading states
    loading,
    error,
    isEmpty,
    
    // Pagination
    pagination,
    hasMore,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    
    // Actions
    fetchCategories,
    search,
    refresh,
    resetFilters,
    clearCache,
    setError,
  };
};

export default useCategories;