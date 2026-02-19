/**
 * @page CategoriesPage
 * @description Página principal de categorías.
 *
 * Consume:
 * - useCategories  → listado y paginación
 * - useProducts    → productos para slider en CategoryCard
 * Sin dependencia de Context. Sin lógica de dominio.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useCategories from '../presentation/hooks/useCategories.js';
import CategoryCard  from '../presentation/components/CategoryCard.jsx';
import { useProducts } from '../../products/contexts/ProductsContext';

const CategoriesPage = () => {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    featured   : false,
    parentOnly : false,
    sortBy     : 'order',
  });

  /* ── Categorías ───────────────────────────────────────────────── */
  const {
    categories,
    loading,
    error,
    isEmpty,
    pagination,
    hasMore,
    hasPrev,
    nextPage,
    prevPage,
    search,
    refresh,
  } = useCategories({
    featured   : filters.featured,
    parentOnly : filters.parentOnly,
    sortBy     : filters.sortBy,
    pageSize   : 12,
    searchTerm,  // filtrado local complementario
  });

  /* ── Productos para slider ─────────────────────────────────────── */
  const { products, loading: productsLoading, fetchProducts } = useProducts();

  useEffect(() => {
    if (products.length === 0 && !productsLoading) {
      fetchProducts({ limit: 100, status: 'active' });
    }
  }, [fetchProducts, products.length, productsLoading]);

  const getProductsForCategory = useCallback((categoryId) => {
    if (productsLoading || !products.length) return [];
    return products
      .filter((p) => {
        const cid = String(
          p.mainCategory?._id ?? p.mainCategory ?? p.category?._id ?? p.category ?? ''
        );
        return cid === String(categoryId);
      })
      .slice(0, 5);
  }, [products, productsLoading]);

  /* ── Handlers ──────────────────────────────────────────────────── */
  const handleFilterChange = (key, value) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleCategoryClick = (category) =>
    navigate(`/categorias/${category.slug}`);

  /* ── Render ────────────────────────────────────────────────────── */
  if (loading && !categories.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Categorías</h1>
          <p className="text-gray-600">
            {loading
              ? 'Actualizando...'
              : `Explora nuestras ${pagination.total || 0} categorías`}
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">

            {/* Buscador */}
            <div className="md:col-span-2 relative">
              <input
                type="text"
                placeholder="Buscar por nombre, descripción o keywords..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Ordenar */}
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="order">Orden por defecto</option>
              <option value="name">Nombre A-Z</option>
              <option value="newest">Más recientes</option>
              <option value="productCount">Mayor cantidad de productos</option>
            </select>

            {/* Toggles */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-2">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Solo destacadas</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.parentOnly}
                  onChange={(e) => handleFilterChange('parentOnly', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="ml-2 text-sm text-gray-700">Categorías raíz</span>
              </label>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800 font-medium">⚠ {error}</p>
            <button
              onClick={refresh}
              className="mt-2 text-sm text-red-600 underline hover:text-red-800"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid */}
        {isEmpty && !loading ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="text-gray-400 mb-4 text-5xl">📦</div>
            <h3 className="text-xl font-semibold text-gray-900">No hay categorías</h3>
            <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                category={category}
                categoryProducts={getProductsForCategory(category._id)}
                showProductCount
                onClick={handleCategoryClick}
              />
            ))}
          </div>
        )}

        {/* Paginación */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500 italic">
              Mostrando {categories.length} de {pagination.total} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={!hasPrev || loading}
                className="px-5 py-2 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <span className="px-4 py-2 font-bold text-blue-600 bg-blue-50 rounded-lg">
                {pagination.page}
              </span>
              <button
                onClick={nextPage}
                disabled={!hasMore || loading}
                className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm shadow-blue-200"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Overlay de carga para paginación */}
      {loading && categories.length > 0 && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-full shadow-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-600" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;