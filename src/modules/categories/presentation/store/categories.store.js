/**
 * @module CategoriesStore
 * @description Store Zustand para el módulo Categories.
 *
 * Reemplaza completamente a CategoriesContext.
 *
 * RESPONSABILIDADES:
 * - Estado global de categorías (caché en memoria)
 * - Acciones atómicas (fetch, reset, select)
 * - Selectores granulares (no retornan objetos compuestos innecesarios)
 * - Cache con TTL configurable
 *
 * REGLAS:
 * - No contiene lógica de negocio (delega al Service)
 * - No conoce componentes React
 * - Acciones son fire-and-forget o retornan primitivos
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import categoriesService from '../../application/categories.service.js';
import { CategoryPagination } from '../../domain/category.model.js';

/* ─── Configuración ──────────────────────────────────────────────── */

const CACHE_TTL = {
  list     : 5  * 60 * 1000, // 5 min
  tree     : 10 * 60 * 1000, // 10 min
  featured : 10 * 60 * 1000,
  popular  : 10 * 60 * 1000,
};

const makeTimestamps = () => ({
  list     : null,
  tree     : null,
  featured : null,
  popular  : null,
});

const isStale = (timestamp, ttl) => {
  if (!timestamp) return true;
  return Date.now() - timestamp > ttl;
};

/* ─── Estado inicial ─────────────────────────────────────────────── */

const INITIAL_STATE = {
  // Listas
  categories  : [],           // CategoryEntity[]
  tree        : [],           // CategoryTreeNode[]
  flatList    : [],           // FlatCategory[]
  featured    : [],           // CategoryEntity[]
  popular     : [],           // CategoryEntity[]

  // Detalle
  selectedCategory : null,    // CategoryEntity | null

  // Paginación
  pagination  : CategoryPagination.empty(),

  // Carga
  loading : {
    list     : false,
    tree     : false,
    featured : false,
    popular  : false,
    detail   : false,
    action   : false,          // create / update / delete
  },

  // Errores (null o string)
  error : {
    list     : null,
    tree     : null,
    featured : null,
    popular  : null,
    detail   : null,
    action   : null,
  },

  // Timestamps de caché
  _timestamps : makeTimestamps(),

  initialized : false,
};

/* ─── Store ──────────────────────────────────────────────────────── */

export const useCategoriesStore = create(
  subscribeWithSelector((set, get) => ({
    ...INITIAL_STATE,

    /* ── Helpers internos ─────────────────────────────────────────── */

    _setLoading: (key, value) =>
      set((s) => ({ loading: { ...s.loading, [key]: value } })),

    _setError: (key, value) =>
      set((s) => ({ error: { ...s.error, [key]: value } })),

    _stampNow: (key) =>
      set((s) => ({ _timestamps: { ...s._timestamps, [key]: Date.now() } })),

    /* ── Fetch: lista ─────────────────────────────────────────────── */

    fetchCategories: async (params = {}, forceRefresh = false) => {
      const { _timestamps, _setLoading, _setError, _stampNow } = get();

      if (!forceRefresh && !isStale(_timestamps.list, CACHE_TTL.list)) {
        return get().categories;
      }

      _setLoading('list', true);
      _setError('list', null);

      try {
        const { entities, pagination } = await categoriesService.getAll(params);
        set({ categories: entities, pagination });
        _stampNow('list');
        return entities;
      } catch (err) {
        _setError('list', err.message);
        set({ categories: [], pagination: CategoryPagination.empty() });
        throw err;
      } finally {
        _setLoading('list', false);
      }
    },

    /* ── Fetch: árbol ─────────────────────────────────────────────── */

    fetchTree: async (forceRefresh = false) => {
      const { _timestamps, _setLoading, _setError, _stampNow } = get();

      if (!forceRefresh && !isStale(_timestamps.tree, CACHE_TTL.tree)) {
        return get().tree;
      }

      _setLoading('tree', true);
      _setError('tree', null);

      try {
        const tree     = await categoriesService.getTree();
        const flatList = categoriesService.flattenTree(tree);
        set({ tree, flatList });
        _stampNow('tree');
        return tree;
      } catch (err) {
        _setError('tree', err.message);
        set({ tree: [], flatList: [] });
        throw err;
      } finally {
        _setLoading('tree', false);
      }
    },

    /* ── Fetch: destacadas ───────────────────────────────────────── */

    fetchFeatured: async (limit = 6, forceRefresh = false) => {
      const { _timestamps, _setLoading, _setError, _stampNow } = get();

      if (!forceRefresh && !isStale(_timestamps.featured, CACHE_TTL.featured)) {
        return get().featured;
      }

      _setLoading('featured', true);
      _setError('featured', null);

      try {
        const featured = await categoriesService.getFeatured(limit);
        set({ featured });
        _stampNow('featured');
        return featured;
      } catch (err) {
        _setError('featured', err.message);
        throw err;
      } finally {
        _setLoading('featured', false);
      }
    },

    /* ── Fetch: populares ────────────────────────────────────────── */

    fetchPopular: async (limit = 10, forceRefresh = false) => {
      const { _timestamps, _setLoading, _setError, _stampNow } = get();

      if (!forceRefresh && !isStale(_timestamps.popular, CACHE_TTL.popular)) {
        return get().popular;
      }

      _setLoading('popular', true);
      _setError('popular', null);

      try {
        const popular = await categoriesService.getPopular(limit);
        set({ popular });
        _stampNow('popular');
        return popular;
      } catch (err) {
        _setError('popular', err.message);
        throw err;
      } finally {
        _setLoading('popular', false);
      }
    },

    /* ── Fetch: detalle por slug ──────────────────────────────────── */

    fetchBySlug: async (slug) => {
      const { _setLoading, _setError } = get();

      _setLoading('detail', true);
      _setError('detail', null);

      try {
        const entity = await categoriesService.getBySlug(slug);
        set({ selectedCategory: entity });
        return entity;
      } catch (err) {
        _setError('detail', err.message);
        set({ selectedCategory: null });
        throw err;
      } finally {
        _setLoading('detail', false);
      }
    },

    /* ── Mutaciones ──────────────────────────────────────────────── */

    createCategory: async (data) => {
      const { _setLoading, _setError } = get();

      _setLoading('action', true);
      _setError('action', null);

      try {
        const entity = await categoriesService.create(data, get().categories);
        // Invalidar caché de lista
        set((s) => ({
          categories  : [entity, ...s.categories],
          _timestamps : { ...s._timestamps, list: null },
        }));
        return entity;
      } catch (err) {
        _setError('action', err.message);
        throw err;
      } finally {
        _setLoading('action', false);
      }
    },

    updateCategory: async (categoryId, data) => {
      const { _setLoading, _setError } = get();

      _setLoading('action', true);
      _setError('action', null);

      try {
        const updated = await categoriesService.update(categoryId, data, get().categories);
        set((s) => ({
          categories : s.categories.map((c) => c._id === categoryId ? updated : c),
          selectedCategory: s.selectedCategory?._id === categoryId ? updated : s.selectedCategory,
          _timestamps: { ...s._timestamps, list: null },
        }));
        return updated;
      } catch (err) {
        _setError('action', err.message);
        throw err;
      } finally {
        _setLoading('action', false);
      }
    },

    removeCategory: async (categoryId) => {
      const { _setLoading, _setError } = get();

      _setLoading('action', true);
      _setError('action', null);

      try {
        const category = get().categories.find((c) => c._id === categoryId) ?? null;
        const result   = await categoriesService.remove(categoryId, category);
        set((s) => ({
          categories  : s.categories.filter((c) => c._id !== categoryId),
          _timestamps : { ...s._timestamps, list: null },
        }));
        return result;
      } catch (err) {
        _setError('action', err.message);
        throw err;
      } finally {
        _setLoading('action', false);
      }
    },

    /* ── Búsqueda ────────────────────────────────────────────────── */

    searchCategories: async (query) => {
      const { _setLoading, _setError } = get();

      _setLoading('list', true);
      _setError('list', null);

      try {
        const results = await categoriesService.search(query);
        set({
          categories : results,
          pagination : new CategoryPagination({
            page: 1, limit: results.length, total: results.length, pages: 1,
          }),
        });
        return results;
      } catch (err) {
        _setError('list', err.message);
        set({ categories: [] });
        throw err;
      } finally {
        _setLoading('list', false);
      }
    },

    /* ── Selección ───────────────────────────────────────────────── */

    selectCategory: (entity) => set({ selectedCategory: entity }),
    clearSelected : ()       => set({ selectedCategory: null }),

    /* ── Paginación ──────────────────────────────────────────────── */

    setPage: (page) =>
      set((s) => ({ pagination: new CategoryPagination({ ...s.pagination, page }) })),

    /* ── Inicialización ──────────────────────────────────────────── */

    initialize: async () => {
      if (get().initialized) return;

      try {
        await Promise.all([get().fetchTree(), get().fetchFeatured()]);
        set({ initialized: true });
      } catch {
        // silencioso — errores ya en state.error.*
      }
    },

    /* ── Reset / Caché ───────────────────────────────────────────── */

    invalidateCache: (key) =>
      set((s) => ({ _timestamps: { ...s._timestamps, [key]: null } })),

    invalidateAll: () =>
      set({ _timestamps: makeTimestamps() }),

    refreshAll: async () => {
      const store = get();
      store.invalidateAll();
      await Promise.all([
        store.fetchCategories({}, true),
        store.fetchTree(true),
        store.fetchFeatured(6, true),
        store.fetchPopular(10, true),
      ]);
    },

    clearErrors: () =>
      set({
        error: {
          list: null, tree: null, featured: null,
          popular: null, detail: null, action: null,
        },
      }),

    reset: () => set(INITIAL_STATE),
  }))
);

/* ─── Selectores (granulares, sin objetos compuestos) ────────────── */

export const selectCategories      = (s) => s.categories;
export const selectTree            = (s) => s.tree;
export const selectFlatList        = (s) => s.flatList;
export const selectFeatured        = (s) => s.featured;
export const selectPopular         = (s) => s.popular;
export const selectSelectedCategory= (s) => s.selectedCategory;
export const selectPagination      = (s) => s.pagination;
export const selectInitialized     = (s) => s.initialized;

// Loading — selectores atómicos por operación
export const selectListLoading     = (s) => s.loading.list;
export const selectTreeLoading     = (s) => s.loading.tree;
export const selectDetailLoading   = (s) => s.loading.detail;
export const selectActionLoading   = (s) => s.loading.action;
export const selectFeaturedLoading = (s) => s.loading.featured;
export const selectPopularLoading  = (s) => s.loading.popular;

// Errores — selectores atómicos por operación
export const selectListError       = (s) => s.error.list;
export const selectTreeError       = (s) => s.error.tree;
export const selectDetailError     = (s) => s.error.detail;
export const selectActionError     = (s) => s.error.action;

// Computed
export const selectIsEmpty         = (s) => s.categories.length === 0;
export const selectHasTree         = (s) => s.tree.length > 0;
export const selectHasFeatured     = (s) => s.featured.length > 0;
export const selectHasPopular      = (s) => s.popular.length > 0;
export const selectTotalCategories = (s) => s.pagination.total;