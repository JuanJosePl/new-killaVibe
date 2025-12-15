import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  getCategories,
  getCategoryTree,
  getFeaturedCategories,
  getPopularCategories,
} from '../api/categories.api';

/**
 * @context CategoriesContext
 * @description Context global para categorías con cache agresivo
 * 
 * CARACTERÍSTICAS:
 * - Cache global de 10 minutos (categorías cambian poco)
 * - Árbol jerárquico pre-cargado
 * - Categorías featured/popular pre-cargadas
 * - Sincronización automática
 */

const CategoriesContext = createContext(null);

/**
 * Configuración de cache
 */
const CACHE_CONFIG = {
  TTL: 10 * 60 * 1000, // 10 minutos
};

export const CategoriesProvider = ({ children }) => {
  const [state, setState] = useState({
    categories: [],
    tree: [],
    featured: [],
    popular: [],
    loading: false,
    error: null,
    initialized: false,
  });

  // Cache
  const cache = useRef({
    categories: { data: null, timestamp: null },
    tree: { data: null, timestamp: null },
    featured: { data: null, timestamp: null },
    popular: { data: null, timestamp: null },
  });

  /**
   * Verificar si cache es válido
   */
  const isCacheValid = useCallback((cacheKey) => {
    const cached = cache.current[cacheKey];
    if (!cached.data || !cached.timestamp) return false;

    const elapsed = Date.now() - cached.timestamp;
    return elapsed < CACHE_CONFIG.TTL;
  }, []);

  /**
   * Actualizar cache
   */
  const updateCache = useCallback((cacheKey, data) => {
    cache.current[cacheKey] = {
      data,
      timestamp: Date.now(),
    };
  }, []);

  /**
   * Obtener categorías
   */
  const fetchCategories = useCallback(async (params = {}, forceRefresh = false) => {
    const cacheKey = 'categories';

    if (!forceRefresh && isCacheValid(cacheKey)) {
      setState((prev) => ({
        ...prev,
        categories: cache.current[cacheKey].data,
      }));
      return cache.current[cacheKey].data;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getCategories(params);
      const data = response.data;

      updateCache(cacheKey, data);
      setState((prev) => ({
        ...prev,
        categories: data,
        loading: false,
      }));

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar categorías';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw err;
    }
  }, [isCacheValid, updateCache]);

  /**
   * Obtener árbol de categorías
   */
  const fetchTree = useCallback(async (forceRefresh = false) => {
    const cacheKey = 'tree';

    if (!forceRefresh && isCacheValid(cacheKey)) {
      setState((prev) => ({
        ...prev,
        tree: cache.current[cacheKey].data,
      }));
      return cache.current[cacheKey].data;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await getCategoryTree();
      const data = response.data;

      updateCache(cacheKey, data);
      setState((prev) => ({
        ...prev,
        tree: data,
        loading: false,
      }));

      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al cargar árbol';
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      throw err;
    }
  }, [isCacheValid, updateCache]);

  /**
   * Obtener categorías destacadas
   */
  const fetchFeatured = useCallback(async (limit = 6, forceRefresh = false) => {
    const cacheKey = 'featured';

    if (!forceRefresh && isCacheValid(cacheKey)) {
      setState((prev) => ({
        ...prev,
        featured: cache.current[cacheKey].data,
      }));
      return cache.current[cacheKey].data;
    }

    try {
      const response = await getFeaturedCategories(limit);
      const data = response.data;

      updateCache(cacheKey, data);
      setState((prev) => ({
        ...prev,
        featured: data,
      }));

      return data;
    } catch (err) {
      console.error('[CategoriesContext] Error fetching featured:', err);
      throw err;
    }
  }, [isCacheValid, updateCache]);

  /**
   * Obtener categorías populares
   */
  const fetchPopular = useCallback(async (limit = 10, forceRefresh = false) => {
    const cacheKey = 'popular';

    if (!forceRefresh && isCacheValid(cacheKey)) {
      setState((prev) => ({
        ...prev,
        popular: cache.current[cacheKey].data,
      }));
      return cache.current[cacheKey].data;
    }

    try {
      const response = await getPopularCategories(limit);
      const data = response.data;

      updateCache(cacheKey, data);
      setState((prev) => ({
        ...prev,
        popular: data,
      }));

      return data;
    } catch (err) {
      console.error('[CategoriesContext] Error fetching popular:', err);
      throw err;
    }
  }, [isCacheValid, updateCache]);

  /**
   * Inicializar datos críticos
   */
  const initialize = useCallback(async () => {
    if (state.initialized) return;

    setState((prev) => ({ ...prev, loading: true }));

    try {
      await Promise.all([
        fetchTree(),
        fetchFeatured(),
      ]);

      setState((prev) => ({
        ...prev,
        initialized: true,
        loading: false,
      }));
    } catch (err) {
      console.error('[CategoriesContext] Initialization error:', err);
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  }, [state.initialized, fetchTree, fetchFeatured]);

  /**
   * Refrescar todos los caches
   */
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchCategories({}, true),
      fetchTree(true),
      fetchFeatured(6, true),
      fetchPopular(10, true),
    ]);
  }, [fetchCategories, fetchTree, fetchFeatured, fetchPopular]);

  /**
   * Limpiar todos los caches
   */
  const clearAllCache = useCallback(() => {
    cache.current = {
      categories: { data: null, timestamp: null },
      tree: { data: null, timestamp: null },
      featured: { data: null, timestamp: null },
      popular: { data: null, timestamp: null },
    };
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-inicializar al montar
  useEffect(() => {
    initialize();
  }, [initialize]);

  const value = {
    // State
    categories: state.categories,
    tree: state.tree,
    featured: state.featured,
    popular: state.popular,
    loading: state.loading,
    error: state.error,
    initialized: state.initialized,

    // Computed
    isEmpty: state.categories.length === 0,
    hasTree: state.tree.length > 0,
    hasFeatured: state.featured.length > 0,
    hasPopular: state.popular.length > 0,

    // Actions
    fetchCategories,
    fetchTree,
    fetchFeatured,
    fetchPopular,
    refreshAll,
    clearAllCache,
    clearError,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

/**
 * Hook para usar el contexto
 */
export const useCategoriesContext = () => {
  const context = useContext(CategoriesContext);
  
  if (!context) {
    throw new Error('useCategoriesContext debe usarse dentro de CategoriesProvider');
  }
  
  return context;
};

export default CategoriesContext;