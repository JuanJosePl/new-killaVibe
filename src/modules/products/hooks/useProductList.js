/**
 * @hook useProductList
 * @description Hook para gestionar un listado paginado de productos.
 *
 * RESPONSABILIDAD ÚNICA: cargar y gestionar una lista de productos.
 * NO sincroniza URL. NO gestiona filtros. Se usa en composición con useProductFilters.
 *
 * USO:
 *   const repo = useProductsRepository();
 *   const { products, pagination, isLoading, error, reload } = useProductList(repo);
 *
 *   // Composición con filtros:
 *   const { filters } = useProductFilters();
 *   const list = useProductList(repo);
 *   useEffect(() => { list.reload(filters); }, [filters]);
 */

import { useState, useCallback, useRef } from 'react';
import productCache from '../cache/product.cache';

/**
 * @param {import('../repository/products.repository').ProductsRepository} repository
 * @returns {Object}
 */
export const useProductList = (repository) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Evitar race conditions: si el usuario cambia filtros rápidamente,
  // solo procesar la respuesta de la última request.
  const requestIdRef = useRef(0);

  /**
   * Carga productos con los filtros dados.
   * @param {Object} [filters={}]
   */
  const reload = useCallback(
    async (filters = {}) => {
      const currentRequestId = ++requestIdRef.current;

      setIsLoading(true);
      setError(null);

      try {
        // Si hay categoría, usar endpoint dedicado
        let result;
        if (filters.category) {
          const { category, ...rest } = filters;
          result = await repository.findByCategory(category, rest);
        } else {
          result = await repository.findMany(filters);
        }

        // Si ya salió una request más nueva, descartar esta respuesta
        if (currentRequestId !== requestIdRef.current) return;

        // Guardar en caché individual
        productCache.setMany(result.products);

        setProducts(result.products);
        setPagination(result.pagination);
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return;
        setError(err);
        setProducts([]);
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [repository]
  );

  /**
   * Limpia el estado del listado.
   */
  const clear = useCallback(() => {
    setProducts([]);
    setPagination({ page: 1, pages: 1, total: 0, limit: 12, hasNextPage: false, hasPrevPage: false });
    setError(null);
  }, []);

  return {
    products,
    pagination,
    isLoading,
    error,
    reload,
    clear,
    isEmpty: !isLoading && products.length === 0,
  };
};

export default useProductList;