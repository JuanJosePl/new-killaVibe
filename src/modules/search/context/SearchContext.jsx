// src/context/SearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * @context SearchContext
 * @description Context global para estado de búsquedas
 * 
 * Proporciona:
 * - Estado de búsqueda actual
 * - Historial de navegación de búsquedas
 * - Filtros aplicados
 */

const SearchContext = createContext(null);

export const useSearchContext = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext debe usarse dentro de SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  // Estado actual de búsqueda
  const [currentSearch, setCurrentSearch] = useState({
    query: '',
    resultsCount: 0,
    filters: {},
    timestamp: null
  });

  // Historial de navegación (últimas 10 búsquedas en sesión)
  const [navigationHistory, setNavigationHistory] = useState([]);

  /**
   * Actualizar búsqueda actual
   */
  const updateCurrentSearch = useCallback((searchData) => {
    const newSearch = {
      ...searchData,
      timestamp: new Date().toISOString()
    };

    setCurrentSearch(newSearch);

    // Agregar a historial de navegación
    setNavigationHistory(prev => {
      const updated = [newSearch, ...prev];
      return updated.slice(0, 10); // Mantener solo últimas 10
    });
  }, []);

  /**
   * Limpiar búsqueda actual
   */
  const clearCurrentSearch = useCallback(() => {
    setCurrentSearch({
      query: '',
      resultsCount: 0,
      filters: {},
      timestamp: null
    });
  }, []);

  /**
   * Limpiar historial de navegación
   */
  const clearNavigationHistory = useCallback(() => {
    setNavigationHistory([]);
  }, []);

  /**
   * Obtener última búsqueda del historial
   */
  const getLastSearch = useCallback(() => {
    return navigationHistory[0] || null;
  }, [navigationHistory]);

  const value = {
    // Estado
    currentSearch,
    navigationHistory,

    // Métodos
    updateCurrentSearch,
    clearCurrentSearch,
    clearNavigationHistory,
    getLastSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;