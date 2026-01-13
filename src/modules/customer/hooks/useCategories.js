// src/modules/customer/hooks/useCategories.js

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerCategories } from "../context/CustomerCategoriesContext";
import * as customerCategoriesApi from "../api/customerCategories.api";

/**
 * @hook useCategories
 * @description Hook de abstracción para categorías
 *
 * Features:
 * - Consume CustomerCategoriesContext
 * - Navegación simplificada
 * - Breadcrumb automático
 * - Búsqueda integrada
 */
const useCategories = () => {
  const navigate = useNavigate();

  // Consumir contexto
  const {
    categoryTree,
    flatCategories,
    featuredCategories,
    isLoading: contextLoading,
    error: contextError,
    getCategoryBySlug: contextGetBySlug,
    findBySlug,
    getSubcategories,
    searchCategories: contextSearch,
    getPopularCategories,
    loadCategories,
    invalidateCache,
  } = useCustomerCategories();

  // Estado local adicional
  const [currentCategory, setCurrentCategory] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============================================
  // SELECCIONAR CATEGORÍA Y CALCULAR BREADCRUMB
  // ============================================
  const selectCategory = useCallback(
    (category) => {
      if (!category) {
        setCurrentCategory(null);
        setBreadcrumb([]);
        return;
      }

      setCurrentCategory(category);

      // Calcular breadcrumb desde el árbol
      const path = customerCategoriesApi.buildBreadcrumb(
        categoryTree,
        category.slug
      );
      setBreadcrumb(path);
    },
    [categoryTree]
  );

  // ============================================
  // CARGAR DETALLES DE CATEGORÍA
  // ============================================
  const loadCategoryDetails = useCallback(
    async (slug) => {
      try {
        setIsLoading(true);
        setError(null);

        const category = await contextGetBySlug(slug);
        selectCategory(category);

        return category;
      } catch (err) {
        setError(err.message || "Categoría no encontrada");
        setCurrentCategory(null);
        setBreadcrumb([]);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contextGetBySlug, selectCategory]
  );

  // ============================================
  // BUSCAR CATEGORÍAS
  // ============================================
  const searchCategories = useCallback(
    async (query) => {
      if (!query || query.trim().length < 2) return [];
      return await contextSearch(query);
    },
    [contextSearch]
  );

  // ============================================
  // NAVEGACIÓN
  // ============================================
  const navigateToCategory = useCallback(
    (slug) => {
      navigate(`/customer/categories/${slug}`);
    },
    [navigate]
  );

  const navigateUp = useCallback(() => {
    if (breadcrumb.length > 1) {
      const parent = breadcrumb[breadcrumb.length - 2];
      navigateToCategory(parent.slug);
    } else {
      navigate("/customer/categories");
    }
  }, [breadcrumb, navigateToCategory, navigate]);

  const backToList = useCallback(() => {
    navigate("/customer/categories");
  }, [navigate]);

  // ============================================
  // HELPERS
  // ============================================
  const findCategoryBySlug = useCallback(
    (slug) => {
      return findBySlug(slug);
    },
    [findBySlug]
  );

  const refresh = useCallback(() => {
    loadCategories();
  }, [loadCategories]);

  // ============================================
  // RETURN
  // ============================================
  return {
    // Data
    categoryTree,
    flatCategories,
    featuredCategories,
    currentCategory,
    breadcrumb,

    // Estados (combinados)
    isLoading: contextLoading || isLoading,
    error: contextError || error,

    // Métodos
    loadCategories,
    selectCategory,
    findCategoryBySlug,
    getSubcategories,
    loadCategoryDetails,
    searchCategories,
    getPopularCategories,
    navigateToCategory,
    navigateUp,
    backToList,
    refresh,
    invalidateCache,
  };
};

export default useCategories;
