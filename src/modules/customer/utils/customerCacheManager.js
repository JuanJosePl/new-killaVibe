// src/modules/customer/utils/customerCacheManager.js

/**
 * @description Gestión de cache en memoria para Customer Panel
 *
 * Responsabilidades:
 * - Cache de productos, categorías
 * - TTL (Time To Live) configurable
 * - Invalidación manual y automática
 * - Prevención de memory leaks
 *
 * ⚠️ CRÍTICO: NO usa localStorage (no soportado en artifacts)
 */

class CustomerCacheManager {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  /**
   * Almacenar en cache
   */
  set(key, value, ttl = this.defaultTTL) {
    this.cache.set(key, value);

    // Configurar expiración
    if (ttl > 0) {
      const expiresAt = Date.now() + ttl;
      this.ttls.set(key, expiresAt);

      // Auto-limpiar después del TTL
      setTimeout(() => {
        this.delete(key);
      }, ttl);
    }

    return value;
  }

  /**
   * Obtener de cache
   */
  get(key) {
    // Verificar si existe
    if (!this.cache.has(key)) {
      return null;
    }

    // Verificar si expiró
    if (this.isExpired(key)) {
      this.delete(key);
      return null;
    }

    return this.cache.get(key);
  }

  /**
   * Verificar si una key existe y es válida
   */
  has(key) {
    return this.cache.has(key) && !this.isExpired(key);
  }

  /**
   * Eliminar del cache
   */
  delete(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
  }

  /**
   * Limpiar todo el cache
   */
  clear() {
    this.cache.clear();
    this.ttls.clear();
  }

  /**
   * Verificar si una key expiró
   */
  isExpired(key) {
    if (!this.ttls.has(key)) {
      return false;
    }

    const expiresAt = this.ttls.get(key);
    return Date.now() > expiresAt;
  }

  /**
   * Obtener todas las keys
   */
  keys() {
    return Array.from(this.cache.keys());
  }

  /**
   * Obtener tamaño del cache
   */
  size() {
    return this.cache.size;
  }

  /**
   * Invalidar por patrón (regex o string)
   */
  invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    const keysToDelete = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Obtener o establecer (cache-aside pattern)
   */
  async getOrSet(key, fetchFn, ttl = this.defaultTTL) {
    // Intentar obtener del cache
    const cached = this.get(key);
    if (cached !== null) {
      return cached;
    }

    // Si no existe, obtener de la fuente
    try {
      const value = await fetchFn();
      this.set(key, value, ttl);
      return value;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Limpiar cache expirado (manualmente)
   */
  cleanup() {
    const now = Date.now();
    const keysToDelete = [];

    for (const [key, expiresAt] of this.ttls.entries()) {
      if (now > expiresAt) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => this.delete(key));
    return keysToDelete.length;
  }

  /**
   * Obtener estadísticas del cache
   */
  getStats() {
    return {
      size: this.size(),
      keys: this.keys(),
      expired: Array.from(this.ttls.entries())
        .filter(([, expiresAt]) => Date.now() > expiresAt)
        .map(([key]) => key),
    };
  }
}

// Singleton para uso global
const customerCacheManager = new CustomerCacheManager();

export default customerCacheManager;

/**
 * ============================================
 * CACHE KEYS - HELPERS ESPECÍFICOS
 * ============================================
 */

/**
 * Cache keys para productos
 */
export const PRODUCT_CACHE_KEYS = {
  list: (filters) => `products:list:${JSON.stringify(filters)}`,
  detail: (slug) => `products:detail:${slug}`,
  featured: () => "products:featured",
  topSelling: () => "products:top-selling",
  related: (productId) => `products:related:${productId}`,
  search: (query) => `products:search:${query}`,
};

/**
 * Cache keys para categorías
 */
export const CATEGORY_CACHE_KEYS = {
  list: (filters) => `categories:list:${JSON.stringify(filters)}`,
  tree: () => "categories:tree",
  featured: () => "categories:featured",
  popular: () => "categories:popular",
  detail: (slug) => `categories:detail:${slug}`,
  search: (query) => `categories:search:${query}`,
};

/**
 * Cache keys para actividad
 */
export const ACTIVITY_CACHE_KEYS = {
  recent: (userId) => `activity:recent:${userId}`,
  viewed: (userId) => `activity:viewed:${userId}`,
  stats: (userId) => `activity:stats:${userId}`,
};

/**
 * ============================================
 * UTILIDADES DE CACHE
 * ============================================
 */

/**
 * Limpiar todo el cache de productos
 */
export const clearProductsCache = () => {
  return customerCacheManager.invalidatePattern('^products:');
};

/**
 * Limpiar todo el cache de categorías
 */
export const clearCategoriesCache = () => {
  return customerCacheManager.invalidatePattern('^categories:');
};

/**
 * Limpiar todo el cache de actividad
 */
export const clearActivityCache = () => {
  return customerCacheManager.invalidatePattern('^activity:');
};

/**
 * Limpiar todo el cache del customer panel
 */
export const clearAllCustomerCache = () => {
  customerCacheManager.clear();
  console.log('[Cache] Todo el cache ha sido limpiado');
};

/**
 * Ejecutar limpieza automática del cache expirado
 */
export const runCacheCleanup = () => {
  const removed = customerCacheManager.cleanup();
  console.log(`[Cache] Limpieza ejecutada: ${removed} items removidos`);
  return removed;
};

/**
 * Obtener estadísticas del cache
 */
export const getCacheStats = () => {
  const stats = customerCacheManager.getStats();
  console.log('[Cache] Estadísticas:', stats);
  return stats;
};