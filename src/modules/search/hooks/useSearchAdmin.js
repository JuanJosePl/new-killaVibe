// src/hooks/useSearchAdmin.js
import { useState, useCallback } from 'react';
import searchApi from '../api/searchApi';
import { toast } from 'react-toastify';

/**
 * @hook useSearchAdmin
 * @description Hook para analytics admin (requiere role admin/moderator)
 */
const useSearchAdmin = () => {
  // Estados para failed searches
  const [failedSearches, setFailedSearches] = useState([]);
  const [loadingFailed, setLoadingFailed] = useState(false);

  // Estados para stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const [error, setError] = useState(null);

  /**
   * Obtener búsquedas fallidas
   */
  const getFailedSearches = useCallback(async (limit = 20, days = 30) => {
    setLoadingFailed(true);
    setError(null);
    
    try {
      const response = await searchApi.getFailedSearches(limit, days);
      setFailedSearches(response.data || []);
    } catch (err) {
      console.error('Error fetching failed searches:', err);
      
      const errorMsg = err.response?.data?.message || 'Error al cargar búsquedas fallidas';
      setError(errorMsg);
      
      // Manejar errores específicos
      if (err.response?.status === 403) {
        toast.error('No tienes permisos para ver esta información');
      } else if (err.response?.status !== 401) {
        toast.error(errorMsg);
      }
      
      setFailedSearches([]);
    } finally {
      setLoadingFailed(false);
    }
  }, []);

  /**
   * Obtener estadísticas generales
   */
  const getSearchStats = useCallback(async (days = 30) => {
    setLoadingStats(true);
    setError(null);
    
    try {
      const response = await searchApi.getSearchStats(days);
      setStats(response.data || null);
    } catch (err) {
      console.error('Error fetching search stats:', err);
      
      const errorMsg = err.response?.data?.message || 'Error al cargar estadísticas';
      setError(errorMsg);
      
      // Manejar errores específicos
      if (err.response?.status === 403) {
        toast.error('No tienes permisos para ver esta información');
      } else if (err.response?.status !== 401) {
        toast.error(errorMsg);
      }
      
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  /**
   * Refrescar datos admin
   */
  const refreshAdminData = useCallback(async (days = 30, limit = 20) => {
    await Promise.all([
      getFailedSearches(limit, days),
      getSearchStats(days)
    ]);
  }, [getFailedSearches, getSearchStats]);

  return {
    // Failed searches
    failedSearches,
    loadingFailed,
    getFailedSearches,
    
    // Stats
    stats,
    loadingStats,
    getSearchStats,
    
    // General
    error,
    refreshAdminData
  };
};

export default useSearchAdmin;