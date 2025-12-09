// src/modules/products/api/products.api.js

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module productsAPI
 * @description API calls para productos
 * 
 * IMPORTANTE: Todas las funciones retornan formato exacto del backend:
 * - { success, message?, data?, pagination?, errors? }
 */

export const productsAPI = {
  /**
   * @function getProducts
   * @description Obtener productos con filtros y paginación
   * 
   * @param {Object} filters
   * @param {number} [filters.page=1] - Página actual
   * @param {number} [filters.limit=12] - Productos por página (max 100)
   * @param {string} [filters.sort='createdAt'] - Campo de ordenamiento
   * @param {string} [filters.order='desc'] - Orden (asc/desc)
   * @param {string} [filters.category] - ID o slug de categoría
   * @param {string} [filters.search] - Búsqueda (min 2 chars)
   * @param {number} [filters.minPrice] - Precio mínimo
   * @param {number} [filters.maxPrice] - Precio máximo
   * @param {string} [filters.status='active'] - Estado del producto
   * @param {string} [filters.visibility='public'] - Visibilidad
   * @param {boolean} [filters.featured] - Solo destacados
   * @param {boolean} [filters.inStock] - Solo en stock
   * @param {string} [filters.brand] - Marca
   * 
   * @returns {Promise<Object>} { success, message, data[], pagination }
   * 
   * @example
   * const response = await productsAPI.getProducts({
   *   page: 1,
   *   limit: 12,
   *   category: 'smartphones',
   *   minPrice: 100000,
   *   sort: 'price',
   *   order: 'asc'
   * });
   */
  getProducts: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    // Agregar solo filtros con valor
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/products?${queryString}` : '/products';

    return await axiosInstance.get(url);
  },

  /**
   * @function getProductBySlug
   * @description Obtener producto por slug
   * 
   * @param {string} slug - Slug del producto
   * @returns {Promise<Object>} { success, data }
   * @throws {Object} { success: false, message, statusCode: 404 }
   * 
   * @example
   * const response = await productsAPI.getProductBySlug('airpods-pro-2da-generacion');
   */
  getProductBySlug: async (slug) => {
    return await axiosInstance.get(`/products/${slug}`);
  },

  /**
   * @function getProductById
   * @description Obtener producto por ID (usado en admin)
   * 
   * @param {string} id - ID del producto
   * @returns {Promise<Object>} { success, data }
   */
  getProductById: async (id) => {
    return await axiosInstance.get(`/products/${id}`);
  },

  /**
   * @function getFeaturedProducts
   * @description Obtener productos destacados
   * 
   * @param {number} [limit=8] - Límite de productos
   * @returns {Promise<Object>} { success, count, data[] }
   * 
   * @example
   * const response = await productsAPI.getFeaturedProducts(4);
   */
  getFeaturedProducts: async (limit = 8) => {
    return await axiosInstance.get(`/products/featured?limit=${limit}`);
  },

  /**
   * @function getRelatedProducts
   * @description Obtener productos relacionados
   * 
   * @param {string} productId - ID del producto actual
   * @param {number} [limit=4] - Límite de productos
   * @returns {Promise<Object>} { success, count, data[] }
   * 
   * @example
   * const response = await productsAPI.getRelatedProducts('507f1f77bcf86cd799439011', 4);
   */
  getRelatedProducts: async (productId, limit = 4) => {
    return await axiosInstance.get(`/products/related/${productId}?limit=${limit}`);
  },

  /**
   * @function searchProducts
   * @description Buscar productos con full-text search
   * 
   * @param {string} query - Término de búsqueda (min 2 chars)
   * @param {number} [limit=10] - Límite de resultados
   * @returns {Promise<Object>} { success, count, data[] }
   * @throws {Object} { success: false, message: 'Mínimo 2 caracteres', statusCode: 400 }
   * 
   * @example
   * const response = await productsAPI.searchProducts('airpods', 10);
   */
  searchProducts: async (query, limit = 10) => {
    return await axiosInstance.get(`/products/search/${query}?limit=${limit}`);
  },

  /**
   * @function getProductsByCategory
   * @description Obtener productos por categoría
   * 
   * @param {string} categorySlug - Slug de la categoría
   * @param {Object} [filters={}] - Filtros adicionales (igual que getProducts)
   * @returns {Promise<Object>} { success, data[], pagination }
   * 
   * @example
   * const response = await productsAPI.getProductsByCategory('audio', {
   *   page: 1,
   *   limit: 12,
   *   sort: 'price',
   *   order: 'asc'
   * });
   */
  getProductsByCategory: async (categorySlug, filters = {}) => {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `/products/category/${categorySlug}?${queryString}`
      : `/products/category/${categorySlug}`;

    return await axiosInstance.get(url);
  },

  /**
   * @function getTopSellingProducts
   * @description Obtener productos más vendidos
   * 
   * @param {number} [limit=10] - Límite de productos
   * @returns {Promise<Object>} { success, count, data[] }
   */
  getTopSellingProducts: async (limit = 10) => {
    return await axiosInstance.get(`/products/top-selling?limit=${limit}`);
  },

  /**
   * @function checkStock
   * @description Verificar disponibilidad de stock
   * 
   * @param {string} productId - ID del producto
   * @param {number} quantity - Cantidad deseada
   * @returns {Promise<Object>} { success, data: { available, stock, allowBackorder } }
   * @throws {Object} { success: false, message: 'Stock insuficiente', statusCode: 409 }
   * 
   * @example
   * const response = await productsAPI.checkStock('507f1f77bcf86cd799439011', 2);
   * // { success: true, data: { available: true, stock: 15, allowBackorder: false } }
   */
  checkStock: async (productId, quantity) => {
    return await axiosInstance.post(`/products/check-stock/${productId}`, { quantity });
  },

  // ========== ADMIN ENDPOINTS (requieren autenticación) ==========

  /**
   * @function createProduct (ADMIN)
   * @description Crear nuevo producto
   * 
   * @param {Object} productData - Datos del producto
   * @returns {Promise<Object>} { success, message, data }
   * @throws {Object} { success: false, message, statusCode: 400/401/403 }
   * 
   * @example
   * const response = await productsAPI.createProduct({
   *   name: 'AirPods Pro 2da Gen',
   *   description: 'Audífonos inalámbricos...',
   *   price: 899000,
   *   stock: 15,
   *   categories: ['category_id'],
   *   images: [{url: '...', isPrimary: true}]
   * });
   */
  createProduct: async (productData) => {
    return await axiosInstance.post('/products', productData);
  },

  /**
   * @function updateProduct (ADMIN)
   * @description Actualizar producto existente
   * 
   * @param {string} id - ID del producto
   * @param {Object} updateData - Campos a actualizar
   * @returns {Promise<Object>} { success, message, data }
   */
  updateProduct: async (id, updateData) => {
    return await axiosInstance.put(`/products/${id}`, updateData);
  },

  /**
   * @function deleteProduct (ADMIN)
   * @description Archivar producto (soft delete)
   * 
   * @param {string} id - ID del producto
   * @returns {Promise<Object>} { success, message }
   */
  deleteProduct: async (id) => {
    return await axiosInstance.delete(`/products/${id}`);
  },

  /**
   * @function getLowStockProducts (ADMIN)
   * @description Obtener productos con stock bajo
   * 
   * @param {number} [threshold] - Umbral de stock (default: lowStockThreshold del producto)
   * @returns {Promise<Object>} { success, count, data[] }
   */
  getLowStockProducts: async (threshold) => {
    const url = threshold 
      ? `/products/admin/low-stock?threshold=${threshold}`
      : '/products/admin/low-stock';
    return await axiosInstance.get(url);
  },
};