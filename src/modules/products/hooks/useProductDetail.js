/**
 * @hook useProductDetail
 * @description Carga un producto individual por slug o ID.
 *
 * ESTRATEGIA: cache-first.
 * 1. Busca en entity cache.
 * 2. Si hay miss, fetch desde repository y guarda en cache.
 * 3. Expone refetch() para invalidación manual.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import productCache from '../cache/product.cache';
import { CACHE_CONFIG } from '../types/product.types';

/**
 * @param {import('../repository/products.repository').ProductsRepository} repository
 * @param {string} slugOrId - Slug o ID del producto
 * @returns {Object}
 */
export const useProductDetail = (repository, slugOrId) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(!!slugOrId);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(
    async (identifier, bypassCache = false) => {
      if (!identifier) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Intentar desde caché (si no se fuerza bypass)
        if (!bypassCache) {
          // Intentar por slug primero, luego por id
          const cached =
            productCache.getBySlug(identifier) ?? productCache.get(identifier);

          if (cached) {
            setProduct(cached);
            setIsLoading(false);
            return;
          }
        }

        // 2. Fetch desde repository
        // Detectar si es un ObjectId de Mongo o un slug
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(identifier);
        const fetched = isMongoId
          ? await repository.findById(identifier)
          : await repository.findBySlug(identifier);

        if (fetched) {
          productCache.set(fetched, CACHE_CONFIG.ENTITY_TTL_MS);
          setProduct(fetched);
        } else {
          setError({ code: 'PRODUCT_NOT_FOUND', message: 'Producto no encontrado' });
          setProduct(null);
        }
      } catch (err) {
        setError(err);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    },
    [repository]
  );

  useEffect(() => {
    fetchProduct(slugOrId);
  }, [slugOrId, fetchProduct]);

  /**
   * Refresca el producto invalidando el caché.
   */
  const refetch = useCallback(() => {
    if (slugOrId) {
      productCache.invalidateBySlug(slugOrId);
      productCache.invalidate(slugOrId);
      fetchProduct(slugOrId, true);
    }
  }, [slugOrId, fetchProduct]);

  return {
    product,
    isLoading,
    error,
    refetch,
    notFound: !isLoading && !product && !!error,
  };
};

export default useProductDetail;