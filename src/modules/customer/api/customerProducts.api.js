// src/modules/customer/api/customerProducts.api.js

import customerApiClient from "../utils/customerApiClient";

/**
 * Normalizar respuesta del backend
 */
const normalizeProductsResponse = (response) => {
  // Caso 1: { data: [...], pagination: {...} }
  if (response.data && Array.isArray(response.data)) {
    return {
      products: response.data,
      pagination: response.pagination || {
        current: response.page || 1,
        pages: response.totalPages || 1,
        total: response.total || response.data.length,
        limit: response.limit || 12,
      },
    };
  }

  // Caso 2: { products: [...], pagination: {...} }
  if (response.products) {
    return {
      products: response.products,
      pagination: response.pagination || {
        current: 1,
        pages: 1,
        total: response.products.length,
        limit: 12,
      },
    };
  }

  // Caso 3: Array directo
  if (Array.isArray(response)) {
    return {
      products: response,
      pagination: {
        current: 1,
        pages: 1,
        total: response.length,
        limit: 12,
      },
    };
  }

  // Fallback
  return {
    products: [],
    pagination: {
      current: 1,
      pages: 1,
      total: 0,
      limit: 12,
    },
  };
};

/**
 * ✅ ENDPOINT PRINCIPAL - Usar el correcto según el backend
 */
export const getProducts = async (filters = {}) => {
  const params = new URLSearchParams();

  // Paginación
  if (filters.page) params.append("page", filters.page);
  if (filters.limit) params.append("limit", filters.limit);

  // Ordenamiento
  if (filters.sort) params.append("sort", filters.sort);
  if (filters.order) params.append("order", filters.order);

  // Filtros adicionales
  if (filters.search) params.append("search", filters.search);
  if (filters.minPrice) params.append("minPrice", filters.minPrice);
  if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
  if (filters.brand) params.append("brand", filters.brand);
  if (filters.inStock !== undefined) params.append("inStock", filters.inStock);
  if (filters.featured !== undefined)
    params.append("featured", filters.featured);

  // ✅ DECISIÓN CRÍTICA: ¿Hay categoría?
  let url;

  if (filters.category) {
    // ✅ Usar endpoint dedicado (según backend)
    url = `/products/category/${filters.category}`;
    if (params.toString()) url += `?${params.toString()}`;

    console.log("[API] ✅ Endpoint de categoría:", url);
  } else {
    // ✅ Endpoint general
    url = `/products?${params.toString()}`;
    console.log("[API] ✅ Endpoint general:", url);
  }

  try {
    const response = await customerApiClient.get(url);
    console.log("[API] Respuesta recibida:", response);

    return normalizeProductsResponse(response);
  } catch (error) {
    console.error("[API] ❌ Error:", error);

    // Si falla el endpoint de categoría, NO reintentar con query param
    // Solo lanzar el error
    throw error;
  }
};

/**
 * Obtener producto por slug
 */
export const getProductBySlug = async (slug) => {
  const response = await customerApiClient.get(`/products/${slug}`);
  return response.data;
};

/**
 * Obtener productos destacados
 */
export const getFeaturedProducts = async (limit = 8) => {
  const response = await customerApiClient.get(
    `/products/featured?limit=${limit}`
  );
  return response.data || [];
};

/**
 * Buscar productos
 */
export const searchProducts = async (query, limit = 10) => {
  if (!query || query.trim().length < 2) return [];

  const response = await customerApiClient.get(
    `/products/search/${encodeURIComponent(query)}?limit=${limit}`
  );
  return response.data || [];
};

/**
 * Obtener productos relacionados
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  const response = await customerApiClient.get(
    `/products/related/${productId}?limit=${limit}`
  );
  return response.data || [];
};

/**
 * Verificar stock
 */
export const checkStock = async (productId, quantity) => {
  const response = await customerApiClient.post(
    `/products/check-stock/${productId}`,
    { quantity }
  );
  return response.data;
};

export default {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  searchProducts,
  getRelatedProducts,
  checkStock,
};
