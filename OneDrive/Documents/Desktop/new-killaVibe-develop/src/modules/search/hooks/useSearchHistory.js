// src/hooks/useSearchHistory.js
import { useState, useCallback } from 'react';
import searchApi from '../api/searchApi';
import { toast } from 'react-toastify';

/**
 * @hook useSearchHistory
 * @description Hook para historial personal de búsquedas (requiere auth)
 */
const useSearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener historial personal
   */
  const getHistory = useCallback(async (limit = 20) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await searchApi.getUserSearchHistory(limit);
      setHistory(response.data || []);
    } catch (err) {
      console.error('Error fetching search history:', err);
      
      const errorMsg = err.response?.data?.message || 'Error al cargar historial';
      setError(errorMsg);
      
      // No mostrar toast si es 401 (no autenticado)
      if (err.response?.status !== 401) {
        toast.error(errorMsg);
      }
      
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refrescar historial
   */
  const refreshHistory = useCallback(() => {
    return getHistory();
  }, [getHistory]);

  return {
    history,
    loading,
    error,
    getHistory,
    refreshHistory
  };
};

export default useSearchHistory;