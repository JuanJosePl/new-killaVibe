// modules/search/pages/SearchPage.jsx
//
// Página de búsqueda: muestra populares, tendencias e historial personal.
// La búsqueda full-text de productos se maneja en /products con ?search=query.
//
// Usa: useSearch (populares + tendencias) + useSearchHistory (historial personal)
// Sin Context. Sin lógica de dominio en el componente.

import React, { useState } from 'react';
import { useNavigate }         from 'react-router-dom';
import { useSearch }           from '../presentation/hooks/useSearch.js';
import { useSearchHistory }    from '../presentation/hooks/useSearchHistory.js';
import { SearchBar }           from '../presentation/components/SearchBar.jsx';
import { PopularSearchesList } from '../presentation/components/PopularSearchesList.jsx';
import { TrendingSearchesList } from '../presentation/components/TrendingSearchesList.jsx';
import { SearchHistoryList }   from '../presentation/components/SearchHistoryList.jsx';
import { buildSearchQueryString } from '../utils/search.utils.js';

/**
 * @page SearchPage
 * @description Página de inicio de búsqueda.
 * Muestra populares, tendencias e historial del usuario.
 */
export function SearchPage() {
  const navigate     = useNavigate();
  const [activeTab, setActiveTab] = useState('popular');

  const {
    popularSearches,
    loadingPopular,
    trendingSearches,
    loadingTrending,
    navigationHistory,
    refreshPopular,
    refreshTrending,
  } = useSearch({ withPopular: true, withTrending: true });

  const {
    history,
    isLoading: loadingHistory,
    error:     historyError,
    refreshHistory,
  } = useSearchHistory({ autoLoad: true });

  const handleSearch = (query) => {
    const qs = buildSearchQueryString(query);
    navigate(`/products?${qs}`);
  };

  const tabs = [
    { id: 'popular',  label: '🔥 Populares',   count: popularSearches.length  },
    { id: 'trending', label: '📈 Tendencias',   count: trendingSearches.length },
    { id: 'history',  label: '🕐 Mi Historial', count: history.length          },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¿Qué estás buscando?</h1>
        <p className="text-gray-500">Encuentra lo que necesitas entre miles de productos</p>
      </div>

      {/* Barra de búsqueda principal */}
      <SearchBar
        placeholder="Buscar productos, marcas, categorías..."
        className="mb-8"
        onSearch={handleSearch}
        autoFocus
      />

      {/* Historial de sesión reciente */}
      {navigationHistory.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 px-1">Recientes en esta sesión</p>
          <div className="flex flex-wrap gap-2">
            {navigationHistory.slice(0, 5).map((entry, idx) => (
              <button
                key={idx}
                onClick={() => handleSearch(entry.query)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm
                  text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <span>🕐</span>
                {entry.query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab headers */}
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="p-5">
          {/* Populares */}
          {activeTab === 'popular' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Búsquedas más frecuentes en los últimos 30 días</p>
                <button
                  onClick={refreshPopular}
                  disabled={loadingPopular}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  ↻ Actualizar
                </button>
              </div>
              <PopularSearchesList
                searches={popularSearches}
                onSelect={handleSearch}
                isLoading={loadingPopular}
              />
            </div>
          )}

          {/* Tendencias */}
          {activeTab === 'trending' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Búsquedas con mayor crecimiento en las últimas 24 horas</p>
                <button
                  onClick={refreshTrending}
                  disabled={loadingTrending}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  ↻ Actualizar
                </button>
              </div>
              <TrendingSearchesList
                searches={trendingSearches}
                onSelect={handleSearch}
                isLoading={loadingTrending}
              />
            </div>
          )}

          {/* Historial personal */}
          {activeTab === 'history' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-500">Tus últimas búsquedas</p>
                <button
                  onClick={refreshHistory}
                  disabled={loadingHistory}
                  className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  ↻ Actualizar
                </button>
              </div>
              <SearchHistoryList
                history={history}
                onSelect={handleSearch}
                isLoading={loadingHistory}
                error={historyError}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;