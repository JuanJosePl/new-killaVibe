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

/**
 * @context CustomerProductsContext
 * @description Gestión global de productos para customer panel
 *
 * Responsabilidades:
 * - Estado global de productos
 * - Cache de productos visitados
 * - Historial de navegación
 * - Productos destacados
 * - Manejo de errores y loading
 */

const CustomerProductsContext = createContext(null);

export const CustomerProductsProvider = ({ children }) => {
  // ============================================
  // ESTADO
  // ============================================
  const [visitedProducts, setVisitedProducts] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // ============================================
  // INICIALIZACIÓN
  // ============================================
  useEffect(() => {
    if (!initialized) {
      loadFeaturedProducts();
      setInitialized(true);
    }
  }, [initialized]);

  // ============================================
  // CARGAR PRODUCTOS DESTACADOS
  // ============================================
  const loadFeaturedProducts = useCallback(async () => {
    // Verificar cache primero
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

      // Guardar en cache (10 minutos)
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

  // ============================================
  // REGISTRAR PRODUCTO VISITADO
  // ============================================
  const visitProduct = useCallback((product) => {
    if (!product || !product._id) return;

    setVisitedProducts((prev) => {
      const exists = prev.find((p) => p._id === product._id);

      if (exists) {
        // Mover al inicio
        return [
          { ...product, visitedAt: Date.now() },
          ...prev.filter((p) => p._id !== product._id),
        ];
      }

      // Agregar nuevo (máximo 20)
      return [{ ...product, visitedAt: Date.now() }, ...prev].slice(0, 20);
    });

    // Actualizar recientemente vistos
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p._id !== product._id);
      return [product, ...filtered].slice(0, 10);
    });
  }, []);

  // ============================================
  // OBTENER PRODUCTOS CON CACHE
  // ============================================
  const getProducts = useCallback(async (filters = {}) => {
    const cacheKey = PRODUCT_CACHE_KEYS.list(filters);

    // Verificar cache
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result = await customerProductsApi.getProducts(filters);

      // Guardar en cache (5 minutos)
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

  // ============================================
  // OBTENER PRODUCTO POR SLUG
  // ============================================
  const getProductBySlug = useCallback(
    async (slug) => {
      const cacheKey = PRODUCT_CACHE_KEYS.detail(slug);

      // Verificar cache
      const cached = customerCacheManager.get(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        setIsLoading(true);
        setError(null);

        const product = await customerProductsApi.getProductBySlug(slug);

        // Guardar en cache (10 minutos)
        customerCacheManager.set(cacheKey, product, 10 * 60 * 1000);

        // Registrar visita
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

  // ============================================
  // OBTENER PRODUCTOS RELACIONADOS
  // ============================================
  const getRelatedProducts = useCallback(async (productId, limit = 4) => {
    const cacheKey = PRODUCT_CACHE_KEYS.related(productId);

    // Verificar cache
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await customerProductsApi.getRelatedProducts(
        productId,
        limit
      );

      // Guardar en cache (10 minutos)
      customerCacheManager.set(cacheKey, data, 10 * 60 * 1000);

      return data;
    } catch (err) {
      console.error("[CustomerProductsContext] Error loading related:", err);
      return [];
    }
  }, []);

  // ============================================
  // BUSCAR PRODUCTOS
  // ============================================
  const searchProducts = useCallback(async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const cacheKey = PRODUCT_CACHE_KEYS.search(query);

    // Verificar cache
    const cached = customerCacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      setIsLoading(true);
      setError(null);

      const data = await customerProductsApi.searchProducts(query, limit);

      // Guardar en cache (5 minutos)
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

  // ============================================
  // VERIFICAR STOCK
  // ============================================
  const checkStock = useCallback(async (productId, quantity) => {
    try {
      const result = await customerProductsApi.checkStock(productId, quantity);
      return { success: true, data: result };
    } catch (err) {
      const normalized = customerErrorNormalizer(err);
      return { success: false, error: normalized };
    }
  }, []);

  // ============================================
  // LIMPIAR HISTORIAL
  // ============================================
  const clearVisitedProducts = useCallback(() => {
    setVisitedProducts([]);
    setRecentlyViewed([]);
  }, []);

  // ============================================
  // INVALIDAR CACHE
  // ============================================
  const invalidateCache = useCallback(() => {
    customerCacheManager.invalidatePattern("products:");
    setFeaturedProducts([]);
    loadFeaturedProducts();
  }, [loadFeaturedProducts]);

  // ============================================
  // VALOR DEL CONTEXTO
  // ============================================
  const value = {
    // Estado
    visitedProducts,
    recentlyViewed,
    featuredProducts,
    isLoading,
    error,
    initialized,

    // Métodos
    visitProduct,
    getProducts,
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

/**
 * Hook para consumir el contexto
 */
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
