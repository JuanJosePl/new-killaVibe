// src/modules/admin/hooks/useAdmin.js

import { useState, useCallback } from 'react';
import adminAPI from '../api/admin.api';

/**
 * @hook useAdmin
 * @description Hook personalizado para gestionar operaciones admin
 * Maneja loading, errores y success states automáticamente
 */
export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Wrapper genérico para llamadas API
   */
  const executeRequest = useCallback(async (apiCall, onSuccess, onError) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      
      if (response.success) {
        if (onSuccess) onSuccess(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Error en la operación';
        setError(errorMsg);
        if (onError) onError(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido';
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // DASHBOARD
  // ==========================================================================
  
  const getDashboardStats = useCallback((onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getDashboardStats(),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getSalesData = useCallback((range, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getSalesData(range),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // USERS
  // ==========================================================================
  
  const getUsers = useCallback((params, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getUsers(params),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getUserDetails = useCallback((userId, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getUserDetails(userId),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const updateUser = useCallback((userId, updateData, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.updateUser(userId, updateData),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const toggleUserBan = useCallback((userId, isBanned, reason, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.toggleUserBan(userId, isBanned, reason),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const deleteUser = useCallback((userId, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.deleteUser(userId),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // PRODUCTS
  // ==========================================================================
  
  const getProducts = useCallback((params, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getProducts(params),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getLowStockProducts = useCallback((threshold, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getLowStockProducts(threshold),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const createProduct = useCallback((productData, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.createProduct(productData),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const updateProduct = useCallback((productId, updateData, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.updateProduct(productId, updateData),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const deleteProduct = useCallback((productId, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.deleteProduct(productId),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // CATEGORIES
  // ==========================================================================
  
  const getCategories = useCallback((onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getCategories(),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getCategoriesHierarchy = useCallback((onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getCategoriesHierarchy(),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const createCategory = useCallback((categoryData, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.createCategory(categoryData),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const updateCategory = useCallback((categoryId, updateData, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.updateCategory(categoryId, updateData),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const deleteCategory = useCallback((categoryId, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.deleteCategory(categoryId),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // ORDERS
  // ==========================================================================
  
  const getOrders = useCallback((params, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getOrders(params),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getOrderDetails = useCallback((orderId, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getOrderDetails(orderId),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const updateOrderStatus = useCallback((orderId, status, notes, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.updateOrderStatus(orderId, status, notes),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // ANALYTICS
  // ==========================================================================
  
  const getAnalyticsDashboard = useCallback((options, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getAnalyticsDashboard(options),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getMonthlyRevenue = useCallback((months, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getMonthlyRevenue(months),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  const getTopSellingProducts = useCallback((limit, onSuccess, onError) => {
    return executeRequest(
      () => adminAPI.getTopSellingProducts(limit),
      onSuccess,
      onError
    );
  }, [executeRequest]);

  // ==========================================================================
  // UTILITIES
  // ==========================================================================
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    loading,
    error,
    
    // Dashboard
    getDashboardStats,
    getSalesData,
    
    // Users
    getUsers,
    getUserDetails,
    updateUser,
    toggleUserBan,
    deleteUser,
    
    // Products
    getProducts,
    getLowStockProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Categories
    getCategories,
    getCategoriesHierarchy,
    createCategory,
    updateCategory,
    deleteCategory,
    
    // Orders
    getOrders,
    getOrderDetails,
    updateOrderStatus,
    
    // Analytics
    getAnalyticsDashboard,
    getMonthlyRevenue,
    getTopSellingProducts,
    
    // Utilities
    clearError
  };
};