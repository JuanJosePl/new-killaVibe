import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ✅ MIGRADO: Hooks del módulo Products — reemplazan productsAPI directo
import {
  useProductsRepository,
  useProductList,
  useProductFilters,
  useActiveFilterCount,
  PAGINATION_LIMITS,
  PRODUCT_SORT_OPTIONS,
  SORT_ORDER,
} from "@/modules/products";

// Componentes (ya migrados)
import { ProductSearch } from "../components/ProductSearch";
import { ProductBreadcrumb } from "../components/ProductBreadcrumb";
import { ProductFilters, MobileFiltersSheet } from "../components/ProductFilters";
import { ProductGrid } from "../components/ProductGrid";

/**
 * @page ProductosLista
 *
 * CAMBIOS DE MIGRACIÓN:
 * - productsAPI.getProducts() + estado manual → useProductList + useProductFilters
 * - Elimina useSearchParams manual: useProductFilters ya hace URL sync internamente
 * - Elimina fetchProducts() manual: useProductList.reload() con filters del hook
 * - sort/order locales ahora se pasan como filtros extra al reload()
 * - pagination.current → pagination.page (normalizer canónico)
 * - categorías/marcas: mock data mantenido hasta que exista un módulo de categorías
 * - viewMode y mobileFiltersOpen: estado UI local sin cambios
 */
export default function ProductosLista() {
  const navigate = useNavigate();

  // ──────────────────────────────────────────
  // REPOSITORY (inyección de dependencia)
  // ──────────────────────────────────────────
  const repo = useProductsRepository();

  // ──────────────────────────────────────────
  // FILTROS (con URL sync automático)
  // ──────────────────────────────────────────
  const { filters, updateFilter, updateFilters, resetFilters } =
    useProductFilters({
      page: 1,
      limit: PAGINATION_LIMITS.DEFAULT,
      sort: PRODUCT_SORT_OPTIONS.NEWEST,
      order: SORT_ORDER.DESC,
      status: "active",
      visibility: "public",
    });

  // ──────────────────────────────────────────
  // LISTADO DE PRODUCTOS
  // ──────────────────────────────────────────
  const { products, pagination, isLoading, error, reload } =
    useProductList(repo);

  // ──────────────────────────────────────────
  // DATOS AUXILIARES (categorías y marcas)
  // Pendiente: integrar módulo de categorías cuando esté disponible
  // ──────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [brands] = useState(["Apple", "Samsung", "Sony", "LG"]);

  // ──────────────────────────────────────────
  // UI STATE
  // ──────────────────────────────────────────
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  const activeFilterCount = useActiveFilterCount(filters);

  // ──────────────────────────────────────────
  // EFECTO: recargar productos cuando cambian los filtros
  // ──────────────────────────────────────────
  useEffect(() => {
    reload(filters);
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // ──────────────────────────────────────────
  // HANDLERS
  // ──────────────────────────────────────────

  /**
   * Recibe objeto de filtros desde ProductFilters y los aplica.
   */
  const handleFiltersChange = useCallback(
    (newFilters) => {
      updateFilters({ ...newFilters, page: 1 });
    },
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      updateFilter("page", newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [updateFilter]
  );

  /**
   * Recibe un field de sort desde ProductGrid.
   * Detecta si viene con sufijo "-desc" para invertir el order.
   */
  const handleSortChange = useCallback(
    (sortField) => {
      if (sortField.endsWith("-desc")) {
        updateFilters({
          sort: sortField.replace("-desc", ""),
          order: SORT_ORDER.DESC,
          page: 1,
        });
      } else {
        updateFilters({ sort: sortField, order: SORT_ORDER.ASC, page: 1 });
      }
    },
    [updateFilters]
  );

  /**
   * Búsqueda: navega a /buscar o filtra en la misma página.
   * Aquí elegimos filtrar en la página (más UX consistente).
   */
  const handleSearch = useCallback(
    (query) => {
      updateFilters({ search: query, page: 1 });
    },
    [updateFilters]
  );

  // Categoría activa para el breadcrumb
  const activeCategory = categories.find(
    (cat) => cat._id === filters.category
  );

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header con búsqueda */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                🛍️ Productos
              </h1>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-primary text-white text-xs font-bold rounded-full">
                  {activeFilterCount} filtros
                </span>
              )}
            </div>

            {/* Buscador */}
            <div className="flex-1 max-w-2xl">
              <ProductSearch onSearch={handleSearch} />
            </div>

            {/* Botón filtros mobile */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
            >
              Filtros
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb si hay categoría activa */}
      {activeCategory && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <ProductBreadcrumb
              breadcrumb={activeCategory.breadcrumb || []}
              current={activeCategory.name}
            />
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar de filtros (desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                brands={brands}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </aside>

          {/* Grid de productos */}
          <section className="lg:col-span-3">
            <ProductGrid
              products={products}
              loading={isLoading}
              error={error?.message ?? null}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </section>
        </div>
      </div>

      {/* Filtros mobile (sheet) */}
      <MobileFiltersSheet
        isOpen={mobileFiltersOpen}
        onClose={() => setMobileFiltersOpen(false)}
        categories={categories}
        brands={brands}
        onFiltersChange={handleFiltersChange}
      />
    </main>
  );
}