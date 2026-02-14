// src/modules/customer/api/customerWishlist.api.js

import customerApiClient from '../utils/customerApiClient';

/**
 * @description API para Wishlist (CRUD completo)
 */

export const getWishlist = async () => {
  const response = await customerApiClient.get('/wishlist');
  return response.data;
};

export const addToWishlist = async (productId, notifyPriceChange = false, notifyAvailability = false) => {
  const response = await customerApiClient.post('/wishlist/items', {
    productId,
    notifyPriceChange,
    notifyAvailability,
  });
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await customerApiClient.delete(`/wishlist/items/${productId}`);
  return response.data;
};

export const clearWishlist = async () => {
  const response = await customerApiClient.delete('/wishlist');
  return response.data;
};

export const checkInWishlist = async (productId) => {
  const response = await customerApiClient.get(`/wishlist/check/${productId}`);
  return response.data?.inWishlist || false;
};

export const moveToCart = async (productIds) => {
  const response = await customerApiClient.post('/wishlist/move-to-cart', {
    productIds,
  });
  return response.data;
};

export const getPriceChanges = async () => {
  const response = await customerApiClient.get('/wishlist/price-changes');
  return response.data;
};

/**
 * @description Sincroniza wishlist guest → usuario autenticado
 */
export const syncGuestWishlist = async (items = []) => {
  if (!items.length) {
    return { success: true, migratedCount: 0 };
  }

  const response = await customerApiClient.post('/wishlist/sync', {
    items,
  });

  return response.data;
};


export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  checkInWishlist,
  moveToCart,
  getPriceChanges,
  syncGuestWishlist,
};