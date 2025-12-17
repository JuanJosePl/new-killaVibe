// src/api/searchApi.js
import axiosInstance from "../../../core/api/axiosInstance";

/**
 * @module SearchAPI
 * @description API para historial y análisis de búsquedas
 * 
 * Sincronizado con: src/modules/search/search.routes.js
 */

const searchApi = {
  /**
   * @desc    Obtener sugerencias de búsqueda
   * @route   GET /api/search/suggestions?q=prefix&limit=5
   * @access  Public
   */
  getSearchSuggestions: async (query, limit = 5) => {
    const response = await axiosInstance.get('/api/search/suggestions', {
      params: { q: query, limit }
    });
    return response.data;
  },

  /**
   * @desc    Obtener búsquedas populares
   * @route   GET /api/search/popular?limit=10&days=30
   * @access  Public
   */
  getPopularSearches: async (limit = 10, days = 30) => {
    const response = await axiosInstance.get('/api/search/popular', {
      params: { limit, days }
    });
    return response.data;
  },

  /**
   * @desc    Obtener búsquedas en tendencia
   * @route   GET /api/search/trending?limit=10
   * @access  Public
   */
  getTrendingSearches: async (limit = 10) => {
    const response = await axiosInstance.get('/api/search/trending', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * @desc    Obtener historial de búsqueda del usuario
   * @route   GET /api/search/history?limit=20
   * @access  Private
   */
  getUserSearchHistory: async (limit = 20) => {
    const response = await axiosInstance.get('/api/search/history', {
      params: { limit }
    });
    return response.data;
  },

  /**
   * @desc    Obtener búsquedas fallidas (Admin)
   * @route   GET /api/search/admin/failed?limit=20&days=30
   * @access  Private/Admin
   */
  getFailedSearches: async (limit = 20, days = 30) => {
    const response = await axiosInstance.get('/api/search/admin/failed', {
      params: { limit, days }
    });
    return response.data;
  },

  /**
   * @desc    Obtener estadísticas de búsqueda (Admin)
   * @route   GET /api/search/admin/stats?days=30
   * @access  Private/Admin
   */
  getSearchStats: async (days = 30) => {
    const response = await axiosInstance.get('/api/search/admin/stats', {
      params: { days }
    });
    return response.data;
  }
};

export default searchApi;