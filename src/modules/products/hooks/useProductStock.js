/**
 * @hook useProductStock
 * @description Verifica stock de un producto para una cantidad específica.
 * Las reglas de qué significa el resultado las aplica product.availability.
 */

import { useState, useCallback } from 'react';
import { canAddQuantity, getAvailabilityStatus } from '../domain/product.availability';

/**
 * @param {import('../repository/products.repository').ProductsRepository} repository
 * @param {string} [productId]
 * @returns {Object}
 */
export const useProductStock = (repository, productId) => {
  const [stockResult, setStockResult] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Verifica si hay stock suficiente para una cantidad dada.
   * Combina validación local (domain) con confirmación del backend.
   *
   * @param {import('../domain/product.entity').Product} product - Producto completo (para validación local)
   * @param {number} quantity - Cantidad deseada
   * @param {number} [currentCartQty] - Ya en carrito
   * @returns {Promise<{ available: boolean, reason?: string, remaining?: number }>}
   */
  const checkStock = useCallback(
    async (product, quantity, currentCartQty = 0) => {
      if (!product || !quantity) return { available: false };

      // 1. Validación rápida en dominio (sin HTTP)
      const localCheck = canAddQuantity(product, quantity, currentCartQty);
      if (!localCheck.allowed) {
        setStockResult(localCheck);
        return localCheck;
      }

      // 2. Confirmación con backend (solo si tenemos productId)
      if (!productId && !product._id) {
        setStockResult(localCheck);
        return localCheck;
      }

      setIsChecking(true);
      setError(null);

      try {
        const backendResult = await repository.checkStock(
          productId ?? product._id,
          quantity
        );

        const result = {
          available: backendResult?.available ?? false,
          stock: backendResult?.stock,
          allowBackorder: backendResult?.allowBackorder,
        };

        setStockResult(result);
        return result;
      } catch (err) {
        setError(err);
        // Si el backend falla, confiar en la validación local
        return localCheck;
      } finally {
        setIsChecking(false);
      }
    },
    [repository, productId]
  );

  return {
    stockResult,
    isChecking,
    error,
    checkStock,
  };
};

// ─────────────────────────────────────────────
// HOOK AUXILIAR: useRelatedProducts
// ─────────────────────────────────────────────

/**
 * @hook useRelatedProducts
 * @description Carga productos relacionados a un producto dado.
 * Separado de useProductDetail porque su ciclo de vida puede diferir.
 */
export const useRelatedProducts = (repository, productId, limit = 4) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!productId) return;

    setIsLoading(true);
    setError(null);

    try {
      const related = await repository.findRelated(productId, limit);
      setProducts(related);
    } catch (err) {
      setError(err);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [repository, productId, limit]);

  // Cargar automáticamente cuando productId cambie
  useState(() => { load(); });

  return { products, isLoading, error, reload: load };
};

export default useProductStock;