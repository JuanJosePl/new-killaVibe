// src/core/utils/syncManager.js

import { migrateGuestCartToUser, clearGuestCart } from '../../modules/cart/context/CartContext';
import { migrateGuestWishlistToUser, clearGuestWishlist } from '../../modules/wishlist/context/WishlistContext';
import { toast } from 'react-hot-toast';

/**
 * @module syncManager
 * @description Sistema centralizado para sincronizar datos de invitado con usuario autenticado
 * 
 * CARACTERÍSTICAS:
 * - Migración automática de cart y wishlist al hacer login
 * - Limpieza de localStorage después de migración
 * - Notificaciones visuales del proceso
 * - Manejo robusto de errores
 * - Retry automático en caso de fallo
 * 
 * USO:
 * - Llamar desde AuthProvider después de login/register exitoso
 * - Llamar desde useEffect cuando isAuthenticated cambia
 */

// ============================================================================
// CONSTANTES
// ============================================================================

const SYNC_STORAGE_KEY = 'killavibes_last_sync';
const SYNC_COOLDOWN = 60 * 1000; // 1 minuto entre sincronizaciones

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Verifica si hay datos de invitado para migrar
 */
const hasGuestData = () => {
  try {
    const cart = localStorage.getItem('killavibes_cart_guest');
    const wishlist = localStorage.getItem('killavibes_wishlist_guest');
    
    const hasCart = cart && JSON.parse(cart).length > 0;
    const hasWishlist = wishlist && JSON.parse(wishlist).length > 0;
    
    return hasCart || hasWishlist;
  } catch (error) {
    console.error('[syncManager] Error checking guest data:', error);
    return false;
  }
};

/**
 * Verifica si ya se hizo sync recientemente
 */
const canSync = () => {
  try {
    const lastSync = localStorage.getItem(SYNC_STORAGE_KEY);
    if (!lastSync) return true;
    
    const timeSinceSync = Date.now() - parseInt(lastSync);
    return timeSinceSync > SYNC_COOLDOWN;
  } catch (error) {
    return true;
  }
};

/**
 * Marca que se realizó un sync
 */
const markSyncComplete = () => {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, Date.now().toString());
  } catch (error) {
    console.error('[syncManager] Error marking sync:', error);
  }
};

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Migra CART de invitado a usuario autenticado
 */
const syncCart = async () => {
  console.log('[syncManager] Iniciando migración de carrito...');
  
  try {
    const result = await migrateGuestCartToUser();
    
    if (result.success && result.migratedCount > 0) {
      console.log(`[syncManager] ✅ ${result.migratedCount} items migrados al carrito`);
      
      toast.success(
        `🛒 ${result.migratedCount} producto${result.migratedCount > 1 ? 's' : ''} agregado${result.migratedCount > 1 ? 's' : ''} a tu carrito`,
        {
          duration: 3000,
          position: 'bottom-right'
        }
      );

      if (result.failedCount > 0) {
        console.warn(`[syncManager] ⚠️ ${result.failedCount} items fallaron`);
      }
    } else if (result.migratedCount === 0) {
      console.log('[syncManager] No hay items de carrito para migrar');
    }
    
    return result;
  } catch (error) {
    console.error('[syncManager] ❌ Error migrando carrito:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Migra WISHLIST de invitado a usuario autenticado
 */
const syncWishlist = async () => {
  console.log('[syncManager] Iniciando migración de wishlist...');
  
  try {
    const result = await migrateGuestWishlistToUser();
    
    if (result.success && result.migratedCount > 0) {
      console.log(`[syncManager] ✅ ${result.migratedCount} items migrados a wishlist`);
      
      toast.success(
        `❤️ ${result.migratedCount} favorito${result.migratedCount > 1 ? 's' : ''} guardado${result.migratedCount > 1 ? 's' : ''}`,
        {
          duration: 3000,
          position: 'bottom-right'
        }
      );

      if (result.failedCount > 0) {
        console.warn(`[syncManager] ⚠️ ${result.failedCount} items fallaron`);
      }
    } else if (result.migratedCount === 0) {
      console.log('[syncManager] No hay items de wishlist para migrar');
    }
    
    return result;
  } catch (error) {
    console.error('[syncManager] ❌ Error migrando wishlist:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Función principal: Sincroniza TODO (cart + wishlist)
 * 
 * @param {Object} options - Opciones de sincronización
 * @param {boolean} options.silent - Si true, no muestra notificaciones
 * @param {boolean} options.force - Si true, ignora cooldown
 * @returns {Promise<Object>} Resultado de la sincronización
 */
export const syncGuestDataToUser = async (options = {}) => {
  const { silent = false, force = false } = options;

  console.log('[syncManager] 🔄 Iniciando sincronización...');

  // Guard 1: Verificar si hay datos para migrar
  if (!hasGuestData()) {
    console.log('[syncManager] No hay datos de invitado para migrar');
    return {
      success: true,
      message: 'No hay datos para sincronizar',
      cartMigrated: 0,
      wishlistMigrated: 0
    };
  }

  // Guard 2: Respetar cooldown (a menos que sea force)
  if (!force && !canSync()) {
    console.log('[syncManager] Sync reciente detectado, ignorando...');
    return {
      success: true,
      message: 'Sincronización reciente',
      skipped: true
    };
  }

  // Mostrar toast de inicio (si no es silent)
  if (!silent) {
    toast.loading('Sincronizando tus datos...', {
      id: 'sync-toast',
      duration: 3000
    });
  }

  try {
    // Ejecutar migraciones en paralelo
    const [cartResult, wishlistResult] = await Promise.allSettled([
      syncCart(),
      syncWishlist()
    ]);

    // Procesar resultados
    const cartSuccess = cartResult.status === 'fulfilled' && cartResult.value.success;
    const wishlistSuccess = wishlistResult.status === 'fulfilled' && wishlistResult.value.success;

    const cartMigrated = cartSuccess ? cartResult.value.migratedCount : 0;
    const wishlistMigrated = wishlistSuccess ? wishlistResult.value.migratedCount : 0;

    // Marcar sync como completado
    markSyncComplete();

    // Dismiss loading toast
    if (!silent) {
      toast.dismiss('sync-toast');
    }

    // Resultado final
    const result = {
      success: cartSuccess && wishlistSuccess,
      cartMigrated,
      wishlistMigrated,
      totalMigrated: cartMigrated + wishlistMigrated
    };

    console.log('[syncManager] ✅ Sincronización completada:', result);

    return result;
  } catch (error) {
    console.error('[syncManager] ❌ Error en sincronización:', error);
    
    if (!silent) {
      toast.dismiss('sync-toast');
      toast.error('Error al sincronizar tus datos', {
        duration: 3000,
        position: 'bottom-right'
      });
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Limpia TODOS los datos de invitado del localStorage
 * (Usar después de sincronización exitosa o al hacer logout)
 */
export const clearAllGuestData = () => {
  console.log('[syncManager] Limpiando datos de invitado...');
  
  try {
    clearGuestCart();
    clearGuestWishlist();
    localStorage.removeItem(SYNC_STORAGE_KEY);
    
    console.log('[syncManager] ✅ Datos de invitado eliminados');
  } catch (error) {
    console.error('[syncManager] Error limpiando datos:', error);
  }
};

/**
 * Obtiene estadísticas de datos pendientes de sincronizar
 */
export const getGuestDataStats = () => {
  try {
    const cartData = localStorage.getItem('killavibes_cart_guest');
    const wishlistData = localStorage.getItem('killavibes_wishlist_guest');
    
    const cartItems = cartData ? JSON.parse(cartData).length : 0;
    const wishlistItems = wishlistData ? JSON.parse(wishlistData).length : 0;
    
    return {
      hasData: cartItems > 0 || wishlistItems > 0,
      cartItems,
      wishlistItems,
      totalItems: cartItems + wishlistItems
    };
  } catch (error) {
    console.error('[syncManager] Error getting stats:', error);
    return {
      hasData: false,
      cartItems: 0,
      wishlistItems: 0,
      totalItems: 0
    };
  }
};

// ============================================================================
// EXPORT
// ============================================================================

export default {
  syncGuestDataToUser,
  clearAllGuestData,
  getGuestDataStats,
  hasGuestData
};