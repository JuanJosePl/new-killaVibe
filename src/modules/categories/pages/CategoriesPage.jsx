import { useState, useEffect } from 'react';
import useCategories from '../hooks/useCategories';
import useCategoryTree from '../hooks/useCategoryTree';
import CategoryCard from '../components/CategoryCard';
import {
  filterCategories,
  sortCategories,
  formatProductCount,
} from '../utils/categoryHelpers';
import { useNavigate } from 'react-router-dom';

/**
 * @page CategoriesPage
 * @description Página principal de categorías con filtros y búsqueda
 * 
 * FEATURES:
 * - Grid responsive
 * - Búsqueda en tiempo real
 * - Filtros (featured, parentOnly)
 * - Ordenamiento
 * - Paginación
 * - Loading states
 */
const CategoriesPage = () => {
  const navigate = useNavigate(); // Inicializa el hook
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    featured: false,
    parentOnly: false,
    sortBy: 'order',
  });

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
    fetchCategories,
  } = useCategories({
    featured: filters.featured,
    parentOnly: filters.parentOnly,
    sortBy: filters.sortBy,
    pageSize: 12,
  });

  const { tree, loading: treeLoading } = useCategoryTree();

  // Filtrar categorías por búsqueda
  const filteredCategories = searchTerm
    ? filterCategories(categories, searchTerm)
    : categories;

  // Manejar cambio de filtros
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Loading state
  if (loading && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-500">Conectando con el servidor...</p>
      </div>
     );
  };

  if (error) {
    return <div className="p-10 text-red-500">Error detectado: {error}</div>;
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-red-800 font-semibold mb-2">Error al cargar categorías</h3>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchCategories()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Categorías
          </h1>
          <p className="text-gray-600">
            Explora nuestras {pagination?.total || 0} categorías
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="order">Orden predeterminado</option>
                <option value="name">Nombre A-Z</option>
                <option value="newest">Más recientes</option>
                <option value="views">Más vistas</option>
                <option value="productCount">Más productos</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => handleFilterChange('featured', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Solo destacadas</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.parentOnly}
                  onChange={(e) => handleFilterChange('parentOnly', e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm">Solo categorías principales</span>
              </label>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {isEmpty && !loading && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-16 w-16 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay categorías
            </h3>
            <p className="text-gray-600">
              No se encontraron categorías con los filtros aplicados
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {!isEmpty && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
              {filteredCategories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  showProductCount
                  onClick={(cat) => {
                    navigate(`/categorias/${cat.slug}`);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                <div className="text-sm text-gray-600">
                  Página {pagination?.page || 1} de {pagination?.pages || 1}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={prevPage}
                    disabled={!hasPrev || loading}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>

                  <button
                    onClick={nextPage}
                    disabled={!hasMore || loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>

                <div className="text-sm text-gray-600">
                  {pagination.total} categorías en total
                </div>
              </div>
            )}
          </>
        )}

        {/* Loading overlay */}
        {loading && categories.length > 0 && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;