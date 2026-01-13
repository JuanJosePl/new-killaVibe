// src/modules/customer/api/customerActivity.api.js

import customerApiClient from '../utils/customerApiClient';
import customerCacheManager, { ACTIVITY_CACHE_KEYS } from '../utils/customerCacheManager';

/**
 * @description API para UserActivity (tracking + analytics)
 * 
 * ✅ Customer puede: Registrar actividades, ver propias estadísticas
 * ❌ Customer NO puede: Ver carritos abandonados (admin only)
 * 
 * Endpoints:
 * - POST /api/activity
 * - GET /api/activity/recent
 * - GET /api/activity/products/viewed
 * - GET /api/activity/stats
 * - GET /api/activity/behavior
 */

/**
 * Tipos de actividad disponibles
 */
export const ACTIVITY_TYPES = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  CATEGORY_VIEW: 'category_view',
  SEARCH: 'search',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
  CHECKOUT_STARTED: 'checkout_started',
  ORDER_COMPLETED: 'order_completed',
  REVIEW_CREATED: 'review_created',
  LOGIN: 'login',
  LOGOUT: 'logout',
  REGISTER: 'register',
};

/**
 * Registrar actividad del usuario
 * 
 * @param {Object} activityData
 * @param {string} activityData.activityType - Tipo de actividad
 * @param {Object} activityData.resource - Recurso relacionado (opcional)
 * @param {string} activityData.resource.resourceType - 'product', 'category', 'order', 'page', 'search'
 * @param {string} activityData.resource.resourceId - ID del recurso
 * @param {string} activityData.resource.resourceName - Nombre del recurso
 * @param {string} activityData.resource.resourceSlug - Slug del recurso
 * @param {Object} activityData.metadata - Metadata adicional (opcional)
 * @param {number} activityData.duration - Duración en ms (opcional, para page_view)
 * 
 * @returns {Promise<Object>} Activity
 */
export const logActivity = async (activityData) => {
  // No cachear actividades (siempre registrar)
  const response = await customerApiClient.post('/activity', activityData);
  
  // Invalidar cache de estadísticas después de registrar
  const userId = localStorage.getItem('userId');
  if (userId) {
    customerCacheManager.delete(ACTIVITY_CACHE_KEYS.stats(userId));
    customerCacheManager.delete(ACTIVITY_CACHE_KEYS.recent(userId));
  }
  
  return response.data;
};

/**
 * Obtener actividad reciente del usuario
 * 
 * @param {number} limit - Límite (default: 50, max: 1000)
 * @returns {Promise<Array>} Activities
 */
export const getRecentActivity = async (limit = 50) => {
  const userId = localStorage.getItem('userId');
  if (!userId) return [];

  const cacheKey = ACTIVITY_CACHE_KEYS.recent(userId);
  
  return await customerCacheManager.getOrSet(
    cacheKey,
    async () => {
      const response = await customerApiClient.get('/activity/recent', {
        params: { limit },
      });
      return response.data;
    },
    2 * 60 * 1000 // 2 minutos
  );
};

/**
 * Obtener productos vistos recientemente
 * 
 * @param {number} days - Días hacia atrás (default: 30)
 * @returns {Promise<Array>} Product views con estadísticas
 * 
 * Response: [
 *   {
 *     productId,
 *     productName,
 *     productSlug,
 *     viewCount,
 *     lastViewed
 *   }
 * ]
 */
export const getProductViews = async (days = 30) => {
  const userId = localStorage.getItem('userId');
  if (!userId) return [];

  const cacheKey = ACTIVITY_CACHE_KEYS.viewed(userId);
  
  return await customerCacheManager.getOrSet(
    cacheKey,
    async () => {
      const response = await customerApiClient.get('/activity/products/viewed', {
        params: { days },
      });
      return response.data;
    },
    5 * 60 * 1000 // 5 minutos
  );
};

/**
 * Obtener estadísticas de actividad del usuario
 * 
 * @param {number} days - Días hacia atrás (default: 30)
 * @returns {Promise<Object>} Stats
 * 
 * Response: {
 *   period: { days, startDate },
 *   activities: {
 *     product_view: 45,
 *     add_to_cart: 12,
 *     ...
 *   },
 *   totalActivities: 59
 * }
 */
export const getUserStats = async (days = 30) => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  const cacheKey = ACTIVITY_CACHE_KEYS.stats(userId);
  
  return await customerCacheManager.getOrSet(
    cacheKey,
    async () => {
      const response = await customerApiClient.get('/activity/stats', {
        params: { days },
      });
      return response.data;
    },
    10 * 60 * 1000 // 10 minutos
  );
};

/**
 * Obtener patrón de comportamiento del usuario
 * 
 * @returns {Promise<Object>} Behavior pattern
 * 
 * Response: {
 *   isActiveUser: Boolean,
 *   isFrequentBuyer: Boolean,
 *   browsesOften: Boolean,
 *   abandonsCart: Boolean,
 *   usesWishlist: Boolean,
 *   topViewedProducts: [...]
 * }
 */
export const getBehaviorPattern = async () => {
  const userId = localStorage.getItem('userId');
  if (!userId) return null;

  return await customerCacheManager.getOrSet(
    `activity:behavior:${userId}`,
    async () => {
      const response = await customerApiClient.get('/activity/behavior');
      return response.data;
    },
    15 * 60 * 1000 // 15 minutos
  );
};

/**
 * Helpers para tracking automático
 */

/**
 * Track page view con duración
 */
export const trackPageView = (pageName, duration = 0) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.PAGE_VIEW,
    resource: {
      resourceType: 'page',
      resourceName: pageName,
    },
    duration,
  });
};

/**
 * Track product view
 */
export const trackProductView = (product) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.PRODUCT_VIEW,
    resource: {
      resourceType: 'product',
      resourceId: product._id || product.id,
      resourceName: product.name,
      resourceSlug: product.slug,
    },
  });
};

/**
 * Track category view
 */
export const trackCategoryView = (category) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.CATEGORY_VIEW,
    resource: {
      resourceType: 'category',
      resourceId: category._id || category.id,
      resourceName: category.name,
      resourceSlug: category.slug,
    },
  });
};

/**
 * Track search
 */
export const trackSearch = (query, resultsCount = 0) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.SEARCH,
    resource: {
      resourceType: 'search',
      resourceName: query,
    },
    metadata: {
      resultsCount,
    },
  });
};

/**
 * Track add to cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.ADD_TO_CART,
    resource: {
      resourceType: 'product',
      resourceId: product._id || product.id,
      resourceName: product.name,
    },
    metadata: {
      quantity,
      price: product.price,
    },
  });
};

/**
 * Track checkout started
 */
export const trackCheckoutStarted = (cartTotal, itemCount) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.CHECKOUT_STARTED,
    metadata: {
      cartTotal,
      itemCount,
    },
  });
};

/**
 * Track order completed
 */
export const trackOrderCompleted = (order) => {
  return logActivity({
    activityType: ACTIVITY_TYPES.ORDER_COMPLETED,
    resource: {
      resourceType: 'order',
      resourceId: order._id || order.id,
      resourceName: order.orderNumber,
    },
    metadata: {
      totalAmount: order.totalAmount,
      itemsCount: order.itemsCount,
    },
  });
};

export default {
  logActivity,
  getRecentActivity,
  getProductViews,
  getUserStats,
  getBehaviorPattern,
  trackPageView,
  trackProductView,
  trackCategoryView,
  trackSearch,
  trackAddToCart,
  trackCheckoutStarted,
  trackOrderCompleted,
  ACTIVITY_TYPES,
};