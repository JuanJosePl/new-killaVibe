import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module categories.api
 * @description API calls para categorías - 100% sincronizado con backend
 */

/**
 * Obtener todas las categorías
 * Backend: GET /api/categories
 * @param {Object} options - Opciones de filtrado
 * @returns {Promise<Object>}
 */
export const getCategories = async (options = {}) => {
  const queryParams = new URLSearchParams();
  
  const allowedOptions = {
    featured: options.featured,
    parentOnly: options.parentOnly,
    withProductCount: options.withProductCount,
    sortBy: options.sortBy || 'order',
    page: options.page || 1,
    limit: options.limit || 50
  };

  Object.entries(allowedOptions).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  const response = await axiosInstance.get(`/categories?${queryParams.toString()}`);
  return response.data;
};

/**
 * Obtener árbol jerárquico de categorías
 * Backend: GET /api/categories/tree
 * @returns {Promise<Object>}
 */
export const getCategoryTree = async () => {
  const response = await axiosInstance.get('/categories/tree');
  return response.data;
};

/**
 * Obtener categorías destacadas
 * Backend: GET /api/categories/featured
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getFeaturedCategories = async (limit = 6) => {
  const response = await axiosInstance.get(`/categories/featured?limit=${limit}`);
  return response.data;
};

/**
 * Obtener categorías populares
 * Backend: GET /api/categories/popular
 * @param {number} limit
 * @returns {Promise<Object>}
 */
export const getPopularCategories = async (limit = 10) => {
  const response = await axiosInstance.get(`/categories/popular?limit=${limit}`);
  return response.data;
};

/**
 * Buscar categorías
 * Backend: GET /api/categories/search
 * @param {string} query
 * @returns {Promise<Object>}
 */
export const searchCategories = async (query) => {
  const response = await axiosInstance.get(`/categories/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

/**
 * Obtener categoría por slug
 * Backend: GET /api/categories/:slug
 * @param {string} slug
 * @returns {Promise<Object>}
 */
export const getCategoryBySlug = async (slug) => {
  const response = await axiosInstance.get(`/categories/${slug}`);
  return response.data;
};

/**
 * ============================================
 * RUTAS ADMIN (requieren autenticación)
 * ============================================
 */

/**
 * Crear categoría (ADMIN)
 * Backend: POST /api/categories
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export const createCategory = async (categoryData) => {
  const response = await axiosInstance.post('/categories', categoryData);
  return response.data;
};

/**
 * Actualizar categoría (ADMIN)
 * Backend: PUT /api/categories/:id
 * @param {string} id
 * @param {Object} categoryData
 * @returns {Promise<Object>}
 */
export const updateCategory = async (id, categoryData) => {
  const response = await axiosInstance.put(`/categories/${id}`, categoryData);
  return response.data;
};

/**
 * Eliminar categoría (ADMIN)
 * Backend: DELETE /api/categories/:id
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deleteCategory = async (id) => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};