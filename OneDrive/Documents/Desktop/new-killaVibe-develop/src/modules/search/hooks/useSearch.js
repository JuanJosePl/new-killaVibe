// src/hooks/useSearch.js
import { useState, useCallback, useRef } from 'react';
import searchApi from '../api/searchApi';
import { toast } from 'react-toastify';

/**
 * @hook useSearch
 * @description Hook principal para búsquedas públicas y analytics
 * ✅ CORREGIDO: Protección total contra rate limiting y loops
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
  
  // ✅ NUEVO: Control de rate limiting
  const lastPopularFetchRef = useRef(0);
  const lastTrendingFetchRef = useRef(0);
  const MIN_FETCH_INTERVAL = 3000; // 3 segundos mínimo entre llamadas

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
  // HELPER: VERIFICAR RATE LIMIT
  // ============================================================================
  const canFetch = useCallback((lastFetchTime) => {
    const timeSinceLastFetch = Date.now() - lastFetchTime;
    return timeSinceLastFetch >= MIN_FETCH_INTERVAL;
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
   * ✅ CORREGIDO: Con protección total contra rate limiting
   */
  const getPopularSearches = useCallback(async (limit = 10, days = 30) => {
    const cacheKey = `popular_${limit}_${days}`;

    // 1. Revisar caché válido
    if (isCacheValid(cache.popular, cacheKey)) {
      console.log('[useSearch] Usando caché para popular searches');
      setPopularSearches(cache.popular.data);
      return cache.popular.data;
    }

    // 2. Prevenir llamadas duplicadas
    if (fetchingPopular.current) {
      console.log('[useSearch] Popular searches already fetching, skipping...');
      return popularSearches;
    }

    // ✅ 3. NUEVO: Verificar rate limit temporal
    if (!canFetch(lastPopularFetchRef.current)) {
      console.log('[useSearch] Rate limit activo, usando datos en estado');
      return popularSearches;
    }

    fetchingPopular.current = true;
    setLoadingPopular(true);

    try {
      lastPopularFetchRef.current = Date.now(); // Actualizar timestamp
      
      const response = await searchApi.getPopularSearches(limit, days);
      const data = response.data || [];
      
      setPopularSearches(data);
      
      // Actualizar caché
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
        // No mostrar toast en modo silencioso
        console.warn('Error al cargar búsquedas populares');
      } else {
        console.warn('Rate limit alcanzado para búsquedas populares');
      }
      
      // ✅ No limpiar estado existente en caso de error
      return popularSearches;
    } finally {
      setLoadingPopular(false);
      fetchingPopular.current = false;
    }
  }, [cache.popular, isCacheValid, popularSearches, canFetch]);

  // ============================================================================
  // BÚSQUEDAS EN TENDENCIA
  // ============================================================================
  
  /**
   * Obtener búsquedas en tendencia
   * ✅ CORREGIDO: Con protección total contra rate limiting
   */
  const getTrendingSearches = useCallback(async (limit = 10) => {
    const cacheKey = `trending_${limit}`;

    // 1. Revisar caché válido
    if (isCacheValid(cache.trending, cacheKey)) {
      console.log('[useSearch] Usando caché para trending searches');
      setTrendingSearches(cache.trending.data);
      return cache.trending.data;
    }

    // 2. Prevenir llamadas duplicadas
    if (fetchingTrending.current) {
      console.log('[useSearch] Trending searches already fetching, skipping...');
      return trendingSearches;
    }

    // ✅ 3. NUEVO: Verificar rate limit temporal
    if (!canFetch(lastTrendingFetchRef.current)) {
      console.log('[useSearch] Rate limit activo, usando datos en estado');
      return trendingSearches;
    }

    fetchingTrending.current = true;
    setLoadingTrending(true);

    try {
      lastTrendingFetchRef.current = Date.now(); // Actualizar timestamp
      
      const response = await searchApi.getTrendingSearches(limit);
      const data = response.data || [];
      
      setTrendingSearches(data);
      
      // Actualizar caché
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
        // No mostrar toast en modo silencioso
        console.warn('Error al cargar tendencias');
      } else {
        console.warn('Rate limit alcanzado para tendencias');
      }
      
      // ✅ No limpiar estado existente en caso de error
      return trendingSearches;
    } finally {
      setLoadingTrending(false);
      fetchingTrending.current = false;
    }
  }, [cache.trending, isCacheValid, trendingSearches, canFetch]);

  // ============================================================================
  // UTILIDADES ADICIONALES
  // ============================================================================

  /**
   * Invalidar caché manualmente
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
    lastPopularFetchRef.current = 0; // Reset rate limit
    return getPopularSearches(limit, days);
  }, [invalidateCache, getPopularSearches]);

  const refreshTrending = useCallback(async (limit = 10) => {
    invalidateCache('trending');
    lastTrendingFetchRef.current = 0; // Reset rate limit
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