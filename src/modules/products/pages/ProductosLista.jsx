import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

// ============================================================================
// APIs Y HOOKS
// ============================================================================
import  productsAPI  from "../api/products.api";

// ============================================================================
// UTILIDADES Y CONSTANTES
// ============================================================================
import {
  PAGINATION_LIMITS,
  PRODUCT_SORT_OPTIONS,
  SORT_ORDER,
} from "../types/product.types";

// ============================================================================
// ✅ COMPONENTES INTEGRADOS
// ============================================================================
import { ProductSearch } from "../components/ProductSearch";
import { ProductBreadcrumb } from "../components/ProductBreadcrumb";
import {
  ProductFilters,
  MobileFiltersSheet,
} from "../components/ProductFilters";
import { ProductGrid } from "../components/ProductGrid";

/**
 * @component ProductosLista
 * @description Página principal de listado de productos
 *
 * ✅ INTEGRACIÓN COMPLETA:
 * - ProductSearch (búsqueda con autocomplete)
 * - ProductBreadcrumb (navegación cuando hay categoría)
 * - ProductFilters (sidebar desktop + mobile sheet)
 * - ProductGrid (renderiza ProductCard internamente)
 * - Fetch con paginación real
 * - URL sync con react-router-dom
 */
export default function ProductosLista() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // FILTROS Y PAGINACIÓN
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [limit] = useState(PAGINATION_LIMITS.DEFAULT);
  const [sort, setSort] = useState(
    searchParams.get("sort") || PRODUCT_SORT_OPTIONS.NEWEST
  );
  const [order, setOrder] = useState(
    searchParams.get("order") || SORT_ORDER.DESC
  );

  // FILTROS ESPECÍFICOS (sincronizados con ProductFilters)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: parseInt(searchParams.get("minPrice")) || 0,
    maxPrice: parseInt(searchParams.get("maxPrice")) || 5000000,
    inStock: searchParams.get("inStock") === "true" || false,
    minRating: parseInt(searchParams.get("rating")) || 0,
    featured: searchParams.get("featured") === "true" || false,
    brand: searchParams.get("brand") || "",
  });

  // UI STATE
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // ==========================================================================
  // ✅ SYNC URL PARAMS
  // ==========================================================================
  useEffect(() => {
    const params = new URLSearchParams();

    if (page !== 1) params.set("page", page.toString());
    if (sort !== PRODUCT_SORT_OPTIONS.NEWEST) params.set("sort", sort);
    if (order !== SORT_ORDER.DESC) params.set("order", order);
    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice > 0)
      params.set("minPrice", filters.minPrice.toString());
    if (filters.maxPrice < 5000000)
      params.set("maxPrice", filters.maxPrice.toString());
    if (filters.inStock) params.set("inStock", "true");
    if (filters.minRating > 0)
      params.set("rating", filters.minRating.toString());
    if (filters.featured) params.set("featured", "true");
    if (filters.brand) params.set("brand", filters.brand);

    setSearchParams(params, { replace: true });
  }, [page, sort, order, filters, setSearchParams]);

  // ==========================================================================
  // ✅ FETCH PRODUCTOS
  // ==========================================================================
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const queryFilters = {
        page,
        limit,
        sort,
        order,
        status: "active",
        visibility: "public",
        ...filters, // Spread all filters
      };

      // Limpiar filtros vacíos
      Object.keys(queryFilters).forEach((key) => {
        if (
          queryFilters[key] === "" ||
          queryFilters[key] === 0 ||
          queryFilters[key] === false
        ) {
          delete queryFilters[key];
        }
      });

      const response = await productsAPI.getProducts(queryFilters);

      if (response.success) {
        setProducts(response.data || []);
        setPagination(response.pagination || {});
      } else {
        setError(response.message || "Error al cargar productos");
        setProducts([]);
      }
    } catch (err) {
      console.error("[ProductosLista] Error fetching products:", err);
      setError(err.response?.data?.message || "Error al cargar los productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sort, order, filters]);

  // ==========================================================================
  // ✅ FETCH CATEGORIES & BRANDS (para filtros)
  // ==========================================================================
  useEffect(() => {
    const fetchFiltersData = async () => {
      try {
        // Fetch categories (ajusta según tu API)
        // const categoriesRes = await categoriesAPI.getCategories();
        // setCategories(categoriesRes.data || []);

        // Fetch brands (si existe endpoint)
        // const brandsRes = await productsAPI.getBrands();
        // setBrands(brandsRes.data || []);

        // Por ahora, mock data hasta que implementes los endpoints
        setCategories([]);
        setBrands(["Apple", "Samsung", "Sony", "LG"]);
      } catch (err) {
        console.error("Error fetching filters data:", err);
      }
    };

    fetchFiltersData();
  }, []);

  // Llamar a fetch cuando cambian filtros
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ==========================================================================
  // ✅ HANDLERS
  // ==========================================================================
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset página al cambiar filtros
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSortChange = useCallback((sortField) => {
    setSort(sortField);
    setPage(1);
  }, []);

  const handleSearch = useCallback((query) => {
    setFilters((prev) => ({ ...prev, search: query }));
    setPage(1);
  }, []);

  // ==========================================================================
  // ✅ COMPUTED VALUES
  // ==========================================================================
  const activeCategory = categories.find((cat) => cat._id === filters.category);

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* ✅ INTEGRACIÓN: ProductSearch */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              🛍️ Productos
            </h1>

            {/* ✅ INTEGRACIÓN: ProductSearch component */}
            <div className="flex-1 max-w-2xl">
              <ProductSearch onSearch={handleSearch} />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ INTEGRACIÓN: ProductBreadcrumb (si hay categoría activa) */}
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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ✅ INTEGRACIÓN: ProductFilters (Desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ProductFilters
                categories={categories}
                brands={brands}
                onFiltersChange={handleFiltersChange}
              />
            </div>
          </aside>

          {/* PRODUCTS SECTION */}
          <section className="lg:col-span-3">
            {/* ✅ INTEGRACIÓN: ProductGrid con todas sus funcionalidades */}
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSortChange={handleSortChange}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </section>
        </div>
      </div>

      {/* ✅ INTEGRACIÓN: MobileFiltersSheet */}
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
