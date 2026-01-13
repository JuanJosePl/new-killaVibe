// src/modules/customer/components/products/ProductFilters.jsx

import React, { useState } from 'react';

/**
 * @component ProductFilters
 * @description Panel de filtros avanzados con glassmorphism
 * 
 * Features:
 * - Filtro por categoría
 * - Rango de precios
 * - Marca
 * - Stock/Featured
 * - Ordenamiento
 * - Collapsible en mobile
 */
const ProductFilters = ({
  filters = {},
  onFilterChange,
  onClearFilters,
  hasActiveFilters = false,
  categories = [],
  brands = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice || '',
    max: filters.maxPrice || '',
  });

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleCategoryChange = (categorySlug) => {
    onFilterChange({ category: categorySlug });
  };

  const handleBrandChange = (brand) => {
    onFilterChange({ brand });
  };

  const handlePriceRangeApply = () => {
    onFilterChange({
      minPrice: priceRange.min ? Number(priceRange.min) : undefined,
      maxPrice: priceRange.max ? Number(priceRange.max) : undefined,
    });
  };

  const handleSortChange = (sort, order) => {
    onFilterChange({ sort, order });
  };

  const handleToggleInStock = () => {
    onFilterChange({ inStock: !filters.inStock });
  };

  const handleToggleFeatured = () => {
    onFilterChange({ featured: !filters.featured });
  };

  // ============================================
  // SORT OPTIONS
  // ============================================
  const sortOptions = [
    { label: 'Más recientes', value: 'createdAt', order: 'desc' },
    { label: 'Precio: menor a mayor', value: 'price', order: 'asc' },
    { label: 'Precio: mayor a menor', value: 'price', order: 'desc' },
    { label: 'Más populares', value: 'salesCount', order: 'desc' },
    { label: 'Mejor calificados', value: 'rating.average', order: 'desc' },
    { label: 'Nombre A-Z', value: 'name', order: 'asc' },
  ];

  return (
    <div className="space-y-4">
      {/* Mobile Toggle */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white rounded-xl px-4 py-3 flex items-center justify-between border-2 border-gray-300 hover:border-blue-600 transition-colors"
        >
          <span className="font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filtros
            {hasActiveFilters && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                Activos
              </span>
            )}
          </span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Filters Panel */}
      <div className={`lg:block ${isOpen ? 'block' : 'hidden'}`}>
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl p-6 space-y-6">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              Filtros
            </h3>
            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpiar
              </button>
            )}
          </div>

          {/* Sort */}
          <FilterSection title="Ordenar por" icon="🔄">
            <select
              value={`${filters.sort || 'createdAt'}-${filters.order || 'desc'}`}
              onChange={(e) => {
                const [sort, order] = e.target.value.split('-');
                handleSortChange(sort, order);
              }}
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 outline-none transition-all font-medium"
            >
              {sortOptions.map((option) => (
                <option key={`${option.value}-${option.order}`} value={`${option.value}-${option.order}`}>
                  {option.label}
                </option>
              ))}
            </select>
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Rango de precio" icon="💰">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 outline-none transition-all"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="px-4 py-2.5 rounded-xl border-2 border-gray-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/20 outline-none transition-all"
                />
              </div>
              <button
                onClick={handlePriceRangeApply}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Aplicar
              </button>
            </div>
          </FilterSection>

          {/* Categories */}
          {categories.length > 0 && (
            <FilterSection title="Categorías" icon="📁">
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {categories.map((category) => (
                  <label
                    key={category.slug}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === category.slug}
                      onChange={() => handleCategoryChange(category.slug)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {category.name}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Brands */}
          {brands.length > 0 && (
            <FilterSection title="Marcas" icon="🏷️">
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <input
                      type="radio"
                      name="brand"
                      checked={filters.brand === brand}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">
                      {brand}
                    </span>
                  </label>
                ))}
              </div>
            </FilterSection>
          )}

          {/* Quick Filters */}
          <FilterSection title="Filtros rápidos" icon="⚡">
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-blue-50 hover:to-indigo-50 transition-all">
                <span className="text-sm font-medium text-gray-700">Solo en stock</span>
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={handleToggleInStock}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-600"
                />
              </label>
              
              <label className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 cursor-pointer hover:from-yellow-50 hover:to-orange-50 transition-all">
                <span className="text-sm font-medium text-gray-700">Solo destacados</span>
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={handleToggleFeatured}
                  className="w-5 h-5 text-yellow-600 rounded focus:ring-yellow-600"
                />
              </label>
            </div>
          </FilterSection>

        </div>
      </div>
    </div>
  );
};

/**
 * @component FilterSection
 * @description Sección colapsable de filtros
 */
const FilterSection = ({ title, icon, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-3 group"
      >
        <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <span>{icon}</span>
          {title}
        </h4>
        <svg 
          className={`w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-all ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
};

export default ProductFilters;