/**
 * @hook useCategoryTree
 * @description Hook especializado para el árbol jerárquico de categorías.
 *
 * Consume el store Zustand (no hace fetch propio).
 * Expone métodos de navegación sobre CategoryTreeNode[] y FlatCategory[].
 *
 * @param {Object} options
 * @param {boolean} options.autoFetch - Fetch del árbol al montar (default: true)
 */

import { useEffect, useCallback, useMemo } from 'react';
import {
  useCategoriesStore,
  selectTree,
  selectFlatList,
  selectTreeLoading,
  selectTreeError,
  selectHasTree,
} from '../store/categories.store.js';
import categoriesService from '../../application/categories.service.js';

const useCategoryTree = (options = {}) => {
  const { autoFetch = true } = options;

  // Store
  const tree        = useCategoriesStore(selectTree);
  const flatList    = useCategoriesStore(selectFlatList);
  const loading     = useCategoriesStore(selectTreeLoading);
  const error       = useCategoriesStore(selectTreeError);
  const hasTree     = useCategoriesStore(selectHasTree);
  const fetchTree   = useCategoriesStore((s) => s.fetchTree);

  useEffect(() => {
    if (autoFetch && !hasTree) {
      fetchTree();
    }
  }, [autoFetch, hasTree, fetchTree]);

  /* ── Navegación ─────────────────────────────────────────────────── */

  /** Buscar nodo por ID (recursivo) */
  const findById = useCallback((id) => {
    return categoriesService.findInTree(id, tree);
  }, [tree]);

  /** Buscar nodo por slug (recursivo) */
  const findBySlug = useCallback((slug) => {
    return categoriesService.findInTreeBySlug(slug, tree);
  }, [tree]);

  /** Hijos directos de una categoría */
  const getChildren = useCallback((categoryId) => {
    const node = findById(categoryId);
    return node?.children ?? [];
  }, [findById]);

  /** Si una categoría tiene hijos */
  const hasChildren = useCallback((categoryId) => {
    const node = findById(categoryId);
    return node?.hasChildren ?? false;
  }, [findById]);

  /** Ruta completa como string: "Electronics > Phones > Smartphones" */
  const getPath = useCallback((categoryId) => {
    const flat = flatList.find((c) => c._id === categoryId);
    return flat?.fullPath ?? null;
  }, [flatList]);

  /** Categorías de un nivel específico */
  const getCategoriesByLevel = useCallback((level) => {
    return flatList.filter((c) => c.level === level);
  }, [flatList]);

  /* ── Computed ───────────────────────────────────────────────────── */

  const rootCategories = useMemo(() => tree, [tree]);

  const totalCategories = useMemo(() => flatList.length, [flatList]);

  const maxDepth = useMemo(
    () => categoriesService.getMaxDepth(flatList),
    [flatList]
  );

  /* ── Acciones ───────────────────────────────────────────────────── */

  const refresh = useCallback(() => fetchTree(true), [fetchTree]);

  return {
    // Data
    tree,
    flatList,
    rootCategories,
    totalCategories,
    maxDepth,

    // Estado
    loading,
    error,
    isEmpty : tree.length === 0,

    // Navegación
    findById,
    findBySlug,
    getChildren,
    hasChildren,
    getPath,
    getCategoriesByLevel,

    // Acciones
    fetchTree,
    refresh,
  };
};

export default useCategoryTree;