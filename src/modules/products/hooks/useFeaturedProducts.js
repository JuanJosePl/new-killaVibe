/**
 * @hook useFeaturedProducts
 * @description Carga y cachea productos destacados.
 *
 * ESTRATEGIA: cache-first con TTL más largo (10 min).
 * Si múltiples componentes montan este hook simultáneamente,
 * el cache singleton evita requests duplicados.
 */

import { useState, useEffect, useCallback } from 'react';
import productCache from '../cache/product.cache';
import { CACHE_CONFIG } from '../types/product.types';

// Flag de módulo para evitar fetches paralelos en el mismo render cycle
let isFetchingFeatured = false;
let featuredCache = { products: null, expiresAt: 0 };

/**
 * @param {import('../repository/products.repository').ProductsRepository} repository
 * @param {number} [limit=8]
 * @returns {Object}
 */
export const useFeaturedProducts = (repository, limit = 8) => {
  const [products, setProducts] = useState(() => featuredCache.products ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadFeatured = useCallback(
    async (force = false) => {
      // Usar módulo-level cache si no expiró
      const now = Date.now();
      if (!force && featuredCache.products && now < featuredCache.expiresAt) {
        setProducts(featuredCache.products);
        return;
      }

      // Evitar requests paralelos
      if (isFetchingFeatured && !force) return;

      isFetchingFeatured = true;
      setIsLoading(true);
      setError(null);

      try {
        const fetched = await repository.findFeatured(limit);

        // Guardar en entity cache también
        productCache.setMany(fetched, CACHE_CONFIG.FEATURED_TTL_MS);

        // Guardar en módulo-level cache
        featuredCache = {
          products: fetched,
          expiresAt: now + CACHE_CONFIG.FEATURED_TTL_MS,
        };

        setProducts(fetched);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
        isFetchingFeatured = false;
      }
    },
    [repository, limit]
  );

  useEffect(() => {
    loadFeatured();
  }, [loadFeatured]);

  const refresh = useCallback(() => {
    featuredCache = { products: null, expiresAt: 0 };
    loadFeatured(true);
  }, [loadFeatured]);

  return {
    products,
    isLoading,
    error,
    refresh,
    isEmpty: !isLoading && products.length === 0,
  };
};

export default useFeaturedProducts;