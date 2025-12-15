// src/hooks/useSearch.js
import { useState, useEffect, useCallback } from 'react';
import searchApi from '../api/searchApi';
import { toast } from 'react-toastify';

/**
 * @hook useSearch
 * @description Hook principal para búsquedas públicas y analytics
 * 
 * Maneja:
 * - Sugerencias en tiempo real
 * - Búsquedas populares
 * - Búsquedas en tendencia
 * - Cache de resultados
 * - Error handling
 */
const useSearch = () => {
  // Estados para suggestions
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Estados para popular
  const [popularSearches, setPopularSearches] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(false);

  // Estados para trending
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [loadingTrending, setLoadingTrending] = useState(false);

  // Cache simple
  const [cache, setCache] = useState({
    popular: null,
    trending: null
  });

  /**
   * Obtener sugerencias de búsqueda
   * Debounced desde el componente
   */
  const getSuggestions = useCallback(async (query, limit = 5) => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await searchApi.getSearchSuggestions(query, limit);
      setSuggestions(response.data || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      
      // Solo mostrar error si no es por input corto
      if (error.response?.status !== 400) {
        toast.error('Error al obtener sugerencias');
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
  }, []);

  /**
   * Obtener búsquedas populares
   */
  const getPopularSearches = useCallback(async (limit = 10, days = 30) => {
    // Revisar cache (5 minutos)
    const cacheKey = `popular_${limit}_${days}`;
    const cached = cache.popular;
    if (cached && cached.key === cacheKey && Date.now() - cached.timestamp < 300000) {
      setPopularSearches(cached.data);
      return;
    }

    setLoadingPopular(true);
    try {
      const response = await searchApi.getPopularSearches(limit, days);
      setPopularSearches(response.data || []);
      
      // Actualizar cache
      setCache(prev => ({
        ...prev,
        popular: {
          key: cacheKey,
          data: response.data || [],
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      toast.error('Error al cargar búsquedas populares');
      setPopularSearches([]);
    } finally {
      setLoadingPopular(false);
    }
  }, [cache.popular]);

  /**
   * Obtener búsquedas en tendencia
   */
  const getTrendingSearches = useCallback(async (limit = 10) => {
    // Revisar cache (5 minutos)
    const cacheKey = `trending_${limit}`;
    const cached = cache.trending;
    if (cached && cached.key === cacheKey && Date.now() - cached.timestamp < 300000) {
      setTrendingSearches(cached.data);
      return;
    }

    setLoadingTrending(true);
    try {
      const response = await searchApi.getTrendingSearches(limit);
      setTrendingSearches(response.data || []);
      
      // Actualizar cache
      setCache(prev => ({
        ...prev,
        trending: {
          key: cacheKey,
          data: response.data || [],
          timestamp: Date.now()
        }
      }));
    } catch (error) {
      console.error('Error fetching trending searches:', error);
      toast.error('Error al cargar tendencias');
      setTrendingSearches([]);
    } finally {
      setLoadingTrending(false);
    }
  }, [cache.trending]);

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
    
    // Trending
    trendingSearches,
    loadingTrending,
    getTrendingSearches
  };
};

export default useSearch;