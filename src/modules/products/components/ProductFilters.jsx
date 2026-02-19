import { useState } from "react";
import {
  X,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Tag,
  Package,
  Star,
  Filter,
} from "lucide-react";

// ✅ MIGRADO: Hooks del módulo Products
import {
  useProductFilters,
  usePriceRange,
  formatCOP,
} from "@/modules/products";

// ✅ MIGRADO: useCategoryFilter era hook local — se implementa aquí directamente
//    (no existía en el módulo anterior; era estado local en el componente)
import { useState as useCategoryState } from "react";

/**
 * @hook useCategoryFilter (local)
 * @description Gestiona multi-selección de categorías.
 * No forma parte del módulo Products porque las categorías son un dominio
 * separado. Se mantiene aquí hasta que exista un módulo de categorías.
 */
function useCategoryFilter() {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearCategories = () => setSelectedCategories([]);
  const isSelected = (categoryId) => selectedCategories.includes(categoryId);

  return { selectedCategories, toggleCategory, clearCategories, isSelected };
}

/**
 * @component ProductFilters
 *
 * CAMBIOS DE MIGRACIÓN:
 * - import useProductFilters from "../hooks/useProductFilters" → @/modules/products
 * - import usePriceRange from "../hooks/useProductFilters"    → @/modules/products
 * - import formatPrice from "../utils/priceHelpers"           → formatCOP de @/modules/products
 * - useCategoryFilter: era hook externo no encontrado — ahora inline arriba
 * - clearFilters renombrado a resetFilters en el nuevo hook (interfaz actualizada)
 */
export function ProductFilters({
  categories = [],
  brands = [],
  onFiltersChange,
  className = "",
}) {
  const { filters, updateFilter, resetFilters } = useProductFilters();
  const { range: priceRange, debouncedRange, updateRange, resetRange } =
    usePriceRange(0, 5_000_000);
  const { selectedCategories, toggleCategory, clearCategories, isSelected } =
    useCategoryFilter();

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    brands: true,
    features: true,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ Aplicar filtros
  const handleApplyFilters = () => {
    const newFilters = {
      ...filters,
      minPrice: debouncedRange[0] > 0 ? debouncedRange[0] : undefined,
      maxPrice: debouncedRange[1] < 5_000_000 ? debouncedRange[1] : undefined,
      category:
        selectedCategories.length > 0
          ? selectedCategories.join(",")
          : undefined,
    };
    if (onFiltersChange) onFiltersChange(newFilters);
  };

  // ✅ Limpiar filtros
  const handleClearFilters = () => {
    resetFilters(); // antes: clearFilters()
    resetRange();
    clearCategories();
    if (onFiltersChange) onFiltersChange({});
  };

  // Contar filtros activos
  const activeFiltersCount =
    (debouncedRange[0] > 0 || debouncedRange[1] < 5_000_000 ? 1 : 0) +
    selectedCategories.length +
    (filters.featured ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.brand ? 1 : 0);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-sm text-primary hover:text-primary/80 font-semibold"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* CATEGORÍAS */}
        {categories.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("categories")}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-gray-900">Categorías</span>
              </div>
              {expandedSections.categories ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
            {expandedSections.categories && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <label
                    key={category._id}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected(category._id)}
                      onChange={() => toggleCategory(category._id)}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700 flex-1">{category.name}</span>
                    {category.productCount && (
                      <span className="text-xs text-gray-500">
                        ({category.productCount})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* RANGO DE PRECIO */}
        <div>
          <button
            onClick={() => toggleSection("price")}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Precio</span>
            </div>
            {expandedSections.price ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
          {expandedSections.price && (
            <div className="space-y-4">
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={priceRange[0]}
                  onChange={(e) =>
                    updateRange([parseInt(e.target.value), priceRange[1]])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <input
                  type="range"
                  min="0"
                  max="5000000"
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) =>
                    updateRange([priceRange[0], parseInt(e.target.value)])
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary mt-2"
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-500 text-xs">Desde</span>
                  {/* ✅ formatPrice → formatCOP */}
                  <span className="font-semibold text-gray-900">
                    {formatCOP(priceRange[0])}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-gray-500 text-xs">Hasta</span>
                  <span className="font-semibold text-gray-900">
                    {formatCOP(priceRange[1])}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  [0, 500_000, "< $500K"],
                  [500_000, 1_000_000, "$500K - $1M"],
                  [1_000_000, 2_000_000, "$1M - $2M"],
                  [2_000_000, 5_000_000, "> $2M"],
                ].map(([min, max, label]) => (
                  <button
                    key={label}
                    onClick={() => updateRange([min, max])}
                    className="px-3 py-2 text-xs border border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MARCAS */}
        {brands.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection("brands")}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="font-semibold text-gray-900">Marcas</span>
              </div>
              {expandedSections.brands ? (
                <ChevronUp className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
            {expandedSections.brands && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="radio"
                      name="brand"
                      value={brand}
                      checked={filters.brand === brand}
                      onChange={() => updateFilter("brand", brand)}
                      className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CARACTERÍSTICAS */}
        <div>
          <button
            onClick={() => toggleSection("features")}
            className="flex items-center justify-between w-full mb-3"
          >
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-gray-600" />
              <span className="font-semibold text-gray-900">Características</span>
            </div>
            {expandedSections.features ? (
              <ChevronUp className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>
          {expandedSections.features && (
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => updateFilter("inStock", e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <span className="text-sm text-gray-700">Solo en stock</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={filters.featured || false}
                  onChange={(e) => updateFilter("featured", e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Destacados</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Botón Aplicar */}
        <button
          onClick={handleApplyFilters}
          className="w-full bg-gradient-to-r from-primary to-accent text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
}

/**
 * @component MobileFiltersSheet — Sin cambios estructurales
 */
export function MobileFiltersSheet({ isOpen, onClose, ...filterProps }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-gray-900">Filtros</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        <ProductFilters {...filterProps} />
      </div>
    </div>
  );
}