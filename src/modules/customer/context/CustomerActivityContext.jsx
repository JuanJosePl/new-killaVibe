import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import customerActivityApi, { ACTIVITY_TYPES } from '../api/customerActivity.api';

/**
 * @context CustomerActivityContext
 * @description Tracking automático de actividad del usuario
 * 
 * Responsabilidades:
 * - Tracking automático de page views
 * - Registro de interacciones
 * - Estadísticas en tiempo real
 * - Patrón de comportamiento
 */

const CustomerActivityContext = createContext(null);

export const CustomerActivityProvider = ({ children }) => {
  // Estado
  const [recentActivity, setRecentActivity] = useState([]);
  const [viewedProducts, setViewedProducts] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [behaviorPattern, setBehaviorPattern] = useState(null);
  const [isTracking, setIsTracking] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Refs para tracking
  const pageStartTime = useRef(Date.now());
  const currentPage = useRef(null);

  // Inicializar datos
  useEffect(() => {
    if (!initialized) {
      loadInitialData();
      setInitialized(true);
    }
  }, [initialized]);

  /**
   * Cargar datos iniciales
   */
  const loadInitialData = useCallback(async () => {
    try {
      const [recent, viewed, stats, behavior] = await Promise.all([
        customerActivityApi.getRecentActivity(20),
        customerActivityApi.getProductViews(30),
        customerActivityApi.getUserStats(30),
        customerActivityApi.getBehaviorPattern(),
      ]);

      setRecentActivity(recent);
      setViewedProducts(viewed);
      setUserStats(stats);
      setBehaviorPattern(behavior);
    } catch (err) {
      console.error('Error loading activity data:', err);
    }
  }, []);

  /**
   * Track automático de page view
   */
  const trackPageView = useCallback(
    (pageName) => {
      if (!isTracking) return;

      // Calcular duración de la página anterior
      const duration = Date.now() - pageStartTime.current;

      // Si había una página anterior, registrar su duración
      if (currentPage.current) {
        customerActivityApi
          .trackPageView(currentPage.current, duration)
          .catch((err) => console.error('Error tracking page view:', err));
      }

      // Actualizar página actual
      currentPage.current = pageName;
      pageStartTime.current = Date.now();
    },
    [isTracking]
  );

  /**
   * Track product view
   */
  const trackProductView = useCallback(
    async (product) => {
      if (!isTracking || !product) return;

      try {
        await customerActivityApi.trackProductView(product);
        
        // Actualizar lista de productos vistos
        setViewedProducts((prev) => {
          const exists = prev.find((p) => p.productId === product._id);
          if (exists) {
            return prev.map((p) =>
              p.productId === product._id
                ? { ...p, viewCount: p.viewCount + 1, lastViewed: new Date() }
                : p
            );
          }
          return [
            {
              productId: product._id,
              productName: product.name,
              productSlug: product.slug,
              viewCount: 1,
              lastViewed: new Date(),
            },
            ...prev,
          ].slice(0, 20);
        });
      } catch (err) {
        console.error('Error tracking product view:', err);
      }
    },
    [isTracking]
  );

  /**
   * Track category view
   */
  const trackCategoryView = useCallback(
    (category) => {
      if (!isTracking || !category) return;

      customerActivityApi
        .trackCategoryView(category)
        .catch((err) => console.error('Error tracking category view:', err));
    },
    [isTracking]
  );

  /**
   * Track search
   */
  const trackSearch = useCallback(
    (query, resultsCount = 0) => {
      if (!isTracking || !query) return;

      customerActivityApi
        .trackSearch(query, resultsCount)
        .catch((err) => console.error('Error tracking search:', err));
    },
    [isTracking]
  );

  /**
   * Track add to cart
   */
  const trackAddToCart = useCallback(
    (product, quantity = 1) => {
      if (!isTracking || !product) return;

      customerActivityApi
        .trackAddToCart(product, quantity)
        .catch((err) => console.error('Error tracking add to cart:', err));
    },
    [isTracking]
  );

  /**
   * Track checkout started
   */
  const trackCheckoutStarted = useCallback(
    (cartTotal, itemCount) => {
      if (!isTracking) return;

      customerActivityApi
        .trackCheckoutStarted(cartTotal, itemCount)
        .catch((err) => console.error('Error tracking checkout:', err));
    },
    [isTracking]
  );

  /**
   * Track order completed
   */
  const trackOrderCompleted = useCallback(
    (order) => {
      if (!isTracking || !order) return;

      customerActivityApi
        .trackOrderCompleted(order)
        .catch((err) => console.error('Error tracking order:', err));
    },
    [isTracking]
  );

  /**
   * Recargar estadísticas
   */
  const refreshStats = useCallback(async () => {
    try {
      const [stats, behavior] = await Promise.all([
        customerActivityApi.getUserStats(30),
        customerActivityApi.getBehaviorPattern(),
      ]);
      setUserStats(stats);
      setBehaviorPattern(behavior);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, []);

  /**
   * Habilitar/deshabilitar tracking
   */
  const toggleTracking = useCallback((enabled) => {
    setIsTracking(enabled);
  }, []);

  /**
   * Limpiar datos de actividad local
   */
  const clearLocalActivity = useCallback(() => {
    setRecentActivity([]);
    setViewedProducts([]);
    setUserStats(null);
    setBehaviorPattern(null);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      // Registrar duración final de la página
      if (currentPage.current && isTracking) {
        const duration = Date.now() - pageStartTime.current;
        customerActivityApi
          .trackPageView(currentPage.current, duration)
          .catch((err) => console.error('Error tracking final page view:', err));
      }
    };
  }, [isTracking]);

  const value = {
    // Estado
    recentActivity,
    viewedProducts,
    userStats,
    behaviorPattern,
    isTracking,
    initialized,

    // Métodos de tracking
    trackPageView,
    trackProductView,
    trackCategoryView,
    trackSearch,
    trackAddToCart,
    trackCheckoutStarted,
    trackOrderCompleted,

    // Métodos de gestión
    refreshStats,
    toggleTracking,
    clearLocalActivity,
    loadInitialData,

    // Constantes
    ACTIVITY_TYPES,
  };

  return (
    <CustomerActivityContext.Provider value={value}>
      {children}
    </CustomerActivityContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerActivity = () => {
  const context = useContext(CustomerActivityContext);
  if (!context) {
    throw new Error('useCustomerActivity must be used within CustomerActivityProvider');
  }
  return context;
};

export default CustomerActivityContext;