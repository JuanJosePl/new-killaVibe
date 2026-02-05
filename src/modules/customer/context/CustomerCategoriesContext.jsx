// src/modules/customer/context/CustomerCategoriesContext.jsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as customerCategoriesApi from "../api/customerCategories.api";
import { customerErrorNormalizer } from "../utils/customerErrorNormalizer";
import customerCacheManager, {
  CATEGORY_CACHE_KEYS,
} from "../utils/customerCacheManager";

/**
 * @context CustomerCategoriesContext
 * @description Gestión global de categorías para customer panel
 *
 * ✅ FEATURES:
 * - Cache inteligente con TTL
 * - Búsqueda y filtrado
 * - Árbol jerárquico
 * - Categorías destacadas
 * - Navegación por slug
 * - Invalidación de cache
 */

const CustomerCategoriesContext = createContext(null);

export const CustomerCategoriesProvider = ({ children }) => {
  // ============================================
  // ESTADO
  // ============================================
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
  const [popularCategories, setPopularCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  useEffect(() => {
    if (!initialized) {
      console.log("[CategoriesContext] Inicializando...");
      loadCategories();
      setInitialized(true);
    }
  }, [initialized]);

  // ============================================
  // CARGAR CATEGORÍAS PRINCIPALES
  // ============================================
  const loadCategories = useCallback(async () => {
    // Intentar obtener del cache primero
    const cachedTree = customerCacheManager.get(CATEGORY_CACHE_KEYS.tree());
    const cachedFeatured = customerCacheManager.get(
      CATEGORY_CACHE_KEYS.featured()
    );

    if (cachedTree && cachedFeatured) {
      console.log("[CategoriesContext] ✅ Usando datos del cache");
      setCategoryTree(cachedTree);
      setFlatCategories(customerCategoriesApi.flattenCategoryTree(cachedTree));
      setFeaturedCategories(cachedFeatured);
      return;
    }

    // Si no hay cache, cargar desde API
    try {
      setIsLoading(true);
      setError(null);

      console.log("[CategoriesContext] 🔄 Cargando desde API...");

      const [tree, featured] = await Promise.all([
        customerCategoriesApi.getCategoryTree(),
        customerCategoriesApi.getFeaturedCategories(6),
      ]);

      console.log(
        "[CategoriesContext] ✅ Árbol cargado:",
        tree?.length,
        "categorías"
      );
      console.log(
        "[CategoriesContext] ✅ Featured cargadas:",
        featured?.length,
        "categorías"
      );

      // Guardar en estado
      setCategoryTree(tree);
      setFlatCategories(customerCategoriesApi.flattenCategoryTree(tree));
      setFeaturedCategories(featured);

      // Guardar en cache (30 minutos)
      customerCacheManager.set(
        CATEGORY_CACHE_KEYS.tree(),
        tree,
        30 * 60 * 1000
      );
      customerCacheManager.set(
        CATEGORY_CACHE_KEYS.featured(),
        featured,
        30 * 60 * 1000
      );
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      setError(normalized.message);
      console.error("[CategoriesContext] ❌ Error loading:", normalized);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================
  // OBTENER CATEGORÍA POR SLUG
  // ============================================
  const getCategoryBySlug = useCallback(async (slug) => {
    const cacheKey = CATEGORY_CACHE_KEYS.detail(slug);
    const cached = customerCacheManager.get(cacheKey);

    if (cached) {
      console.log("[CategoriesContext] ✅ Categoría en cache:", slug);
      return cached;
    }

    try {
      console.log("[CategoriesContext] 🔄 Cargando categoría:", slug);
      const category = await customerCategoriesApi.getCategoryBySlug(slug);
      console.log("[CategoriesContext] ✅ Categoría cargada:", category.name);

      // Guardar en cache (15 minutos)
      customerCacheManager.set(cacheKey, category, 15 * 60 * 1000);
      return category;
    } catch (err) {
      console.error("[CategoriesContext] ❌ Error loading category:", err);
      throw err;
    }
  }, []);

  // ============================================
  // OBTENER CATEGORÍA POR ID
  // ============================================
  const getCategoryById = useCallback(
    (categoryId) => {
      return flatCategories.find((cat) => cat._id === categoryId);
    },
    [flatCategories]
  );

  // ============================================
  // BUSCAR EN ÁRBOL
  // ============================================
  const findBySlug = useCallback(
    (slug) => {
      return flatCategories.find((cat) => cat.slug === slug);
    },
    [flatCategories]
  );

  const getSubcategories = useCallback(
    (categorySlug) => {
      const category = findBySlug(categorySlug);
      return category?.children || [];
    },
    [findBySlug]
  );

  // ============================================
  // OBTENER CATEGORÍAS PADRE (ROOT)
  // ============================================
  const getRootCategories = useCallback(() => {
    return categoryTree;
  }, [categoryTree]);

  // ============================================
  // BUSCAR CATEGORÍAS POR NOMBRE
  // ============================================
  const searchCategories = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];

    const cacheKey = CATEGORY_CACHE_KEYS.search(query);
    const cached = customerCacheManager.get(cacheKey);

    if (cached) {
      console.log("[CategoriesContext] ✅ Búsqueda en cache:", query);
      return cached;
    }

    try {
      console.log("[CategoriesContext] 🔍 Buscando:", query);
      const results = await customerCategoriesApi.searchCategories(query);

      // Guardar en cache (5 minutos)
      customerCacheManager.set(cacheKey, results, 5 * 60 * 1000);

      return results;
    } catch (err) {
      console.error("[CategoriesContext] ❌ Error searching:", err);
      return [];
    }
  }, []);

  // ============================================
  // BÚSQUEDA LOCAL EN ÁRBOL (RÁPIDA)
  // ============================================
  const searchCategoriesLocal = useCallback(
    (query) => {
      if (!query || query.trim().length < 2) return [];

      const lowerQuery = query.toLowerCase();
      return flatCategories.filter(
        (cat) =>
          cat.name.toLowerCase().includes(lowerQuery) ||
          cat.description?.toLowerCase().includes(lowerQuery)
      );
    },
    [flatCategories]
  );

  // ============================================
  // OBTENER CATEGORÍAS POPULARES
  // ============================================
  const getPopularCategories = useCallback(async (limit = 10) => {
    const cacheKey = CATEGORY_CACHE_KEYS.popular();
    const cached = customerCacheManager.get(cacheKey);

    if (cached) {
      console.log("[CategoriesContext] ✅ Populares en cache");
      return cached;
    }

    try {
      console.log("[CategoriesContext] 🔄 Cargando populares...");
      const popular = await customerCategoriesApi.getPopularCategories(limit);

      // Guardar en cache (30 minutos)
      customerCacheManager.set(cacheKey, popular, 30 * 60 * 1000);
      setPopularCategories(popular);

      return popular;
    } catch (err) {
      console.error("[CategoriesContext] ❌ Error getting popular:", err);
      return [];
    }
  }, []);

  // ============================================
  // OBTENER BREADCRUMB DE UNA CATEGORÍA
  // ============================================
  const getBreadcrumb = useCallback(
    (slug) => {
      return customerCategoriesApi.buildBreadcrumb(categoryTree, slug);
    },
    [categoryTree]
  );

  // ============================================
  // VERIFICAR SI UNA CATEGORÍA TIENE HIJOS
  // ============================================
  const hasChildren = useCallback(
    (categorySlug) => {
      const category = findBySlug(categorySlug);
      return category?.children?.length > 0;
    },
    [findBySlug]
  );

  // ============================================
  // OBTENER TODAS LAS CATEGORÍAS (FLAT)
  // ============================================
  const getAllCategories = useCallback(() => {
    return flatCategories;
  }, [flatCategories]);

  // ============================================
  // FILTRAR CATEGORÍAS POR CONDICIÓN
  // ============================================
  const filterCategories = useCallback(
    (predicate) => {
      return flatCategories.filter(predicate);
    },
    [flatCategories]
  );

  // ============================================
  // INVALIDAR CACHE
  // ============================================
  const invalidateCache = useCallback(() => {
    console.log("[CategoriesContext] 🗑️ Invalidando cache...");

    // Limpiar cache
    customerCacheManager.invalidatePattern("categories:");

    // Resetear estado
    setCategoryTree([]);
    setFlatCategories([]);
    setFeaturedCategories([]);
    setPopularCategories([]);

    // Recargar
    loadCategories();
  }, [loadCategories]);

  // ============================================
  // INVALIDAR CACHE PARCIAL (SOLO UNA CATEGORÍA)
  // ============================================
  const invalidateCategoryCache = useCallback((slug) => {
    console.log("[CategoriesContext] 🗑️ Invalidando cache de:", slug);
    const cacheKey = CATEGORY_CACHE_KEYS.detail(slug);
    customerCacheManager.delete(cacheKey);
  }, []);

  // ============================================
  // RECARGAR CATEGORÍAS (FORZAR REFRESH)
  // ============================================
  const refresh = useCallback(async () => {
    console.log("[CategoriesContext] 🔄 Refrescando categorías...");
    invalidateCache();
  }, [invalidateCache]);

  // ============================================
  // ESTADÍSTICAS
  // ============================================
  const getStats = useCallback(() => {
    return {
      totalCategories: flatCategories.length,
      rootCategories: categoryTree.length,
      featuredCount: featuredCategories.length,
      popularCount: popularCategories.length,
      maxLevel: Math.max(...flatCategories.map((cat) => cat.level || 0), 0),
    };
  }, [flatCategories, categoryTree, featuredCategories, popularCategories]);

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================
  const value = {
    // Estado
    categoryTree,
    flatCategories,
    featuredCategories,
    popularCategories,
    isLoading,
    error,
    initialized,

    // Métodos de obtención
    getCategoryBySlug,
    getCategoryById,
    findBySlug,
    getSubcategories,
    getRootCategories,
    getAllCategories,
    getBreadcrumb,

    // Búsqueda
    searchCategories,
    searchCategoriesLocal,

    // Populares y featured
    getPopularCategories,

    // Utilidades
    hasChildren,
    filterCategories,
    getStats,

    // Gestión de cache y recarga
    loadCategories,
    invalidateCache,
    invalidateCategoryCache,
    refresh,
  };

  return (
    <CustomerCategoriesContext.Provider value={value}>
      {children}
    </CustomerCategoriesContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerCategories = () => {
  const context = useContext(CustomerCategoriesContext);
  if (!context) {
    throw new Error(
      "useCustomerCategories must be used within CustomerCategoriesProvider"
    );
  }
  return context;
};

export default CustomerCategoriesContext;
