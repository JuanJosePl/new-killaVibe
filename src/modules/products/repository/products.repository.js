/**
 * @module products.repository
 * @description Única puerta de entrada a la infraestructura HTTP del dominio Products.
 *
 * CONTRATOS:
 * - Recibe el cliente HTTP como parámetro (inyección de dependencia).
 * - Devuelve siempre entidades canónicas (via normalizer).
 * - Devuelve siempre ProductError en caso de fallo (via normalizeError).
 * - Nunca lanza excepciones crudas de axios al exterior.
 *
 * USO:
 *   import axiosInstance from '@/core/api/axiosInstance';
 *   import { createProductsRepository } from './products.repository';
 *   const repo = createProductsRepository(axiosInstance);
 */

import {
  normalizeProduct,
  normalizeProductList,
  normalizeError,
} from './products.normalizer';

/**
 * Crea una instancia del repository de productos.
 *
 * @param {Object} httpClient - Instancia de axios u otro cliente HTTP
 * @returns {ProductsRepository}
 */
export const createProductsRepository = (httpClient) => {
  // ─────────────────────────────────────────────
  // HELPERS INTERNOS
  // ─────────────────────────────────────────────

  /**
   * Construye una query string desde un objeto de filtros.
   * Omite valores vacíos, null y undefined.
   */
  const buildQueryString = (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return params.toString();
  };

  /**
   * Wrapper de petición que normaliza errores.
   * @template T
   * @param {() => Promise<T>} fn
   * @returns {Promise<T>}
   */
  const request = async (fn) => {
    try {
      return await fn();
    } catch (error) {
      throw normalizeError(error);
    }
  };

  // ─────────────────────────────────────────────
  // MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────

  return {
    /**
     * Lista paginada de productos con filtros.
     *
     * @param {Object} [filters={}]
     * @returns {Promise<import('./products.normalizer').NormalizedProductList>}
     */
    findMany: async (filters = {}) =>
      request(async () => {
        const qs = buildQueryString(filters);
        const url = qs ? `/products?${qs}` : '/products';
        const response = await httpClient.get(url);
        return normalizeProductList(response);
      }),

    /**
     * Producto individual por slug.
     *
     * @param {string} slug
     * @returns {Promise<import('../domain/product.entity').Product>}
     */
    findBySlug: async (slug) =>
      request(async () => {
        const response = await httpClient.get(`/products/${slug}`);
        const raw = response?.data ?? response;
        return normalizeProduct(raw);
      }),

    /**
     * Producto individual por ID.
     *
     * @param {string} id
     * @returns {Promise<import('../domain/product.entity').Product>}
     */
    findById: async (id) =>
      request(async () => {
        const response = await httpClient.get(`/products/${id}`);
        const raw = response?.data ?? response;
        return normalizeProduct(raw);
      }),

    /**
     * Productos destacados.
     *
     * @param {number} [limit=8]
     * @returns {Promise<import('../domain/product.entity').Product[]>}
     */
    findFeatured: async (limit = 8) =>
      request(async () => {
        const response = await httpClient.get(`/products/featured?limit=${limit}`);
        const raw = response?.data ?? response;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return list.map(normalizeProduct).filter(Boolean);
      }),

    /**
     * Productos relacionados a un producto dado.
     *
     * @param {string} productId
     * @param {number} [limit=4]
     * @returns {Promise<import('../domain/product.entity').Product[]>}
     */
    findRelated: async (productId, limit = 4) =>
      request(async () => {
        const response = await httpClient.get(
          `/products/related/${productId}?limit=${limit}`
        );
        const raw = response?.data ?? response;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return list.map(normalizeProduct).filter(Boolean);
      }),

    /**
     * Búsqueda full-text de productos.
     *
     * @param {string} query     - Mínimo 2 caracteres
     * @param {number} [limit=10]
     * @returns {Promise<import('../domain/product.entity').Product[]>}
     */
    search: async (query, limit = 10) =>
      request(async () => {
        if (!query || query.trim().length < 2) return [];
        const encoded = encodeURIComponent(query.trim());
        const response = await httpClient.get(
          `/products/search/${encoded}?limit=${limit}`
        );
        const raw = response?.data ?? response;
        const list = Array.isArray(raw) ? raw : (raw?.data ?? []);
        return list.map(normalizeProduct).filter(Boolean);
      }),

    /**
     * Productos por categoría (endpoint dedicado).
     *
     * @param {string} categorySlug
     * @param {Object} [filters={}]
     * @returns {Promise<import('./products.normalizer').NormalizedProductList>}
     */
    findByCategory: async (categorySlug, filters = {}) =>
      request(async () => {
        const qs = buildQueryString(filters);
        const base = `/products/category/${categorySlug}`;
        const url = qs ? `${base}?${qs}` : base;
        const response = await httpClient.get(url);
        return normalizeProductList(response);
      }),

    /**
     * Verifica disponibilidad de stock para una cantidad.
     *
     * @param {string} productId
     * @param {number} quantity
     * @returns {Promise<{ available: boolean, stock: number, allowBackorder: boolean }>}
     */
    checkStock: async (productId, quantity) =>
      request(async () => {
        const response = await httpClient.post(
          `/products/check-stock/${productId}`,
          { quantity }
        );
        return response?.data ?? response;
      }),

    /**
     * Contexto SEO de un producto (útil para SSR/SSG).
     *
     * @param {string} id
     * @returns {Promise<Object>}
     */
    getSEOContext: async (id) =>
      request(async () => {
        const response = await httpClient.get(`/products/${id}/seo`);
        return response?.data ?? response;
      }),
  };
};

/**
 * @typedef {ReturnType<typeof createProductsRepository>} ProductsRepository
 */