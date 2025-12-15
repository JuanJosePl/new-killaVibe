import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module CategoriesAPI
 * @description API layer para módulo Categories - 100% sincronizado con backend
 * 
 * ENDPOINTS:
 * - GET    /api/categories                    (público)
 * - GET    /api/categories/tree               (público)
 * - GET    /api/categories/featured           (público)
 * - GET    /api/categories/popular            (público)
 * - GET    /api/categories/search             (público)
 * - GET    /api/categories/:slug              (público)
 * - POST   /api/categories                    (admin)
 * - PUT    /api/categories/:id                (admin)
 * - DELETE /api/categories/:id                (admin)
 */

const BASE_URL = '/categories';

/**
 * Obtener todas las categorías con filtros y paginación
 * 
 * @param {Object} params - Parámetros de filtrado
 * @param {boolean} params.featured - Solo categorías destacadas
 * @param {boolean} params.parentOnly - Solo categorías raíz (sin padre)
 * @param {boolean} params.withProductCount - Incluir conteo de productos
 * @param {string} params.sortBy - Ordenar por: 'order'|'newest'|'views'|'name'|'productCount'
 * @param {number} params.page - Página actual (default: 1)
 * @param {number} params.limit - Items por página (default: 50, max: 100)
 * @returns {Promise<{success: boolean, count: number, pagination: Object, data: Array}>}
 */
export const getCategories = async (params = {}) => {
  const response = await axiosInstance.get(BASE_URL, { params });
  return response.data;
};

/**
 * Obtener árbol jerárquico de categorías
 * 
 * @returns {Promise<{success: boolean, data: Array}>}
 * @example
 * // Response data structure:
 * [
 *   {
 *     _id: "...",
 *     name: "Electronics",
 *     slug: "electronics",
 *     children: [
 *       { _id, name, slug, children: [] }
 *     ]
 *   }
 * ]
 */
export const getCategoryTree = async () => {
  const response = await axiosInstance.get(`${BASE_URL}/tree`);
  return response.data;
};

/**
 * Obtener categorías destacadas
 * 
 * @param {number} limit - Límite de categorías (default: 6)
 * @returns {Promise<{success: boolean, count: number, data: Array}>}
 */
export const getFeaturedCategories = async (limit = 6) => {
  const response = await axiosInstance.get(`${BASE_URL}/featured`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Obtener categorías más populares
 * 
 * @param {number} limit - Límite de categorías (default: 10)
 * @returns {Promise<{success: boolean, count: number, data: Array}>}
 */
export const getPopularCategories = async (limit = 10) => {
  const response = await axiosInstance.get(`${BASE_URL}/popular`, {
    params: { limit }
  });
  return response.data;
};

/**
 * Buscar categorías por nombre o keywords
 * 
 * @param {string} query - Término de búsqueda (min: 2 caracteres)
 * @returns {Promise<{success: boolean, count: number, data: Array}>}
 * @throws {Error} 400 - Si query < 2 caracteres
 */
export const searchCategories = async (query) => {
  if (!query || query.length < 2) {
    throw new Error('El término de búsqueda debe tener al menos 2 caracteres');
  }

  const response = await axiosInstance.get(`${BASE_URL}/search`, {
    params: { q: query }
  });
  return response.data;
};

/**
 * Obtener categoría por slug con detalles completos
 * 
 * @param {string} slug - Slug de la categoría
 * @returns {Promise<{success: boolean, data: Object}>}
 * @throws {Error} 404 - Si categoría no existe
 * @example
 * // Response data includes:
 * {
 *   _id, name, slug, description, parentCategory,
 *   images, seo, subcategories, breadcrumb, productCount
 * }
 */
export const getCategoryBySlug = async (slug) => {
  const response = await axiosInstance.get(`${BASE_URL}/${slug}`);
  return response.data;
};

/**
 * Crear nueva categoría (ADMIN ONLY)
 * 
 * @param {Object} categoryData - Datos de la categoría
 * @param {string} categoryData.name - Nombre (REQUIRED, 2-100 chars, unique)
 * @param {string} categoryData.description - Descripción (max 1000 chars)
 * @param {string} categoryData.parentCategory - ID de categoría padre (nullable)
 * @param {Object} categoryData.images - {thumbnail, hero, icon}
 * @param {Object} categoryData.seo - {metaTitle, metaDescription, keywords, ogImage, ogDescription}
 * @param {boolean} categoryData.featured - Es destacada
 * @param {number} categoryData.order - Orden de visualización
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 * @throws {Error} 401 - No autenticado
 * @throws {Error} 403 - No es admin
 * @throws {Error} 400 - Validación fallida
 * @throws {Error} 409 - Nombre duplicado
 */
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post(BASE_URL, categoryData);
  return response.data;
};

/**
 * Actualizar categoría existente (ADMIN ONLY)
 * 
 * @param {string} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar (min 1 campo)
 * @returns {Promise<{success: boolean, message: string, data: Object}>}
 * @throws {Error} 401 - No autenticado
 * @throws {Error} 403 - No es admin
 * @throws {Error} 404 - Categoría no encontrada
 * @throws {Error} 400 - Validación fallida o referencia circular
 * @throws {Error} 409 - Nombre duplicado
 */
export const updateCategory = async (categoryId, updateData) => {
  const response = await axiosInstance.put(`${BASE_URL}/${categoryId}`, updateData);
  return response.data;
};

/**
 * Eliminar categoría (ADMIN ONLY) - Soft delete
 * 
 * @param {string} categoryId - ID de la categoría
 * @returns {Promise<{success: boolean, message: string}>}
 * @throws {Error} 401 - No autenticado
 * @throws {Error} 403 - No es admin
 * @throws {Error} 404 - Categoría no encontrada
 * @throws {Error} 400 - Tiene subcategorías o productos asociados
 */
export const deleteCategory = async (categoryId) => {
  const response = await axiosInstance.delete(`${BASE_URL}/${categoryId}`);
  return response.data;
};

/**
 * Exportación por defecto
 */
export default {
  getCategories,
  getCategoryTree,
  getFeaturedCategories,
  getPopularCategories,
  searchCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
};