// src/modules/customer/context/CustomerProductsContext.jsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import * as customerProductsApi from "../api/customerProducts.api";
import { customerErrorNormalizer } from "../utils/customerErrorNormalizer";
import customerCacheManager, {
  PRODUCT_CACHE_KEYS,
} from "../utils/customerCacheManager";

const CustomerProductsContext = createContext(null);

export const CustomerProductsProvider = ({ children }) => {
  const [visitedProducts, setVisitedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      loadFeaturedProducts();
      setInitialized(true);
    }
  }, [initialized]);

  const loadFeaturedProducts = useCallback(async () => {
    const cached = customerCacheManager.get(PRODUCT_CACHE_KEYS.featured());
    if (cached) {
      setFeaturedProducts(cached);
      return cached;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await customerProductsApi.getFeaturedProducts(8);
      setFeaturedProducts(data);
      customerCacheManager.set(
        PRODUCT_CACHE_KEYS.featured(),
        data,
        10 * 60 * 1000
      );
      return data;
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      setError(normalized.message);
      console.error("[CustomerProductsContext] Error loading featured:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const visitProduct = useCallback((product) => {
    if (!product || !product._id) return;
    setVisitedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id);
      if (exists) {
        return [
          { ...product, visitedAt: Date.now() },
          ...prev.filter((p) => p._id !== product._id),
        ];
      }
      return [{ ...product, visitedAt: Date.now() }, ...prev].slice(0, 20);
    });
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      return [product, ...filtered].slice(0, 10);
    });
  }, []);

  const getProducts = useCallback(async (filters = {}) => {
    const cacheKey = PRODUCT_CACHE_KEYS.list(filters);
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      setIsLoading(true);
      setError(null);
      const result = await customerProductsApi.getProducts(filters);
      customerCacheManager.set(cacheKey, result, 5 * 60 * 1000);
      return result;
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      setError(normalized.message);
      console.error("[CustomerProductsContext] Error loading products:", err);
      return {
        products: [],
        pagination: {
          current: 1,
          pages: 1,
          total: 0,
          limit: 12,
        },
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductsByCategory = useCallback(
    async (categorySlug, filters = {}) => {
      console.log(
        "[CustomerProductsContext] ✅ getProductsByCategory:",
        categorySlug
      );
      const cacheKey = PRODUCT_CACHE_KEYS.category(categorySlug, filters);
      const cached = customerCacheManager.get(cacheKey);
      if (cached) {
        console.log("[CustomerProductsContext] ✅ Cache hit");
        return cached;
      }
      try {
        setIsLoading(true);
        setError(null);
        const result = await customerProductsApi.getProducts({
          ...filters,
          category: categorySlug,
        });
        console.log(
          "[CustomerProductsContext] ✅ Productos cargados:",
          result.products?.length
        );
        customerCacheManager.set(cacheKey, result, 5 * 60 * 1000);
        return result;
      } catch (err) {
        const normalized = customerErrorNormalizer(err);
        setError(normalized.message);
        console.error(
          "[CustomerProductsContext] ❌ Error loading category products:",
          err
        );
        return {
          products: [],
          pagination: {
            current: 1,
            pages: 1,
            total: 0,
            limit: 12,
          },
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getProductBySlug = useCallback(
    async (slug) => {
      const cacheKey = PRODUCT_CACHE_KEYS.detail(slug);
      const cached = customerCacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }
      try {
        setIsLoading(true);
        setError(null);
        const product = await customerProductsApi.getProductBySlug(slug);
        customerCacheManager.set(cacheKey, product, 10 * 60 * 1000);
        visitProduct(product);
        return product;
      } catch (err) {
        const normalized = customerErrorNormalizer(err);
        setError(normalized.message);
        console.error("[CustomerProductsContext] Error loading product:", err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [visitProduct]
  );

  const getRelatedProducts = useCallback(async (productId, limit = 4) => {
    const cacheKey = PRODUCT_CACHE_KEYS.related(productId);
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      const data = await customerProductsApi.getRelatedProducts(
        productId,
        limit
      );
      customerCacheManager.set(cacheKey, data, 10 * 60 * 1000);
      return data;
    } catch (err) {
      console.error("[CustomerProductsContext] Error loading related:", err);
      return [];
    }
  }, []);

  const searchProducts = useCallback(async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    const cacheKey = PRODUCT_CACHE_KEYS.search(query);
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerProductsApi.searchProducts(query, limit);
      customerCacheManager.set(cacheKey, data, 5 * 60 * 1000);
      return data;
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      setError(normalized.message);
      console.error("[CustomerProductsContext] Error searching:", err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkStock = useCallback(async (productId, quantity) => {
    try {
      const result = await customerProductsApi.checkStock(productId, quantity);
      return { success: true, data: result };
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      return { success: false, error: normalized };
    }
  }, []);

  const clearVisitedProducts = useCallback(() => {
    setVisitedProducts([]);
    setRecentlyViewed([]);
  }, []);

  const invalidateCache = useCallback(() => {
    customerCacheManager.invalidatePattern("products:");
    setFeaturedProducts([]);
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  const value = {
    visitedProducts,
    recentlyViewed,
    featuredProducts,
    isLoading,
    error,
    initialized,
    visitProduct,
    getProducts,
    getProductsByCategory,
    getProductBySlug,
    getRelatedProducts,
    searchProducts,
    checkStock,
    clearVisitedProducts,
    loadFeaturedProducts,
    invalidateCache,
  };

  return (
    <CustomerProductsContext.Provider value={value}>
      {children}
    </CustomerProductsContext.Provider>
  );
};

export const useCustomerProducts = () => {
  const context = useContext(CustomerProductsContext);
  if (!context) {
    throw new Error(
      "useCustomerProducts must be used within CustomerProductsProvider"
    );
  }
  return context;
};

export default CustomerProductsContext;
