import { useState, useEffect, useCallback, useRef } from 'react';
import * as productsApi from '../api/products.api';
import { SEARCH_CONFIG } from '../types/product.types';

/**
 * @hook useProductSearch
 * @description Hook para búsqueda de productos con debounce
 * @param {number} debounceMs - Tiempo de debounce en ms
 * @returns {Object}
 */
export const useProductSearch = (debounceMs = SEARCH_CONFIG.DEBOUNCE_MS) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  // Debounce del query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Realizar búsqueda cuando cambia el debouncedQuery
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    const searchProducts = async () => {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);

        const response = await productsApi.searchProducts(
          debouncedQuery.trim(),
          SEARCH_CONFIG.DEFAULT_LIMIT
        );

        if (response.success) {
          setResults(response.data || []);
        } else {
          setError(response.message);
          setResults([]);
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Search error:', err);
          setError(err.response?.data?.message || 'Error en la búsqueda');
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    searchProducts();

    // Cleanup
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedQuery]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
    hasResults: results.length > 0,
    isSearching: query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH
  };
};

/**
 * @hook useSearchHistory
 * @description Hook para manejo de historial de búsqueda
 * @param {number} maxItems - Máximo de items en historial
 * @returns {Object}
 */
export const useSearchHistory = (maxItems = 10) => {
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('search_history');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = useCallback((query) => {
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) return;

    setHistory(prev => {
      const newHistory = [query, ...prev.filter(q => q !== query)].slice(0, maxItems);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, [maxItems]);

  const removeFromHistory = useCallback((query) => {
    setHistory(prev => {
      const newHistory = prev.filter(q => q !== query);
      localStorage.setItem('search_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('search_history');
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};

/**
 * @hook useSearchSuggestions
 * @description Hook para obtener sugerencias de búsqueda
 * @returns {Object}
 */
export const useSearchSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      // Aquí puedes implementar la lógica de sugerencias
      // Por ahora, usaremos búsqueda básica
      const response = await productsApi.searchProducts(query.trim(), 5);

      if (response.success) {
        const productSuggestions = response.data.map(p => ({
          type: 'product',
          text: p.name,
          slug: p.slug,
          image: p.images?.[0]?.url
        }));
        
        setSuggestions(productSuggestions);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    fetchSuggestions
  };
};