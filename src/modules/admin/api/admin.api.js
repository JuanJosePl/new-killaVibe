// src/modules/admin/api/admin.api.js

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module AdminAPI
 * @description API calls para el panel administrativo
 * Basado en: backend/modules/admin/admin.routes.js
 */

const adminAPI = {
  
  // ============================================================================
  // DASHBOARD & STATS
  // ============================================================================
  
  /**
   * Obtiene estadísticas generales del dashboard
   * Backend: GET /api/admin/dashboard/stats
   * Requiere: role 'admin' o 'moderator'
   */
  getDashboardStats: async () => {
    const response = await axiosInstance.get('/admin/dashboard/stats');
    return response.data;
  },

  /**
   * Obtiene datos de ventas según rango
   * Backend: GET /api/admin/dashboard/sales?range=monthly
   * @param {string} range - 'daily' | 'weekly' | 'monthly' | 'yearly'
   */
  getSalesData: async (range = 'monthly') => {
    const response = await axiosInstance.get('/admin/dashboard/sales', {
      params: { range }
    });
    return response.data;
  },

  // ============================================================================
  // USERS MANAGEMENT
  // ============================================================================
  
  /**
   * Obtiene lista de usuarios con filtros
   * Backend: GET /api/admin/users
   * @param {Object} params - Filtros y paginación
   * @param {number} params.page - Página actual (default: 1)
   * @param {number} params.limit - Resultados por página (default: 20)
   * @param {string} params.role - Filtrar por rol: 'customer' | 'admin' | 'moderator'
   * @param {string} params.search - Buscar por email, nombre
   * @param {string} params.isActive - 'true' | 'false'
   * @param {string} params.sortBy - 'createdAt' | 'lastLogin' | 'email'
   * @param {string} params.sortOrder - 'asc' | 'desc'
   */
  getUsers: async (params = {}) => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Obtiene detalles de un usuario específico
   * Backend: GET /api/admin/users/:id
   */
  getUserDetails: async (userId) => {
    const response = await axiosInstance.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Actualiza un usuario
   * Backend: PUT /api/admin/users/:id
   * @param {string} userId
   * @param {Object} updateData
   * @param {string} updateData.role - 'customer' | 'admin' | 'moderator'
   * @param {boolean} updateData.isActive
   * @param {Object} updateData.profile - { firstName, lastName, phone }
   */
  updateUser: async (userId, updateData) => {
    const response = await axiosInstance.put(`/admin/users/${userId}`, updateData);
    return response.data;
  },

  /**
   * Banear/desbanear usuario
   * Backend: PUT /api/admin/users/:id/ban
   * @param {string} userId
   * @param {boolean} isBanned
   * @param {string} reason - Razón del ban
   */
  toggleUserBan: async (userId, isBanned, reason = '') => {
    const response = await axiosInstance.put(`/admin/users/${userId}/ban`, {
      isBanned,
      reason
    });
    return response.data;
  },

  /**
   * Eliminar usuario (hard delete)
   * Backend: DELETE /api/admin/users/:id
   */
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // ============================================================================
  // PRODUCTS MANAGEMENT
  // ============================================================================
  
  /**
   * Obtiene lista de productos con filtros (admin)
   * Backend: GET /api/admin/products
   */
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/admin/products', { params });
    return response.data;
  },

  /**
   * Obtiene productos con bajo stock
   * Backend: GET /api/admin/products/low-stock?threshold=10
   */
  getLowStockProducts: async (threshold = 10) => {
    const response = await axiosInstance.get('/admin/products/low-stock', {
      params: { threshold }
    });
    return response.data;
  },

  /**
   * Crear nuevo producto
   * Backend: POST /api/admin/products
   */
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/admin/products', productData);
    return response.data;
  },

  /**
   * Actualizar producto
   * Backend: PUT /api/admin/products/:id
   */
  updateProduct: async (productId, updateData) => {
    const response = await axiosInstance.put(`/admin/products/${productId}`, updateData);
    return response.data;
  },

  /**
   * Eliminar producto
   * Backend: DELETE /api/admin/products/:id
   */
  deleteProduct: async (productId) => {
    const response = await axiosInstance.delete(`/admin/products/${productId}`);
    return response.data;
  },

  // ============================================================================
  // CATEGORIES MANAGEMENT
  // ============================================================================
  
  /**
   * Obtiene todas las categorías
   * Backend: GET /api/admin/categories
   */
  getCategories: async () => {
    const response = await axiosInstance.get('/admin/categories');
    return response.data;
  },

  /**
   * Obtiene jerarquía de categorías
   * Backend: GET /api/admin/categories/hierarchy
   */
  getCategoriesHierarchy: async () => {
    const response = await axiosInstance.get('/admin/categories/hierarchy');
    return response.data;
  },

  /**
   * Crear nueva categoría
   * Backend: POST /api/admin/categories
   */
  createCategory: async (categoryData) => {
    const response = await axiosInstance.post('/admin/categories', categoryData);
    return response.data;
  },

  /**
   * Actualizar categoría
   * Backend: PUT /api/admin/categories/:id
   */
  updateCategory: async (categoryId, updateData) => {
    const response = await axiosInstance.put(`/admin/categories/${categoryId}`, updateData);
    return response.data;
  },

  /**
   * Eliminar categoría
   * Backend: DELETE /api/admin/categories/:id
   */
  deleteCategory: async (categoryId) => {
    const response = await axiosInstance.delete(`/admin/categories/${categoryId}`);
    return response.data;
  },

  // ============================================================================
  // ORDERS MANAGEMENT
  // ============================================================================
  
  /**
   * Obtiene lista de órdenes
   * Backend: GET /api/admin/orders
   */
  getOrders: async (params = {}) => {
    const response = await axiosInstance.get('/admin/orders', { params });
    return response.data;
  },

  /**
   * Obtiene detalles de una orden
   * Backend: GET /api/admin/orders/:id
   */
  getOrderDetails: async (orderId) => {
    const response = await axiosInstance.get(`/admin/orders/${orderId}`);
    return response.data;
  },

  /**
   * Actualizar estado de orden
   * Backend: PUT /api/admin/orders/:id/status
   * @param {string} orderId
   * @param {string} status - 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
   * @param {string} notes - Notas opcionales
   */
  updateOrderStatus: async (orderId, status, notes = '') => {
    const response = await axiosInstance.put(`/admin/orders/${orderId}/status`, {
      status,
      notes
    });
    return response.data;
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  /**
   * Obtiene dashboard de analytics completo
   * Backend: GET /api/analytics/dashboard
   */
  getAnalyticsDashboard: async (options = {}) => {
    const response = await axiosInstance.get('/analytics/dashboard', {
      params: options
    });
    return response.data;
  },

  /**
   * Obtiene revenue mensual
   * Backend: GET /api/analytics/revenue/monthly?months=12
   */
  getMonthlyRevenue: async (months = 12) => {
    const response = await axiosInstance.get('/analytics/revenue/monthly', {
      params: { months }
    });
    return response.data;
  },

  /**
   * Obtiene productos más vendidos
   * Backend: GET /api/analytics/products/top-selling?limit=20
   */
  getTopSellingProducts: async (limit = 20) => {
    const response = await axiosInstance.get('/analytics/products/top-selling', {
      params: { limit }
    });
    return response.data;
  }
};

export default adminAPI;