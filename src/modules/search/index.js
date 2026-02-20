// modules/search/index.js
// Barrel público del módulo Search.
// Expone solo lo que otros módulos necesitan consumir.

// =========================================
// PÁGINAS
// =========================================
export { SearchPage } from './pages/SearchPage.jsx';

// =========================================
// HOOKS PÚBLICOS
// =========================================
export { useSearch }        from './presentation/hooks/useSearch.js';
export { useSearchHistory } from './presentation/hooks/useSearchHistory.js';
export { useSearchAdmin }   from './presentation/hooks/useSearchAdmin.js';

// =========================================
// STORE
// =========================================
export { useSearchStore, selectHasSuggestions, selectLastSearch } from './presentation/store/search.store.js';

// =========================================
// COMPONENTES REUTILIZABLES
// =========================================
export { SearchBar }            from './presentation/components/SearchBar.jsx';
export { SearchSuggestions }    from './presentation/components/SearchSuggestions.jsx';
export { PopularSearchesList }  from './presentation/components/PopularSearchesList.jsx';
export { TrendingSearchesList } from './presentation/components/TrendingSearchesList.jsx';
export { SearchHistoryList }    from './presentation/components/SearchHistoryList.jsx';

// =========================================
// CONSTANTES DE DOMINIO
// =========================================
export {
  QUERY_MIN_LENGTH,
  QUERY_MAX_LENGTH,
  SEARCH_LIMITS,
  SEARCH_DAYS,
  SUGGESTIONS_DEBOUNCE_MS,
  DEVICE_TYPE,
  CACHE_TTL,
} from './domain/search.model.js';

// =========================================
// ENTIDADES (para tipado en otros módulos)
// =========================================
export {
  SuggestionEntity,
  PopularSearchEntity,
  TrendingSearchEntity,
  SearchHistoryEntity,
  FailedSearchEntity,
  SearchStatsEntity,
} from './domain/search.entity.js';

// =========================================
// UTILIDADES
// =========================================
export {
  buildSearchQueryString,
  parseSearchQueryString,
  getDeviceType,
  formatTimeAgo,
  formatNumber,
  formatPercentage,
} from './utils/search.utils.js';