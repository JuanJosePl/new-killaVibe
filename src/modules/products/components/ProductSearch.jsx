import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// ✅ MIGRADO: Hooks del módulo Products
import {
  useProductsRepository,
  useProductSearch,
  useSearchHistory,
  formatCOP,
} from "@/modules/products";

/**
 * @component ProductSearch
 *
 * CAMBIOS DE MIGRACIÓN:
 * - import from "../hooks/useProductSearch" → @/modules/products
 * - useProductSearch() ahora requiere `repository` como argumento
 * - useSearchHistory() igual, requiere `repository` (no usa HTTP, solo localStorage)
 *   → se instancia sin repo ya que solo usa localStorage
 * - formatPrice → formatCOP
 * - product.image → getPrimaryImage(product) para imagen en sugerencias
 */
export function ProductSearch({ className = "", onSearch }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Repository inyectado una vez
  const repo = useProductsRepository();

  const {
    query,
    setQuery,
    results,
    isLoading: loading,
    error,
    clearSearch,
    hasResults,
    isSearching,
  } = useProductSearch(repo);

  // useSearchHistory no usa HTTP — maxItems por defecto 10
  const { history, addToHistory, removeFromHistory, clearHistory } =
    useSearchHistory();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      addToHistory(query);
      if (onSearch) onSearch(query);
      navigate(`/productos/buscar?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleHistoryClick = (searchTerm) => {
    setQuery(searchTerm);
    addToHistory(searchTerm);
    if (onSearch) onSearch(searchTerm);
    navigate(`/productos/buscar?q=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
  };

  const handleClear = () => {
    clearSearch();
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const shouldShowDropdown =
    showDropdown && (query.length >= 2 || history.length > 0);

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowDropdown(true)}
            placeholder="Buscar productos..."
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {shouldShowDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full mt-2 w-full bg-white rounded-2xl border border-gray-200 shadow-2xl max-h-[500px] overflow-y-auto z-50"
        >
          {/* Resultados */}
          {isSearching && hasResults && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Resultados ({results.length})
                </h4>
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
                )}
              </div>
              <div className="space-y-2">
                {results.slice(0, 5).map((product) => {
                  // ✅ Usar images[] canónico en lugar de product.image
                  const thumbUrl =
                    product.images?.[0]?.url ?? product.images?.[0] ?? null;

                  return (
                    <Link
                      key={product._id}
                      to={`/productos/${product.slug}`}
                      onClick={() => {
                        addToHistory(query);
                        setShowDropdown(false);
                      }}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {thumbUrl ? (
                          <img
                            src={thumbUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Search className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-primary">
                          {product.name}
                        </p>
                        {/* ✅ formatPrice → formatCOP */}
                        <p className="text-xs text-gray-600">
                          {formatCOP(product.price)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
              {results.length > 5 && (
                <button
                  onClick={handleSubmit}
                  className="w-full mt-3 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg transition-colors"
                >
                  Ver todos los resultados ({results.length})
                </button>
              )}
            </div>
          )}

          {/* Loading */}
          {loading && query.length >= 2 && !hasResults && (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2" />
              <p className="text-sm text-gray-600">Buscando...</p>
            </div>
          )}

          {/* Sin resultados */}
          {isSearching && !loading && !hasResults && query.length >= 2 && (
            <div className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                No se encontraron resultados
              </p>
              <p className="text-xs text-gray-600">
                Intenta con otros términos de búsqueda
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-8 text-center">
              <p className="text-sm text-red-600">
                {error?.message ?? "Error en la búsqueda"}
              </p>
            </div>
          )}

          {/* Historial */}
          {!isSearching && history.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  Búsquedas recientes
                </h4>
                <button
                  onClick={clearHistory}
                  className="text-xs text-gray-600 hover:text-gray-900"
                >
                  Limpiar
                </button>
              </div>
              <div className="space-y-1">
                {history.slice(0, 5).map((searchTerm, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg group"
                  >
                    <button
                      onClick={() => handleHistoryClick(searchTerm)}
                      className="flex-1 text-left text-sm text-gray-700 hover:text-primary"
                    >
                      {searchTerm}
                    </button>
                    <button
                      onClick={() => removeFromHistory(searchTerm)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sugerencias populares */}
          {!isSearching && history.length === 0 && (
            <div className="p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                Búsquedas populares
              </h4>
              <div className="flex flex-wrap gap-2">
                {["iPhone", "AirPods", "MacBook", "iPad", "Apple Watch"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => handleHistoryClick(term)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** @component SearchBar — versión compacta para header */
export function SearchBar({ className = "" }) {
  return (
    <ProductSearch
      className={className}
      onSearch={(query) => console.log("Search:", query)}
    />
  );
}