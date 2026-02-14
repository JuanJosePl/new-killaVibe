import { ProductCard } from "./ProductCard";
import { Grid, List, ArrowUpDown } from "lucide-react";
import { useState } from "react";

/**
 * @component ProductGrid
 * @description Grid responsivo con paginación, ordenamiento y modos de vista
 *
 * ✅ MEJORAS:
 * - Paginación integrada
 * - Ordenamiento por diferentes campos
 * - Modo grid/list
 * - Contador de productos
 * - Estados mejorados
 */
export function ProductGrid({
  products = [],
  loading = false,
  error = null,
  pagination = null,
  onPageChange,
  onSortChange,
  viewMode = "grid",
  onViewModeChange,
  className = "",
}) {
  const [currentSort, setCurrentSort] = useState("createdAt");

  // ✅ LOADING STATE
  if (loading) {
    return (
      <div className={className}>
        <div
          className={`${
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-6"
          }`}
        >
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-8xl mb-6">😕</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          Error al cargar productos
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ✅ EMPTY STATE
  if (!products || products.length === 0) {
    return (
      <div className={`text-center py-16 ${className}`}>
        <div className="text-8xl mb-6">🔍</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          No se encontraron productos
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          No hay productos que coincidan con los filtros aplicados. Intenta
          ajustar tus criterios de búsqueda.
        </p>
      </div>
    );
  }

  // ✅ Header con controles
  const handleSortChange = (field) => {
    setCurrentSort(field);
    if (onSortChange) {
      onSortChange(field);
    }
  };

  {
    products.map((product, index) => {
      console.log("🟢 PRODUCT GRID → product:", product);
      console.log("🖼 images:", product.images);
      console.log("⭐ primaryImage:", product.primaryImage);

      return (
        <div
          key={product._id}
          className="animate-slide-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ProductCard
            product={product}
            showWishlistButton={true}
            variant={viewMode === "list" ? "list" : "default"}
          />
        </div>
      );
    });
  }

  return (
    <div className={className}>
      {/* ✅ Toolbar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        {/* Product Count */}
        <div className="text-sm text-gray-600">
          {pagination ? (
            <span>
              Mostrando <strong>{products.length}</strong> de{" "}
              <strong>{pagination.total}</strong> productos
            </span>
          ) : (
            <span>
              <strong>{products.length}</strong> productos
            </span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-3 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none cursor-pointer"
            >
              <option value="createdAt">Más recientes</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="salesCount">Más vendidos</option>
              <option value="rating">Mejor valorados</option>
              <option value="name">Nombre A-Z</option>
            </select>
            <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
          </div>

          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => onViewModeChange("grid")}
                className={`p-2 ${
                  viewMode === "grid"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors`}
                title="Vista de cuadrícula"
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => onViewModeChange("list")}
                className={`p-2 ${
                  viewMode === "list"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                } transition-colors`}
                title="Vista de lista"
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Products Grid */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-6"
        }`}
      >
        {products.map((product, index) => (
          <div
            key={product._id}
            className="animate-slide-in-up"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <ProductCard
              product={product}
              showWishlistButton={true}
              variant={viewMode === "list" ? "list" : "default"}
            />
          </div>
        ))}
      </div>

      {/* ✅ Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="mt-12 flex items-center justify-center space-x-2">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange && onPageChange(pagination.current - 1)}
            disabled={!pagination.hasPrevPage}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Anterior
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-2">
            {[...Array(pagination.pages)].map((_, i) => {
              const pageNum = i + 1;
              const isCurrentPage = pageNum === pagination.current;
              const shouldShow =
                pageNum === 1 ||
                pageNum === pagination.pages ||
                Math.abs(pageNum - pagination.current) <= 2;

              if (!shouldShow) {
                if (
                  pageNum === pagination.current - 3 ||
                  pageNum === pagination.current + 3
                ) {
                  return (
                    <span key={i} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={i}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                    isCurrentPage
                      ? "bg-primary text-white"
                      : "border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange && onPageChange(pagination.current + 1)}
            disabled={!pagination.hasNextPage}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * @component ProductListView
 * @description Vista de lista horizontal (alternativa al grid)
 */
export function ProductListView({ products, loading, error, className = "" }) {
  if (loading || error || !products || products.length === 0) {
    return (
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        viewMode="list"
        className={className}
      />
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          variant="list"
          showWishlistButton={true}
        />
      ))}
    </div>
  );
}
