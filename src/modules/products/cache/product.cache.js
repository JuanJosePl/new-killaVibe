/**
 * @module product.cache
 * @description Entity cache singleton para productos.
 *
 * CARACTERÍSTICAS:
 * - Singleton de JavaScript puro (no React, no Zustand, no Context)
 * - TTL configurable por entrada
 * - Índice primario por _id (O(1))
 * - Índice secundario por slug (O(1))
 * - Límite máximo de entidades (evita memory leak)
 * - Evicción LRU simplificada (elimina el menos usado al llegar al límite)
 * - No genera re-renders: los hooks preguntan, no se suscriben
 *
 * USO:
 *   import productCache from '../cache/product.cache';
 *   const product = productCache.get('507f...');
 *   productCache.set(product);
 */

import { CACHE_CONFIG } from '../types/product.types';

// ─────────────────────────────────────────────
// ESTRUCTURA INTERNA
// ─────────────────────────────────────────────

/**
 * @typedef {Object} CacheEntry
 * @property {import('../domain/product.entity').Product} product
 * @property {number} expiresAt     - timestamp en ms
 * @property {number} lastAccessedAt - timestamp en ms (para LRU)
 */

/**
 * Crea una nueva instancia de caché.
 * Exportamos la instancia singleton al final del archivo.
 *
 * @param {Object} config
 * @param {number} config.maxEntities
 * @param {number} config.defaultTTL
 */
const createProductCache = ({
  maxEntities = CACHE_CONFIG.MAX_ENTITIES,
  defaultTTL = CACHE_CONFIG.ENTITY_TTL_MS,
} = {}) => {
  /** @type {Map<string, CacheEntry>} Índice por _id */
  const byId = new Map();

  /** @type {Map<string, string>} slug → _id */
  const slugIndex = new Map();

  // ─────────────────────────────────────────────
  // HELPERS INTERNOS
  // ─────────────────────────────────────────────

  const isExpired = (entry) => Date.now() > entry.expiresAt;

  const touchEntry = (entry) => {
    entry.lastAccessedAt = Date.now();
  };

  /**
   * Elimina la entrada menos usada (LRU) cuando se supera maxEntities.
   */
  const evictLRU = () => {
    if (byId.size < maxEntities) return;

    let lruId = null;
    let lruTime = Infinity;

    for (const [id, entry] of byId.entries()) {
      if (entry.lastAccessedAt < lruTime) {
        lruTime = entry.lastAccessedAt;
        lruId = id;
      }
    }

    if (lruId) {
      const entry = byId.get(lruId);
      if (entry?.product?.slug) {
        slugIndex.delete(entry.product.slug);
      }
      byId.delete(lruId);
    }
  };

  // ─────────────────────────────────────────────
  // API PÚBLICA
  // ─────────────────────────────────────────────

  return {
    /**
     * Obtiene un producto por _id.
     * Retorna null si no existe o si expiró (lazy expiry).
     *
     * @param {string} id
     * @returns {import('../domain/product.entity').Product|null}
     */
    get(id) {
      if (!id) return null;
      const entry = byId.get(id);
      if (!entry) return null;
      if (isExpired(entry)) {
        this.invalidate(id);
        return null;
      }
      touchEntry(entry);
      return entry.product;
    },

    /**
     * Obtiene un producto por slug.
     * O(1) gracias al índice secundario.
     *
     * @param {string} slug
     * @returns {import('../domain/product.entity').Product|null}
     */
    getBySlug(slug) {
      if (!slug) return null;
      const id = slugIndex.get(slug);
      if (!id) return null;
      return this.get(id);
    },

    /**
     * Almacena un producto en el caché.
     * Si ya existe, lo sobreescribe y actualiza TTL.
     *
     * @param {import('../domain/product.entity').Product} product
     * @param {number} [ttl]  - TTL en ms. Default: CACHE_CONFIG.ENTITY_TTL_MS
     */
    set(product, ttl = defaultTTL) {
      if (!product?._id) return;

      evictLRU();

      const now = Date.now();
      const entry = {
        product,
        expiresAt: now + ttl,
        lastAccessedAt: now,
      };

      byId.set(product._id, entry);

      if (product.slug) {
        slugIndex.set(product.slug, product._id);
      }
    },

    /**
     * Almacena múltiples productos.
     *
     * @param {import('../domain/product.entity').Product[]} products
     * @param {number} [ttl]
     */
    setMany(products, ttl = defaultTTL) {
      if (!Array.isArray(products)) return;
      products.forEach((p) => this.set(p, ttl));
    },

    /**
     * Invalida (elimina) una entrada por _id.
     *
     * @param {string} id
     */
    invalidate(id) {
      if (!id) return;
      const entry = byId.get(id);
      if (entry?.product?.slug) {
        slugIndex.delete(entry.product.slug);
      }
      byId.delete(id);
    },

    /**
     * Invalida una entrada por slug.
     *
     * @param {string} slug
     */
    invalidateBySlug(slug) {
      if (!slug) return;
      const id = slugIndex.get(slug);
      if (id) this.invalidate(id);
    },

    /**
     * Limpia todo el caché.
     */
    invalidateAll() {
      byId.clear();
      slugIndex.clear();
    },

    /**
     * Número de entradas actualmente en caché (incluyendo expiradas no limpiadas aún).
     * @returns {number}
     */
    size() {
      return byId.size;
    },

    /**
     * Elimina proactivamente todas las entradas expiradas.
     * Llamar en unmount del provider raíz si se desea limpieza proactiva.
     */
    cleanup() {
      for (const [id, entry] of byId.entries()) {
        if (isExpired(entry)) {
          this.invalidate(id);
        }
      }
    },

    /**
     * Devuelve todos los productos en caché (sin expirados).
     * Útil para debugging.
     * @returns {import('../domain/product.entity').Product[]}
     */
    getAll() {
      const result = [];
      for (const [id, entry] of byId.entries()) {
        if (!isExpired(entry)) {
          result.push(entry.product);
        } else {
          this.invalidate(id);
        }
      }
      return result;
    },
  };
};

// ─────────────────────────────────────────────
// SINGLETON
// ─────────────────────────────────────────────

/**
 * Instancia global singleton del entity cache.
 * No genera re-renders. Los hooks consultan directamente.
 */
const productCache = createProductCache();

export default productCache;

// Exportar factory para testing
export { createProductCache };