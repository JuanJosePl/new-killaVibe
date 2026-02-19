/**
 * @hook useProductSearch
 * @description Búsqueda de productos con debounce y AbortController.
 * Estado completamente local. Independiente de useProductList.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { SEARCH_CONFIG } from '../types/product.types';

/**
 * @param {import('../repository/products.repository').ProductsRepository} repository
 * @param {number} [debounceMs=300]
 * @returns {Object}
 */
export const useProductSearch = (repository, debounceMs = SEARCH_CONFIG.DEBOUNCE_MS) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);

  // Debounce del query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), debounceMs);
    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Ejecutar búsqueda cuando cambia el debouncedQuery
  useEffect(() => {
    if (debouncedQuery.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const doSearch = async () => {
      // Cancelar request anterior
      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const products = await repository.search(
          debouncedQuery.trim(),
          SEARCH_CONFIG.DEFAULT_LIMIT
        );
        setResults(products);
      } catch (err) {
        if (err?.name !== 'AbortError' && err?.code !== 'AbortError') {
          setError(err);
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    doSearch();

    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [debouncedQuery, repository]);

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
    isLoading,
    error,
    clearSearch,
    hasResults: results.length > 0,
    isSearching: query.trim().length >= SEARCH_CONFIG.MIN_QUERY_LENGTH,
  };
};

// ─────────────────────────────────────────────
// SUGGESTIONS
// ─────────────────────────────────────────────

/**
 * @hook useProductSuggestions
 * @description Sugerencias de búsqueda (versión reducida para dropdowns).
 * AbortController propio, independiente de useProductSearch.
 */
export const useProductSuggestions = (repository) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef(null);

  const fetchSuggestions = useCallback(
    async (query) => {
      if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) {
        setSuggestions([]);
        return;
      }

      if (abortRef.current) abortRef.current.abort();
      abortRef.current = new AbortController();

      setIsLoading(true);

      try {
        const products = await repository.search(
          query.trim(),
          SEARCH_CONFIG.SUGGESTIONS_LIMIT
        );

        setSuggestions(
          products.map((p) => ({
            type: 'product',
            text: p.name ?? '',
            slug: p.slug ?? '',
            image: p.images?.[0]?.url ?? null,
            price: p.price,
          }))
        );
      } catch (err) {
        if (err?.name !== 'AbortError' && err?.code !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, isLoading, fetchSuggestions, clearSuggestions };
};

// ─────────────────────────────────────────────
// SEARCH HISTORY (módulo puro con localStorage)
// ─────────────────────────────────────────────

const HISTORY_KEY = 'product_search_history';

/**
 * @hook useSearchHistory
 * @description Historial de búsqueda persistido en localStorage.
 * Estado local simple. No necesita context ni store global.
 */
export const useSearchHistory = (maxItems = SEARCH_CONFIG.HISTORY_MAX_ITEMS) => {
  const isBrowser = typeof window !== 'undefined';

  const readFromStorage = () => {
    if (!isBrowser) return [];
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const writeToStorage = (items) => {
    if (!isBrowser) return;
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch {
      /* storage might be unavailable */
    }
  };

  const [history, setHistory] = useState(readFromStorage);

  const addToHistory = useCallback(
    (query) => {
      if (!query || query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH) return;

      setHistory((prev) => {
        const next = [query, ...prev.filter((q) => q !== query)].slice(0, maxItems);
        writeToStorage(next);
        return next;
      });
    },
    [maxItems] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const removeFromHistory = useCallback((query) => {
    setHistory((prev) => {
      const next = prev.filter((q) => q !== query);
      writeToStorage(next);
      return next;
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (isBrowser) {
      try { localStorage.removeItem(HISTORY_KEY); } catch { /* noop */ }
    }
  }, [isBrowser]);

  return { history, addToHistory, removeFromHistory, clearHistory };
};

export default useProductSearch;