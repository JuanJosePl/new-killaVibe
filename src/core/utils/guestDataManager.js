// src/core/utils/guestDataManager.js

/**
 * @module guestDataManager
 * @description Utilidades puras para manejar datos de invitado (guest)
 * 
 * RESPONSABILIDAD:
 * - Detectar datos guest en localStorage
 * - Obtener estadísticas
 * - Limpiar datos guest
 * 
 * ❌ NO usa React
 * ❌ NO importa Context
 * ❌ NO maneja UI
 */

const GUEST_CART_KEY = "killavibes_cart_guest";
const GUEST_WISHLIST_KEY = "killavibes_wishlist_guest";

/**
 * Verifica si hay carrito de invitado
 */
export const hasGuestCart = () => {
  try {
    const cart = localStorage.getItem(GUEST_CART_KEY);
    if (!cart) return false;

    const parsed = JSON.parse(cart);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch (error) {
    console.error("[guestDataManager] Error leyendo guest cart:", error);
    return false;
  }
};

/**
 * Verifica si hay wishlist de invitado
 */
export const hasGuestWishlist = () => {
  try {
    const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    if (!wishlist) return false;

    const parsed = JSON.parse(wishlist);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch (error) {
    console.error("[guestDataManager] Error leyendo guest wishlist:", error);
    return false;
  }
};

/**
 * Verifica si existe cualquier dato guest
 */
export const hasGuestData = () => {
  return hasGuestCart() || hasGuestWishlist();
};

/**
 * Obtiene estadísticas de datos guest
 */
export const getGuestDataStats = () => {
  try {
    const cartRaw = localStorage.getItem(GUEST_CART_KEY);
    const wishlistRaw = localStorage.getItem(GUEST_WISHLIST_KEY);

    const cartItems = cartRaw ? JSON.parse(cartRaw).length : 0;
    const wishlistItems = wishlistRaw ? JSON.parse(wishlistRaw).length : 0;

    return {
      hasData: cartItems > 0 || wishlistItems > 0,
      cartItems,
      wishlistItems,
      totalItems: cartItems + wishlistItems,
    };
  } catch (error) {
    console.error("[guestDataManager] Error obteniendo stats:", error);
    return {
      hasData: false,
      cartItems: 0,
      wishlistItems: 0,
      totalItems: 0,
    };
  }
};

/**
 * Limpia TODOS los datos de invitado del localStorage
 * (Usar SOLO cuando la migración ya fue exitosa)
 */
export const clearAllGuestData = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_WISHLIST_KEY);

    console.log("[guestDataManager] 🧹 Datos guest eliminados");
  } catch (error) {
    console.error("[guestDataManager] Error limpiando guest data:", error);
  }
};

/**
 * Export default (opcional)
 */
export default {
  hasGuestCart,
  hasGuestWishlist,
  hasGuestData,
  getGuestDataStats,
  clearAllGuestData,
};
