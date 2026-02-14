// src/modules/customer/hooks/useProducts.js

import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerProducts } from "../context/CustomerProductsContext";

/**
 * ✅ HOOK CORREGIDO - Sin doble carga
 */
const useProducts = (initialFilters = {}) => {
  const navigate = useNavigate();
  const isInitialMount = useRef(true);

  const {
    getProducts: contextGetProducts,
    getProductBySlug: contextGetBySlug,
    searchProducts: contextSearchProducts,
    isLoading: contextLoading,
    error: contextError,
  } = useCustomerProducts();

  // ============================================
  // ESTADO
  // ============================================
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pages: 1,
    total: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    sort: "createdAt",
    order: "desc",
    ...initialFilters,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // ============================================
  // ✅ CARGAR PRODUCTOS (SIN DEPENDENCIA CIRCULAR)
  // ============================================
  const loadProducts = useCallback(
    async (customFilters = {}) => {
      try {
        setIsLoading(true);
        setError(null);

        const mergedFilters = { ...filters, ...customFilters };

        console.log("[useProducts] ✅ Cargando con filtros:", mergedFilters);

        const response = await contextGetProducts(mergedFilters);

        console.log("[useProducts] ✅ Respuesta:", response);

        setProducts(response.products || []);

        const paginationData = response.pagination || {
          current: 1,
          pages: 1,
          total: 0,
          limit: 12,
        };

        setPagination({
          ...paginationData,
          hasNextPage: paginationData.current < paginationData.pages,
          hasPrevPage: paginationData.current > 1,
        });
      } catch (err) {
        console.error("[useProducts] ❌ Error:", err);
        setError(err.message || "Error al cargar productos");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [contextGetProducts] // ✅ SOLO depende del contexto
  );

  // ============================================
  // ✅ EFECTO CONTROLADO (NO se ejecuta en mount inicial)
  // ============================================
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return; // ✅ NO cargar en el primer render
    }

    // ✅ Solo cargar si los filtros cambiaron DESPUÉS del mount
    loadProducts();
  }, [filters.page, filters.category, filters.sort, filters.order]); // ✅ Dependencias específicas

  // ============================================
  // FILTROS
  // ============================================
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 12,
      sort: "createdAt",
      order: "desc",
    });
    setSearchQuery("");
  }, []);

  /**
   * ✅ CRÍTICO: Filtrar por categoría
   */
  const filterByCategory = useCallback(
    (categorySlug) => {
      console.log(
        "[useProducts] ✅ Aplicando filtro de categoría:",
        categorySlug
      );

      setFilters({
        page: 1,
        limit: 12,
        sort: "createdAt",
        order: "desc",
        category: categorySlug, // ✅ SOLO el filtro de categoría
      });

      // ✅ Cargar inmediatamente
      loadProducts({ category: categorySlug, page: 1 });
    },
    [loadProducts]
  );

  const filterByPriceRange = useCallback(
    (minPrice, maxPrice) => {
      updateFilters({ minPrice, maxPrice, page: 1 });
    },
    [updateFilters]
  );

  const filterByBrand = useCallback(
    (brand) => {
      updateFilters({ brand, page: 1 });
    },
    [updateFilters]
  );

  const toggleInStockOnly = useCallback(() => {
    updateFilters({ inStock: !filters.inStock, page: 1 });
  }, [filters.inStock, updateFilters]);

  const toggleFeaturedOnly = useCallback(() => {
    updateFilters({ featured: !filters.featured, page: 1 });
  }, [filters.featured, updateFilters]);

  // ============================================
  // ORDENAMIENTO
  // ============================================
  const changeSort = useCallback(
    (sort, order = "desc") => {
      updateFilters({ sort, order, page: 1 });
    },
    [updateFilters]
  );

  // ============================================
  // PAGINACIÓN
  // ============================================
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= pagination.pages) {
        setFilters((prev) => ({ ...prev, page }));
      }
    },
    [pagination.pages]
  );

  const nextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      goToPage(pagination.current + 1);
    }
  }, [pagination, goToPage]);

  const prevPage = useCallback(() => {
    if (pagination.hasPrevPage) {
      goToPage(pagination.current - 1);
    }
  }, [pagination, goToPage]);

  // ============================================
  // BÚSQUEDA
  // ============================================
  const searchProducts = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) {
        setSearchQuery("");
        updateFilters({ search: undefined, page: 1 });
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        setSearchQuery(query);

        const results = await contextSearchProducts(query, 20);

        setProducts(results);
        setPagination({
          current: 1,
          pages: 1,
          total: results.length,
          limit: results.length,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } catch (err) {
        console.error("[useProducts] Error searching:", err);
        setError(err.message || "Error en la búsqueda");
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [contextSearchProducts, updateFilters]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    updateFilters({ search: undefined, page: 1 });
  }, [updateFilters]);

  // ============================================
  // DETALLES
  // ============================================
  const loadProductDetails = useCallback(
    async (slug) => {
      try {
        setIsLoading(true);
        setError(null);
        const product = await contextGetBySlug(slug);
        return product;
      } catch (err) {
        setError(err.message || "Producto no encontrado");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contextGetBySlug]
  );

  // ============================================
  // NAVEGACIÓN
  // ============================================
  const viewProduct = useCallback(
    (slug) => {
      navigate(`/customer/products/${slug}`);
    },
    [navigate]
  );

  const backToList = useCallback(() => {
    navigate("/customer/products");
  }, [navigate]);

  // ============================================
  // HELPERS
  // ============================================
  const refresh = useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  const hasActiveFilters = useCallback(() => {
    return !!(
      filters.category ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.brand ||
      filters.inStock ||
      filters.featured ||
      searchQuery
    );
  }, [filters, searchQuery]);

  // ============================================
  // RETURN
  // ============================================
  return {
    products,
    pagination,
    filters,
    searchQuery,
    isLoading: contextLoading || isLoading,
    error: contextError || error,
    hasActiveFilters: hasActiveFilters(),
    updateFilters,
    clearFilters,
    filterByCategory,
    filterByPriceRange,
    filterByBrand,
    toggleInStockOnly,
    toggleFeaturedOnly,
    changeSort,
    goToPage,
    nextPage,
    prevPage,
    searchProducts,
    clearSearch,
    loadProductDetails,
    viewProduct,
    backToList,
    refresh,
  };
};

export default useProducts;
