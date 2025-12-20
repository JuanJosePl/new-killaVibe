// src/modules/products/api/products.api.js

import axiosInstance from "../../../core/api/axiosInstance";

/**
 * @module productsAPI
 * @description API calls para productos
 * ✅ CORRECCIÓN: Uso consistente de params en Axios
 */

export const productsAPI = {
  /**
   * @function getProducts
   * @description Obtener productos con filtros y paginación
   */
  getProducts: async (filters = {}) => {
    // ✅ Limpiar parámetros undefined/null/vacíos
    const cleanParams = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    return await axiosInstance.get("/products", { params: cleanParams });
  },

  /**
   * @function getProductBySlug
   * @description Obtener producto por slug
   * ✅ Incluye signal para cancelación
   */
  getProductBySlug: async (slug, config = {}) => {
    return await axiosInstance.get(`/products/${slug}`, config);
  },

  /**
   * @function getProductById
   * @description Obtener producto por ID (usado en admin)
   */
  getProductById: async (id) => {
    return await axiosInstance.get(`/products/${id}`);
  },

  /**
   * @function getFeaturedProducts
   * @description Obtener productos destacados
   */
  getFeaturedProducts: async (limit = 8) => {
    return await axiosInstance.get("/products/featured", {
      params: { limit },
    });
  },

  /**
   * @function getRelatedProducts
   * @description Obtener productos relacionados
   * ✅ CORRECCIÓN: Usar params object en lugar de query string manual
   */
  getRelatedProducts: async (productId, limit = 4) => {
    // ✅ Validar productId antes de llamar
    if (!productId || typeof productId !== "string") {
      console.error("[productsAPI] productId inválido:", productId);
      return Promise.reject({
        success: false,
        message: "ID de producto inválido",
        statusCode: 400,
      });
    }

    return await axiosInstance.get(`/products/related/${productId}`, {
      params: { limit }, // ✅ Axios maneja la serialización correctamente
    });
  },

  /**
   * @function searchProducts
   * @description Buscar productos con full-text search
   */
  searchProducts: async (query, limit = 10) => {
    if (!query || query.trim().length < 2) {
      return Promise.reject({
        success: false,
        message: "El término de búsqueda debe tener al menos 2 caracteres",
        statusCode: 400,
      });
    }

    return await axiosInstance.get(`/products/search/${query}`, {
      params: { limit },
    });
  },

  /**
   * @function getProductsByCategory
   * @description Obtener productos por categoría
   */
  getProductsByCategory: async (categorySlug, filters = {}) => {
    const cleanParams = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key] = value;
      }
      return acc;
    }, {});

    return await axiosInstance.get(`/products/category/${categorySlug}`, {
      params: cleanParams,
    });
  },

  /**
   * @function getTopSellingProducts
   * @description Obtener productos más vendidos
   */
  getTopSellingProducts: async (limit = 10) => {
    return await axiosInstance.get("/products/top-selling", {
      params: { limit },
    });
  },

  /**
   * @function checkStock
   * @description Verificar disponibilidad de stock
   */
  checkStock: async (productId, quantity) => {
    return await axiosInstance.post(`/products/check-stock/${productId}`, {
      quantity,
    });
  },

  // ========== ADMIN ENDPOINTS ==========

  /**
   * @function createProduct (ADMIN)
   * @description Crear nuevo producto
   */
  createProduct: async (productData) => {
    return await axiosInstance.post("/products", productData);
  },

  /**
   * @function updateProduct (ADMIN)
   * @description Actualizar producto existente
   */
  updateProduct: async (id, updateData) => {
    return await axiosInstance.put(`/products/${id}`, updateData);
  },

  /**
   * @function deleteProduct (ADMIN)
   * @description Archivar producto (soft delete)
   */
  deleteProduct: async (id) => {
    return await axiosInstance.delete(`/products/${id}`);
  },

  /**
   * @function getLowStockProducts (ADMIN)
   * @description Obtener productos con stock bajo
   */
  getLowStockProducts: async (threshold) => {
    const params = threshold ? { threshold } : {};
    return await axiosInstance.get("/products/admin/low-stock", { params });
  },
};
