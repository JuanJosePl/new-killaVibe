import { useState, useCallback } from 'react';
import { getCategorySEOContext } from '../api/categories.api';

/**
 * @hook useCategorySEO
 * @description Hook para obtener contexto SEO de categoría (reutilizable)
 * 
 * CASOS DE USO:
 * - Productos que necesitan SEO de su categoría
 * - Páginas que comparten breadcrumb de categoría
 * - Meta tags dinámicos
 * 
 * ✅ NUEVO: Consume endpoint GET /categories/:id/seo
 * 
 * @returns {Object} SEO context, loading, error, y métodos
 */
const useCategorySEO = () => {
  const [seoContext, setSeoContext] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Obtener contexto SEO de una categoría
   * 
   * @param {string} categoryId - ID de la categoría
   * @returns {Promise<Object>} SEO context
   */
  const fetchSEOContext = useCallback(async (categoryId) => {
    if (!categoryId) {
      const err = new Error('categoryId es requerido');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getCategorySEOContext(categoryId);
      const data = response?.data || null;
      
      setSeoContext(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener SEO context';
      setError(errorMessage);
      setSeoContext(null);
      console.error('[useCategorySEO] Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Limpiar SEO context
   */
  const clearSEOContext = useCallback(() => {
    setSeoContext(null);
    setError(null);
  }, []);

  /**
   * Verificar si hay SEO context cargado
   */
  const hasSEOContext = seoContext !== null;

  /**
   * Obtener meta tags listos para React Helmet
   */
  const getMetaTags = useCallback(() => {
    if (!seoContext || !seoContext.metaTags) {
      return {};
    }
    return seoContext.metaTags;
  }, [seoContext]);

  return {
    // Data
    seoContext,
    
    // Computed
    hasSEOContext,
    metaTags: getMetaTags(),
    
    // States
    loading,
    error,
    
    // Actions
    fetchSEOContext,
    clearSEOContext,
  };
};

export default useCategorySEO;