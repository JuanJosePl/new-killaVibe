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
 */

const CustomerCategoriesContext = createContext(null);

export const CustomerCategoriesProvider = ({ children }) => {
  // ============================================
  // ESTADO
  // ============================================
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState([]);
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
  // CARGAR CATEGORÍAS
  // ============================================
  const loadCategories = useCallback(async () => {
    const cachedTree = customerCacheManager.get(CATEGORY_CACHE_KEYS.tree());
    const cachedFeatured = customerCacheManager.get(
      CATEGORY_CACHE_KEYS.featured()
    );

    if (cachedTree && cachedFeatured) {
      console.log("[CategoriesContext] Usando cache");
      setCategoryTree(cachedTree);
      setFlatCategories(customerCategoriesApi.flattenCategoryTree(cachedTree));
      setFeaturedCategories(cachedFeatured);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("[CategoriesContext] Cargando desde API...");

      const [tree, featured] = await Promise.all([
        customerCategoriesApi.getCategoryTree(),
        customerCategoriesApi.getFeaturedCategories(6),
      ]);

      console.log("[CategoriesContext] Árbol:", tree);
      console.log("[CategoriesContext] Featured:", featured);

      setCategoryTree(tree);
      setFlatCategories(customerCategoriesApi.flattenCategoryTree(tree));
      setFeaturedCategories(featured);

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
      console.error("[CategoriesContext] Error loading:", err);
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
      console.log("[CategoriesContext] Categoría en cache:", slug);
      return cached;
    }

    try {
      console.log("[CategoriesContext] Cargando categoría:", slug);
      const category = await customerCategoriesApi.getCategoryBySlug(slug);
      console.log("[CategoriesContext] Categoría cargada:", category);

      customerCacheManager.set(cacheKey, category, 15 * 60 * 1000);
      return category;
    } catch (err) {
      console.error("[CategoriesContext] Error loading category:", err);
      throw err;
    }
  }, []);

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
  // BÚSQUEDA
  // ============================================
  const searchCategories = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return [];

    try {
      const results = await customerCategoriesApi.searchCategories(query);
      return results;
    } catch (err) {
      console.error("[CategoriesContext] Error searching:", err);
      return [];
    }
  }, []);

  // ============================================
  // POPULAR
  // ============================================
  const getPopularCategories = useCallback(async (limit = 10) => {
    try {
      const popular = await customerCategoriesApi.getPopularCategories(limit);
      return popular;
    } catch (err) {
      console.error("[CategoriesContext] Error getting popular:", err);
      return [];
    }
  }, []);

  // ============================================
  // INVALIDAR CACHE
  // ============================================
  const invalidateCache = useCallback(() => {
    customerCacheManager.invalidatePattern("categories:");
    setCategoryTree([]);
    setFlatCategories([]);
    setFeaturedCategories([]);
    loadCategories();
  }, [loadCategories]);

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================
  const value = {
    categoryTree,
    flatCategories,
    featuredCategories,
    isLoading,
    error,
    initialized,
    getCategoryBySlug,
    findBySlug,
    getSubcategories,
    searchCategories,
    getPopularCategories,
    loadCategories,
    invalidateCache,
  };

  return (
    <CustomerCategoriesContext.Provider value={value}>
      {children}
    </CustomerCategoriesContext.Provider>
  );
};

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
