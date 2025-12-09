import { useState, useEffect } from 'react';
import * as categoriesApi from '../api/categories.api';

/**
 * @hook useCategories
 * @description Hook para obtener categorías
 * @param {Object} options
 * @returns {Object}
 */
export const useCategories = (options = {}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getCategories(options);

        if (response.success) {
          setCategories(response.data || []);
          setPagination(response.pagination || null);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [JSON.stringify(options)]);

  return { categories, loading, error, pagination };
};

/**
 * @hook useCategoryDetails
 * @description Hook para obtener detalles de una categoría
 * @param {string} slug
 * @returns {Object}
 */
export const useCategoryDetails = (slug) => {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getCategoryBySlug(slug);

        if (response.success) {
          setCategory(response.data);
        } else {
          setError(response.message || 'Categoría no encontrada');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar categoría');
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [slug]);

  return { category, loading, error };
};

/**
 * @hook useCategoryTree
 * @description Hook para obtener árbol jerárquico de categorías
 * @returns {Object}
 */
export const useCategoryTree = () => {
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getCategoryTree();

        if (response.success) {
          setTree(response.data || []);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  return { tree, loading, error };
};

/**
 * @hook useFeaturedCategories
 * @description Hook para obtener categorías destacadas
 * @param {number} limit
 * @returns {Object}
 */
export const useFeaturedCategories = (limit = 6) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        const response = await categoriesApi.getFeaturedCategories(limit);

        if (response.success) {
          setCategories(response.data || []);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, [limit]);

  return { categories, loading, error };
};