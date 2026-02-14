import { useState, useEffect, useCallback, useRef } from "react";
import productsApi from "../api/products.api";
import { SEARCH_CONFIG } from "../types/product.types";

/**
 * @hook useProductSearch
 * @description Hook para búsqueda de productos con debounce
 * @param {number} debounceMs - Tiempo de debounce en ms
 * @returns {Object}
 */
export const useProductSearch = (debounceMs = SEARCH_CONFIG.DEBOUNCE_MS) => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
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
    if (
      !debouncedQuery ||
      debouncedQuery.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH
    ) {
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
        if (err.name !== "AbortError") {
          console.error("Search error:", err);
          setError(err.response?.data?.message || "Error en la búsqueda");
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
    setQuery("");
    setDebouncedQuery("");
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
    isSearching: query.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH,
  };
};

/**
 * @hook useSearchHistory
 * @description Hook para manejo de historial de búsqueda
 * @param {number} maxItems - Máximo de items en historial
 * @returns {Object}
 */
export const useSearchHistory = (maxItems = 10) => {
  const isBrowser = typeof window !== "undefined";

  const [history, setHistory] = useState(() => {
    if (!isBrowser) return [];
    try {
      const saved = localStorage.getItem("search_history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("[useSearchHistory] Error leyendo localStorage", e);
      return [];
    }
  });

  const addToHistory = useCallback(
    (query) => {
      if (
        !isBrowser ||
        !query ||
        query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH
      ) {
        return;
      }

      setHistory((prev) => {
        const newHistory = [
          query,
          ...prev.filter((q) => q !== query),
        ].slice(0, maxItems);

        try {
          localStorage.setItem(
            "search_history",
            JSON.stringify(newHistory)
          );
        } catch (e) {
          console.error("[useSearchHistory] Error guardando historial", e);
        }

        return newHistory;
      });
    },
    [maxItems, isBrowser]
  );

  const removeFromHistory = useCallback(
    (query) => {
      if (!isBrowser) return;

      setHistory((prev) => {
        const newHistory = prev.filter((q) => q !== query);

        try {
          localStorage.setItem(
            "search_history",
            JSON.stringify(newHistory)
          );
        } catch (e) {
          console.error("[useSearchHistory] Error eliminando item", e);
        }

        return newHistory;
      });
    },
    [isBrowser]
  );

  const clearHistory = useCallback(() => {
    if (!isBrowser) return;

    setHistory([]);
    try {
      localStorage.removeItem("search_history");
    } catch (e) {
      console.error("[useSearchHistory] Error limpiando historial", e);
    }
  }, [isBrowser]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
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
  const abortRef = useRef(null);

  const fetchSuggestions = useCallback(async (query) => {
    if (
      !query ||
      query.trim().length < SEARCH_CONFIG.MIN_QUERY_LENGTH
    ) {
      setSuggestions([]);
      return;
    }

    // Cancelar request anterior
    if (abortRef.current) {
      abortRef.current.abort();
    }

    abortRef.current = new AbortController();

    try {
      setLoading(true);

      const response = await productsApi.searchProducts(
        query.trim(),
        5,
        {
          signal: abortRef.current.signal,
        }
      );

      if (response?.success) {
        const productSuggestions = Array.isArray(response.data)
          ? response.data.map((p) => ({
              type: "product",
              text: p?.name ?? "",
              slug: p?.slug ?? "",
              image: p?.images?.[0]?.url ?? null,
            }))
          : [];

        setSuggestions(productSuggestions);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(
          "[useSearchSuggestions] Error obteniendo sugerencias",
          err
        );
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    fetchSuggestions,
  };
};

