// src/modules/customer/api/customerCategories.api.js

import customerApiClient from "../utils/customerApiClient";

/**
 * @module customerCategories.api
 * @description API para categorías del customer panel
 *
 * Endpoints del backend:
 * - GET /categories
 * - GET /categories/tree
 * - GET /categories/featured
 * - GET /categories/popular
 * - GET /categories/search
 * - GET /categories/:slug
 */

/**
 * Obtener todas las categorías con filtros
 * @param {Object} options - Filtros
 * @returns {Promise<Object>} { data, pagination }
 */
export const getCategories = async (options = {}) => {
  const params = new URLSearchParams();

  if (options.featured !== undefined)
    params.append("featured", options.featured);
  if (options.parentOnly !== undefined)
    params.append("parentOnly", options.parentOnly);
  if (options.withProductCount !== undefined)
    params.append("withProductCount", options.withProductCount);
  if (options.sortBy) params.append("sortBy", options.sortBy);
  if (options.page) params.append("page", options.page);
  if (options.limit) params.append("limit", options.limit);

  const response = await customerApiClient.get(
    `/categories?${params.toString()}`
  );
  return {
    data: response.data || [],
    pagination: response.pagination || {},
  };
};

/**
 * Obtener árbol jerárquico de categorías
 * @returns {Promise<Array>} Árbol de categorías
 */
export const getCategoryTree = async () => {
  const response = await customerApiClient.get("/categories/tree");
  return response.data || [];
};

/**
 * Obtener categorías destacadas
 * @param {number} limit - Cantidad de categorías
 * @returns {Promise<Array>} Categorías destacadas
 */
export const getFeaturedCategories = async (limit = 6) => {
  const response = await customerApiClient.get(
    `/categories/featured?limit=${limit}`
  );
  return response.data || [];
};

/**
 * Obtener categorías populares
 * @param {number} limit - Cantidad de categorías
 * @returns {Promise<Array>} Categorías populares
 */
export const getPopularCategories = async (limit = 10) => {
  const response = await customerApiClient.get(
    `/categories/popular?limit=${limit}`
  );
  return response.data || [];
};

/**
 * Buscar categorías
 * @param {string} query - Término de búsqueda (min 2 chars)
 * @returns {Promise<Array>} Categorías encontradas
 */
export const searchCategories = async (query) => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const response = await customerApiClient.get("/categories/search", {
    params: { q: query },
  });
  return response.data || [];
};

/**
 * Obtener categoría por slug
 * @param {string} slug - Slug de la categoría
 * @returns {Promise<Object>} Categoría completa con subcategorías y breadcrumb
 */
export const getCategoryBySlug = async (slug) => {
  const response = await customerApiClient.get(`/categories/${slug}`);
  return response.data;
};

/**
 * Helpers para navegación
 */

/**
 * Construir breadcrumb desde árbol de categorías
 * @param {Array} categoryTree - Árbol completo
 * @param {string} targetSlug - Slug objetivo
 * @returns {Array} Breadcrumb path
 */
export const buildBreadcrumb = (categoryTree, targetSlug) => {
  const findPath = (nodes, path = []) => {
    for (const node of nodes) {
      const currentPath = [...path, node];

      if (node.slug === targetSlug) {
        return currentPath;
      }

      if (node.children && node.children.length > 0) {
        const result = findPath(node.children, currentPath);
        if (result) return result;
      }
    }
    return null;
  };

  return findPath(categoryTree) || [];
};

/**
 * Aplanar árbol de categorías
 * @param {Array} tree - Árbol jerárquico
 * @returns {Array} Lista plana con niveles
 */
export const flattenCategoryTree = (tree) => {
  const flat = [];

  const flatten = (nodes, level = 0) => {
    nodes.forEach((node) => {
      flat.push({ ...node, level });
      if (node.children && node.children.length > 0) {
        flatten(node.children, level + 1);
      }
    });
  };

  flatten(tree);
  return flat;
};

/**
 * Invalidar cache de categorías (se usa en el contexto)
 */
export const invalidateCategoriesCache = () => {
  console.log("[customerCategories.api] Cache invalidation requested");
};

export default {
  getCategories,
  getCategoryTree,
  getFeaturedCategories,
  getPopularCategories,
  searchCategories,
  getCategoryBySlug,
  buildBreadcrumb,
  flattenCategoryTree,
  invalidateCategoriesCache,
};
