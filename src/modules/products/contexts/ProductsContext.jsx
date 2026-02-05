import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import  productsAPI  from "../api/products.api";
import { validateProduct, validateStock } from "../schemas/product.schema";

/**
 * @context ProductsContext
 * @description Contexto global para gestión de productos
 * Incluye:
 * - Estado global de productos
 * - Caché de productos
 * - Favoritos
 * - Carrito (integración)
 * - Filtros globales
 *
 * ✅ FIXES APLICADOS:
 * 1. Bug línea 78: eliminado "return newCache"
 * 2. Optimización: flag initialized para evitar llamadas duplicadas
 * 3. Mejora: useRef para productCache mutable
 */

const ProductsContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts debe ser usado dentro de ProductsProvider");
  }
  return context;
};

export const ProductsProvider = ({ children }) => {
  // ========== ESTADO GLOBAL ==========
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ FIX: Usar useRef para caché mutable (evita re-renders innecesarios)
  const productCacheRef = useRef(new Map());
  const [cacheVersion, setCacheVersion] = useState(0); // Trigger para componentes que necesitan actualización

  // Favoritos (sincronizado con localStorage)
  const [favorites, setFavorites] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("product_favorites");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Filtros globales
  const [globalFilters, setGlobalFilters] = useState({
    page: 1,
    limit: 12,
    sort: "createdAt",
    order: "desc",
    status: "active",
    visibility: "public",
  });

  // Paginación
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
  });

  // ✅ FIX: Flag de inicialización para evitar fetch duplicado
  const initialized = useRef(false);

  // ========== FUNCIONES DE PRODUCTOS ==========

  /**
   * Fetch productos con filtros
   */
  const fetchProducts = useCallback(
    async (filters = {}) => {
      try {
        setLoading(true);
        setError(null);

        const mergedFilters = { ...globalFilters, ...filters };
        const response = await productsAPI.getProducts(mergedFilters);

        if (response.success) {
          setProducts(response.data || []);
          setPagination(response.pagination || {});

          // ✅ FIX: Actualizar caché sin crear variable intermedia
          response.data?.forEach((product) => {
            productCacheRef.current.set(product._id, product);
          });
          setCacheVersion((v) => v + 1); // Notificar actualización de caché
        } else {
          setError(response.message || "Error al cargar productos");
          setProducts([]);
        }
      } catch (err) {
        console.error("[ProductsContext] Error fetching products:", err);
        setError(err.response?.data?.message || "Error al cargar productos");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [globalFilters]
  );

  /**
   * Fetch productos destacados
   */
  const fetchFeaturedProducts = useCallback(async (limit = 8) => {
    try {
      const response = await productsAPI.getFeaturedProducts(limit);

      if (response.success) {
        setFeaturedProducts(response.data || []);
      }
    } catch (err) {
      console.error("[ProductsContext] Error fetching featured:", err);
    }
  }, []);

  /**
   * Obtener producto por slug (con caché)
   */
  const getProductBySlug = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar en caché primero
      const cached = Array.from(productCacheRef.current.values()).find(
        (p) => p.slug === slug
      );
      if (cached) {
        setLoading(false);
        return cached;
      }

      const response = await productsAPI.getProductBySlug(slug);

      if (response.success) {
        const product = response.data;

        // Actualizar caché
        productCacheRef.current.set(product._id, product);
        setCacheVersion((v) => v + 1);

        return product;
      } else {
        setError(response.message || "Producto no encontrado");
        return null;
      }
    } catch (err) {
      console.error("[ProductsContext] Error fetching product:", err);
      setError(err.response?.data?.message || "Error al cargar producto");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener producto por ID (con caché)
   */
  const getProductById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      // Buscar en caché
      const cached = productCacheRef.current.get(id);
      if (cached) {
        setLoading(false);
        return cached;
      }

      const response = await productsAPI.getProductById(id);

      if (response.success) {
        const product = response.data;

        // Actualizar caché
        productCacheRef.current.set(product._id, product);
        setCacheVersion((v) => v + 1);

        return product;
      } else {
        setError(response.message || "Producto no encontrado");
        return null;
      }
    } catch (err) {
      console.error("[ProductsContext] Error fetching product by ID:", err);
      setError(err.response?.data?.message || "Error al cargar producto");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar productos
   */
  const searchProducts = useCallback(async (query, limit = 10) => {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await productsAPI.searchProducts(query.trim(), limit);

      if (response.success) {
        return response.data || [];
      }

      return [];
    } catch (err) {
      console.error("[ProductsContext] Error searching products:", err);
      return [];
    }
  }, []);

  /**
   * Verificar stock
   */
  const checkStock = useCallback(async (productId, quantity) => {
    try {
      const response = await productsAPI.checkStock(productId, quantity);

      if (response.success) {
        return response.data;
      }

      return { available: false };
    } catch (err) {
      console.error("[ProductsContext] Error checking stock:", err);
      return { available: false, error: err.response?.data?.message };
    }
  }, []);

  /**
   * Obtener productos relacionados
   */
  const getRelatedProducts = useCallback(async (productId, limit = 4) => {
    try {
      const response = await productsAPI.getRelatedProducts(productId, limit);

      if (response.success) {
        return response.data || [];
      }

      return [];
    } catch (err) {
      console.error("[ProductsContext] Error fetching related products:", err);
      return [];
    }
  }, []);

  // ========== FUNCIONES DE FAVORITOS ==========

  /**
   * Toggle favorito
   */
  const toggleFavorite = useCallback((productId) => {
    setFavorites((prev) => {
      const updated = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      // Sincronizar con localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("product_favorites", JSON.stringify(updated));
      }

      return updated;
    });
  }, []);

  /**
   * Verificar si está en favoritos
   */
  const isFavorite = useCallback(
    (productId) => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  /**
   * Limpiar favoritos
   */
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("product_favorites");
    }
  }, []);

  /**
   * Obtener productos favoritos completos
   */
  const getFavoriteProducts = useCallback(async () => {
    try {
      const favoriteProducts = await Promise.all(
        favorites.map((id) => getProductById(id))
      );

      return favoriteProducts.filter(Boolean);
    } catch (err) {
      console.error("[ProductsContext] Error fetching favorite products:", err);
      return [];
    }
  }, [favorites, getProductById]);

  // ========== FUNCIONES DE FILTROS ==========

  /**
   * Actualizar filtros globales
   */
  const updateFilters = useCallback((newFilters) => {
    setGlobalFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  /**
   * Resetear filtros
   */
  const resetFilters = useCallback(() => {
    setGlobalFilters({
      page: 1,
      limit: 12,
      sort: "createdAt",
      order: "desc",
      status: "active",
      visibility: "public",
    });
  }, []);

  // ========== FUNCIONES DE CACHÉ ==========

  /**
   * Limpiar caché
   */
  const clearCache = useCallback(() => {
    productCacheRef.current.clear();
    setCacheVersion((v) => v + 1);
  }, []);

  /**
   * Invalidar producto en caché
   */
  const invalidateProduct = useCallback((productId) => {
    productCacheRef.current.delete(productId);
    setCacheVersion((v) => v + 1);
  }, []);

  // ========== EFECTOS ==========

  /**
   * ✅ FIX: Cargar productos destacados solo una vez al montar
   */
  useEffect(() => {
    if (!initialized.current) {
      fetchFeaturedProducts();
      initialized.current = true;
    }
  }, [fetchFeaturedProducts]);

  // ========== VALOR DEL CONTEXTO ==========
  const value = {
    // Estado
    products,
    featuredProducts,
    loading,
    error,
    pagination,
    globalFilters,
    favorites,

    // Funciones de productos
    fetchProducts,
    fetchFeaturedProducts,
    getProductBySlug,
    getProductById,
    searchProducts,
    checkStock,
    getRelatedProducts,

    // Funciones de favoritos
    toggleFavorite,
    isFavorite,
    clearFavorites,
    getFavoriteProducts,

    // Funciones de filtros
    updateFilters,
    resetFilters,

    // Funciones de caché
    clearCache,
    invalidateProduct,

    // Utilidades
    productCache: productCacheRef.current,
    cacheVersion, // Para componentes que necesitan observar cambios
    validateProduct,
    validateStock,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export default ProductsContext;
