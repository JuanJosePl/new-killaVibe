// src/modules/admin/api/admin.api.js
// ✅ VERSIÓN CORREGIDA - API calls optimizadas

import axiosInstance from '../../../core/api/axiosInstance';

/**
 * @module AdminAPI
 * @description API calls para el panel administrativo
 */

const cleanObject = (obj) => Object.fromEntries(
  Object.entries(obj).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
);

const adminAPI = {
  
  // ============================================================================
  // DASHBOARD & STATS
  // ============================================================================
  
  getDashboardStats: async () => {
    return await axiosInstance.get('/admin/dashboard/stats');
  },

  getSalesData: async (range = 'monthly') => {
    return await axiosInstance.get('/admin/dashboard/sales', {
      params: { range }
    });
  },

  // ============================================================================
  // USERS MANAGEMENT
  // ============================================================================
  
  getUsers: async (params = {}) => {
    const cleanedParams = cleanObject(params);
    return await axiosInstance.get('/admin/users', { 
      params: cleanedParams 
    });
  },

  getUserDetails: async (userId) => {
    return await axiosInstance.get(`/admin/users/${userId}`);
  },

  updateUser: async (userId, updateData) => {
    return await axiosInstance.put(`/admin/users/${userId}`, updateData);
  },

  toggleUserBan: async (userId, isBanned, reason = '') => {
    return await axiosInstance.put(`/admin/users/${userId}/ban`, {
      isBanned,
      reason
    });
  },

  deleteUser: async (userId) => {
    return await axiosInstance.delete(`/admin/users/${userId}`);
  },

  // ============================================================================
  // PRODUCTS MANAGEMENT
  // ============================================================================
  
  getProducts: async (params = {}) => {
    const cleanParams = cleanObject(params);
    return await axiosInstance.get('/admin/products', { 
      params: cleanParams 
    });
  },

  /**
   * ✅ Obtener producto específico por ID
   * Backend: GET /api/products/id/:id
   */
  getProductById: async (productId) => {
    return await axiosInstance.get(`/products/id/${productId}`);
  },

  getLowStockProducts: async (threshold = 10) => {
    return await axiosInstance.get('/admin/products/low-stock', {
      params: { threshold }
    });
  },

  /**
   * ✅ Crear producto - CORREGIDO
   * Envía todos los campos correctamente estructurados
   */
  createProduct: async (productData) => {
    console.log('📤 [adminAPI] Enviando producto al backend:', productData);
    return await axiosInstance.post('/admin/products', productData);
  },

  /**
   * ✅ Actualizar producto - CORREGIDO
   * Envía todos los campos correctamente estructurados
   */
  updateProduct: async (productId, updateData) => {
    console.log('📤 [adminAPI] Actualizando producto:', productId, updateData);
    return await axiosInstance.put(`/admin/products/${productId}`, updateData);
  },

  deleteProduct: async (productId) => {
    return await axiosInstance.delete(`/admin/products/${productId}`);
  },

  // ============================================================================
  // CATEGORIES MANAGEMENT
  // ============================================================================
  
  getCategories: async () => {
    return await axiosInstance.get('/admin/categories');
  },

  getCategoriesHierarchy: async () => {
    return await axiosInstance.get('/admin/categories/hierarchy');
  },

  createCategory: async (categoryData) => {
    return await axiosInstance.post('/admin/categories', categoryData);
  },

  updateCategory: async (categoryId, updateData) => {
    return await axiosInstance.put(`/admin/categories/${categoryId}`, updateData);
  },

  deleteCategory: async (categoryId) => {
    return await axiosInstance.delete(`/admin/categories/${categoryId}`);
  },

  // ============================================================================
  // ORDERS MANAGEMENT
  // ============================================================================
  
  getOrders: async (params = {}) => {
    const cleanParams = cleanObject(params);
    return await axiosInstance.get('/admin/orders', { 
      params: cleanParams 
    });
  },

  getOrderDetails: async (orderId) => {
    return await axiosInstance.get(`/admin/orders/${orderId}`);
  },

  updateOrderStatus: async (orderId, status, notes) => {
    const payload = { 
      status, 
      notes: notes || `Estado actualizado a ${status}` 
    };
    return await axiosInstance.put(`/admin/orders/${orderId}/status`, payload);
  },

  // ============================================================================
  // CONTACT MANAGEMENT
  // ============================================================================
  
  getContactMessages: async (params = {}) => {
    const cleanedParams = cleanObject(params);
    return await axiosInstance.get('/contact/admin/messages', { 
      params: cleanedParams 
    });
  },

  markContactAsRead: async (messageId) => {
    return await axiosInstance.put(`/contact/admin/messages/${messageId}/read`);
  },

  replyToContactMessage: async (messageId, reply) => {
    return await axiosInstance.post(`/contact/admin/messages/${messageId}/reply`, { 
      reply 
    });
  },

  deleteContactMessage: async (messageId) => {
    return await axiosInstance.delete(`/contact/admin/messages/${messageId}`);
  },

  // ============================================================================
  // ANALYTICS
  // ============================================================================
  
  getAnalyticsDashboard: async (options = {}) => {
    return await axiosInstance.get('/analytics/dashboard', {
      params: options
    });
  },

  getMonthlyRevenue: async (months = 12) => {
    return await axiosInstance.get('/analytics/revenue/monthly', {
      params: { months }
    });
  },

  getTopSellingProducts: async (limit = 20) => {
    return await axiosInstance.get('/analytics/products/top-selling', {
      params: { limit }
    });
  }
};

export default adminAPI;