import { useState, useEffect, useCallback, useRef } from 'react';
import { getCategoryTree } from '../api/categories.api';

/**
 * @hook useCategoryTree
 * @description Hook especializado para árbol jerárquico de categorías
 * 
 * CARACTERÍSTICAS:
 * - Cache agresivo (10 min TTL) - el árbol cambia poco
 * - Navegación por niveles
 * - Búsqueda en árbol
 * - Expansión/colapso
 * - Flat list para selects
 * 
 * @param {Object} options - Opciones
 * @param {boolean} options.autoFetch - Auto fetch al montar
 * @param {number} options.cacheTTL - TTL del cache en ms
 * 
 * @returns {Object} Árbol y métodos de navegación
 */
const useCategoryTree = (options = {}) => {
  const {
    autoFetch = true,
    cacheTTL = 10 * 60 * 1000, // 10 minutos (árbol cambia poco)
  } = options;

  const [tree, setTree] = useState([]);
  const [flatList, setFlatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache
  const cache = useRef({
    tree: null,
    flatList: null,
    timestamp: null,
  });

  /**
   * Verifica si el cache es válido
   */
  const isCacheValid = useCallback(() => {
    if (!cache.current.tree || !cache.current.timestamp) {
      return false;
    }

    const now = Date.now();
    const elapsed = now - cache.current.timestamp;

    return elapsed < cacheTTL;
  }, [cacheTTL]);

  /**
   * Actualiza el cache
   */
  const updateCache = useCallback((treeData, flatData) => {
    cache.current = {
      tree: treeData,
      flatList: flatData,
      timestamp: Date.now(),
    };
  }, []);

  /**
   * Convierte árbol a lista plana (para selects, breadcrumbs)
   */
  const flattenTree = useCallback((nodes, level = 0, parentPath = []) => {
    let result = [];

    nodes.forEach((node) => {
      const path = [...parentPath, node.name];
      
      result.push({
        _id: node._id,
        name: node.name,
        slug: node.slug,
        level,
        parentPath,
        fullPath: path.join(' > '),
        hasChildren: node.children && node.children.length > 0,
        productCount: node.productCount || 0,
      });

      if (node.children && node.children.length > 0) {
        result = result.concat(
          flattenTree(node.children, level + 1, path)
        );
      }
    });

    return result;
  }, []);

  /**
   * Obtener árbol de categorías
   */
  const fetchTree = useCallback(async (forceRefresh = false) => {
    // Usar cache si es válido
    if (!forceRefresh && isCacheValid()) {
      setTree(cache.current.tree);
      setFlatList(cache.current.flatList);
      return cache.current.tree;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getCategoryTree();
      const treeData = response.data;
      const flatData = flattenTree(treeData);

      setTree(treeData);
      setFlatList(flatData);
      updateCache(treeData, flatData);

      return treeData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al obtener árbol de categorías';
      setError(errorMessage);
      console.error('[useCategoryTree] Error fetching:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [isCacheValid, flattenTree, updateCache]);

  /**
   * Buscar categoría en árbol por ID
   */
  const findById = useCallback((categoryId, nodes = tree) => {
    for (const node of nodes) {
      if (node._id === categoryId) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const found = findById(categoryId, node.children);
        if (found) return found;
      }
    }

    return null;
  }, [tree]);

  /**
   * Buscar categoría en árbol por slug
   */
  const findBySlug = useCallback((slug, nodes = tree) => {
    for (const node of nodes) {
      if (node.slug === slug) {
        return node;
      }

      if (node.children && node.children.length > 0) {
        const found = findBySlug(slug, node.children);
        if (found) return found;
      }
    }

    return null;
  }, [tree]);

  /**
   * Obtener path completo de una categoría
   */
  const getPath = useCallback((categoryId) => {
    const category = flatList.find((c) => c._id === categoryId);
    return category ? category.fullPath : null;
  }, [flatList]);

  /**
   * Obtener categorías de un nivel específico
   */
  const getCategoriesByLevel = useCallback((level) => {
    return flatList.filter((c) => c.level === level);
  }, [flatList]);

  /**
   * Obtener categorías raíz (nivel 0)
   */
  const getRootCategories = useCallback(() => {
    return tree;
  }, [tree]);

  /**
   * Obtener hijos de una categoría
   */
  const getChildren = useCallback((categoryId) => {
    const category = findById(categoryId);
    return category?.children || [];
  }, [findById]);

  /**
   * Verificar si tiene hijos
   */
  const hasChildren = useCallback((categoryId) => {
    const category = findById(categoryId);
    return category?.children && category.children.length > 0;
  }, [findById]);

  /**
   * Contar total de categorías
   */
  const countCategories = useCallback((nodes = tree) => {
    let count = nodes.length;

    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        count += countCategories(node.children);
      }
    });

    return count;
  }, [tree]);

  /**
   * Obtener profundidad máxima del árbol
   */
  const getMaxDepth = useCallback(() => {
    if (flatList.length === 0) return 0;
    return Math.max(...flatList.map((c) => c.level)) + 1;
  }, [flatList]);

  /**
   * Refrescar árbol
   */
  const refresh = useCallback(() => {
    return fetchTree(true);
  }, [fetchTree]);

  /**
   * Limpiar cache
   */
  const clearCache = useCallback(() => {
    cache.current = {
      tree: null,
      flatList: null,
      timestamp: null,
    };
  }, []);

  // Auto fetch al montar
  useEffect(() => {
    if (autoFetch) {
      fetchTree();
    }
  }, [autoFetch, fetchTree]);

  // Computed values
  const isEmpty = tree.length === 0;
  const totalCategories = countCategories();
  const maxDepth = getMaxDepth();

  return {
    // Data
    tree,
    flatList,
    rootCategories: getRootCategories(),
    totalCategories,
    maxDepth,
    
    // Loading states
    loading,
    error,
    isEmpty,
    
    // Navigation methods
    findById,
    findBySlug,
    getPath,
    getCategoriesByLevel,
    getChildren,
    hasChildren,
    
    // Actions
    fetchTree,
    refresh,
    clearCache,
    setError,
  };
};

export default useCategoryTree;