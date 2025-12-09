import { useState, useEffect } from 'react';
import * as productsApi from '../api/products.api';

/**
 * @hook useProductDetails
 * @description Hook para obtener detalles de un producto
 * @param {string} slugOrId - Slug o ID del producto
 * @returns {Object} { product, loading, error, refetch }
 */
export const useProductDetails = (slugOrId) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    if (!slugOrId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await productsApi.getProductBySlug(slugOrId);

      if (response.success) {
        setProduct(response.data);
      } else {
        setError(response.message || 'Producto no encontrado');
        setProduct(null);
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Error al cargar el producto');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [slugOrId]);

  const refetch = () => {
    fetchProduct();
  };

  return {
    product,
    loading,
    error,
    refetch
  };
};

/**
 * @hook useRelatedProducts
 * @description Hook para obtener productos relacionados
 * @param {string} productId
 * @param {number} limit
 * @returns {Object}
 */
export const useRelatedProducts = (productId, limit = 4) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const response = await productsApi.getRelatedProducts(productId, limit);
        
        if (response.success) {
          setProducts(response.data || []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching related products:', err);
        setError(err.response?.data?.message || 'Error al cargar productos relacionados');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [productId, limit]);

  return { products, loading, error };
};

/**
 * @hook useProductStock
 * @description Hook para verificar stock de un producto
 * @param {string} productId
 * @returns {Object}
 */
export const useProductStock = (productId) => {
  const [stock, setStock] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const checkStock = async (quantity) => {
    if (!productId || !quantity) return;

    try {
      setChecking(true);
      setError(null);

      const response = await productsApi.checkStock(productId, quantity);

      if (response.success) {
        setStock(response.data);
        return response.data;
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Error al verificar stock';
      setError(errorMsg);
      return null;
    } finally {
      setChecking(false);
    }
  };

  return {
    stock,
    checking,
    error,
    checkStock
  };
};