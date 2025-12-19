// src/hooks/useSearch.js
import { useState, useCallback, useRef } from 'react';
import searchApi from '../api/searchApi';
import { toast } from 'react-toastify';

/**
 * @hook useSearch
 * @description Hook principal para búsquedas públicas y analytics
 * ✅ Optimizado para evitar rate limiting y loops infinitos
 * 
 * Maneja:
 * - Sugerencias en tiempo real
 * - Búsquedas populares
 * - Búsquedas en tendencia
 * - Cache de resultados
 * - Error handling robusto
 */
const useSearch = () => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  // Estados para suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Estados para popular
  const [popularSearches, setPopularSearches] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  // Estados para trending
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // ============================================================================
  // REFS PARA PREVENIR LLAMADAS DUPLICADAS
  // ============================================================================
  const fetchingPopular = useRef(false);
  const fetchingTrending = useRef(false);
  const abortControllerRef = useRef(null);

  // Cache mejorado con timestamps y keys
  const [cache, setCache] = useState({
    popular: { data: null, timestamp: null, key: null },
    trending: { data: null, timestamp: null, key: null }
  });

  // ============================================================================
  // HELPER: VALIDAR CACHE
  // ============================================================================
  const isCacheValid = useCallback((cacheEntry, cacheKey, ttl = 300000) => {
    if (!cacheEntry || !cacheEntry.data || !cacheEntry.timestamp) return false;
    if (cacheEntry.key !== cacheKey) return false;
    return Date.now() - cacheEntry.timestamp < ttl;
  }, []);

  // ============================================================================
  // SUGERENCIAS DE BÚSQUEDA
  // ============================================================================
  
  /**
   * Obtener sugerencias de búsqueda
   * Debounced desde el componente
   */
  const getSuggestions = useCallback(async (query, limit = 5) => {
    // Validación de entrada
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();

    setLoadingSuggestions(true);
    
    try {
      const response = await searchApi.getSearchSuggestions(
        query, 
        limit,
        { signal: abortControllerRef.current.signal }
      );
      
      setSuggestions(response.data || []);
    } catch (error) {
      // Ignorar errores de abort
      if (error.name === 'AbortError' || error.name === 'CanceledError') {
        return;
      }

      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      
      // Solo mostrar error si no es por input corto o cancelación
      if (error.response?.status !== 400 && error.response?.status !== 429) {
        // No mostrar toast para suggestions, solo log
        console.warn('Error al obtener sugerencias');
      }
    } finally {
      setLoadingSuggestions(false);
    }
  }, []);

  /**
   * Limpiar sugerencias
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    
    // Cancelar petición en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // ============================================================================
  // BÚSQUEDAS POPULARES
  // ============================================================================
  
  /**
   * Obtener búsquedas populares
   * ✅ Con protección contra llamadas duplicadas
   */
  const getPopularSearches = useCallback(async (limit = 10, days = 30) => {
    const cacheKey = `popular_${limit}_${days}`;

    // 1. Revisar cache válido
    if (isCacheValid(cache.popular, cacheKey)) {
      setPopularSearches(cache.popular.data);
      return cache.popular.data;
    }

    // 2. Prevenir llamadas duplicadas
    if (fetchingPopular.current) {
      console.log('[useSearch] Popular searches already fetching, skipping...');
      return popularSearches;
    }

    fetchingPopular.current = true;
    setLoadingPopular(true);

    try {
      const response = await searchApi.getPopularSearches(limit, days);
      const data = response.data || [];
      
      setPopularSearches(data);
      
      // Actualizar cache
      setCache(prev => ({
        ...prev,
        popular: {
          key: cacheKey,
          data: data,
          timestamp: Date.now()
        }
      }));

      return data;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      
      // Solo mostrar toast si no es rate limit (429)
      if (error.response?.status !== 429) {
        toast.error('Error al cargar búsquedas populares');
      } else {
        console.warn('Rate limit alcanzado para búsquedas populares');
      }
      
      setPopularSearches([]);
      return [];
    } finally {
      setLoadingPopular(false);
      fetchingPopular.current = false;
    }
  }, [cache.popular, isCacheValid, popularSearches]);

  // ============================================================================
  // BÚSQUEDAS EN TENDENCIA
  // ============================================================================
  
  /**
   * Obtener búsquedas en tendencia
   * ✅ Con protección contra llamadas duplicadas
   */
  const getTrendingSearches = useCallback(async (limit = 10) => {
    const cacheKey = `trending_${limit}`;

    // 1. Revisar cache válido
    if (isCacheValid(cache.trending, cacheKey)) {
      setTrendingSearches(cache.trending.data);
      return cache.trending.data;
    }

    // 2. Prevenir llamadas duplicadas
    if (fetchingTrending.current) {
      console.log('[useSearch] Trending searches already fetching, skipping...');
      return trendingSearches;
    }

    fetchingTrending.current = true;
    setLoadingTrending(true);

    try {
      const response = await searchApi.getTrendingSearches(limit);
      const data = response.data || [];
      
      setTrendingSearches(data);
      
      // Actualizar cache
      setCache(prev => ({
        ...prev,
        trending: {
          key: cacheKey,
          data: data,
          timestamp: Date.now()
        }
      }));

      return data;
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      
      // Solo mostrar toast si no es rate limit (429)
      if (error.response?.status !== 429) {
        toast.error('Error al cargar tendencias');
      } else {
        console.warn('Rate limit alcanzado para tendencias');
      }
      
      setTrendingSearches([]);
      return [];
    } finally {
      setLoadingTrending(false);
      fetchingTrending.current = false;
    }
  }, [cache.trending, isCacheValid, trendingSearches]);

  // ============================================================================
  // UTILIDADES ADICIONALES
  // ============================================================================

  /**
   * Invalidar cache manualmente
   */
  const invalidateCache = useCallback((type) => {
    if (type === 'popular') {
      setCache(prev => ({
        ...prev,
        popular: { data: null, timestamp: null, key: null }
      }));
    } else if (type === 'trending') {
      setCache(prev => ({
        ...prev,
        trending: { data: null, timestamp: null, key: null }
      }));
    } else {
      // Invalidar todo
      setCache({
        popular: { data: null, timestamp: null, key: null },
        trending: { data: null, timestamp: null, key: null }
      });
    }
  }, []);

  /**
   * Refrescar datos forzando nueva petición
   */
  const refreshPopular = useCallback(async (limit = 10, days = 30) => {
    invalidateCache('popular');
    return getPopularSearches(limit, days);
  }, [invalidateCache, getPopularSearches]);

  const refreshTrending = useCallback(async (limit = 10) => {
    invalidateCache('trending');
    return getTrendingSearches(limit);
  }, [invalidateCache, getTrendingSearches]);

  // ============================================================================
  // CLEANUP
  // ============================================================================
  
  /**
   * Limpiar recursos al desmontar
   */
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    fetchingPopular.current = false;
    fetchingTrending.current = false;
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================
  
  return {
    // Suggestions
    suggestions,
    loadingSuggestions,
    getSuggestions,
    clearSuggestions,
    
    // Popular
    popularSearches,
    loadingPopular,
    getPopularSearches,
    refreshPopular,
    
    // Trending
    trendingSearches,
    loadingTrending,
    getTrendingSearches,
    refreshTrending,

    // Utilities
    invalidateCache,
    cleanup
  };
};

export default useSearch;