import { toast } from "react-hot-toast";
import {
  hasGuestData,
  getGuestDataStats,
  clearAllGuestData,
} from "@/core/utils/guestDataManager";

const SYNC_STORAGE_KEY = "killavibes_last_sync";
const SYNC_COOLDOWN = 60 * 1000; // 1 minuto

// ============================================================================
// ⏱️ Helpers internos de control de sincronización
// ============================================================================

const canSync = () => {
  try {
    const lastSync = localStorage.getItem(SYNC_STORAGE_KEY);
    if (!lastSync) return true;
    return Date.now() - Number(lastSync) > SYNC_COOLDOWN;
  } catch {
    return true;
  }
};

const markSyncComplete = () => {
  try {
    localStorage.setItem(SYNC_STORAGE_KEY, Date.now().toString());
  } catch {}
};

// ============================================================================
// 🔄 ORQUESTADOR PRINCIPAL DE SINCRONIZACIÓN
// NO conoce React, NO importa contexts
// ============================================================================

/**
 * Sincroniza datos de invitado (cart + wishlist) con el usuario autenticado
 */
export const syncGuestDataToUser = async ({
  syncCart,
  syncWishlist,
  clearCart,
  clearWishlist,
  silent = false,
  force = false,
}) => {
  // ⛔ No hay datos guest → no hacer nada
  if (!hasGuestData()) {
    return {
      success: true,
      skipped: true,
      reason: "NO_GUEST_DATA",
    };
  }

  // ⏳ Cooldown activo
  if (!force && !canSync()) {
    return {
      success: true,
      skipped: true,
      reason: "COOLDOWN",
    };
  }

  const stats = getGuestDataStats();

  if (!silent) {
    toast.loading(`Sincronizando ${stats.totalItems} elemento(s)...`, {
      id: "sync-toast",
    });
  }

  try {
    // Ejecutar migraciones en paralelo
    const [cartResult, wishlistResult] = await Promise.allSettled([
      syncCart?.(),
      syncWishlist?.(),
    ]);

    const cartSuccess =
      cartResult.status === "fulfilled" && cartResult.value?.success;

    const wishlistSuccess =
      wishlistResult.status === "fulfilled" && wishlistResult.value?.success;

    const cartMigrated = cartSuccess ? cartResult.value.migratedCount || 0 : 0;

    const wishlistMigrated = wishlistSuccess
      ? wishlistResult.value.migratedCount || 0
      : 0;

    // Limpiar estados React
    if (cartSuccess) clearCart?.();
    if (wishlistSuccess) clearWishlist?.();

    // 🧹 Limpieza definitiva del localStorage
    if ((!syncCart || cartSuccess) && (!syncWishlist || wishlistSuccess)) {
      clearAllGuestData();
    }

    markSyncComplete();

    if (!silent) {
      toast.dismiss("sync-toast");
      toast.success("Datos sincronizados correctamente");
    }

    return {
      success: cartSuccess && wishlistSuccess,
      cartMigrated,
      wishlistMigrated,
      totalMigrated: cartMigrated + wishlistMigrated,
    };
  } catch (error) {
    if (!silent) {
      toast.dismiss("sync-toast");
      toast.error("Error al sincronizar tus datos");
    }

    return {
      success: false,
      error: error.message,
    };
  }
};

// ============================================================================
// 📦 EXPORT DEFAULT (por compatibilidad)
// ============================================================================

export default {
  syncGuestDataToUser,
};
