/**
 * @hook useWishlistSync
 * @description Hook especializado para manejar la sincronización wishlist guest → auth.
 *
 * RESPONSABILIDAD ÚNICA:
 * Observar cambios en el estado de autenticación y disparar
 * las transiciones de modo del store (onLogin / onLogout).
 *
 * QUIÉN LO USA:
 * Un único lugar en la app — idealmente en el componente raíz o en el
 * hook de autenticación principal. NO se monta en múltiples componentes.
 *
 * INTEGRACIÓN:
 * Este hook no sabe de qué sistema de auth viene la señal.
 * Recibe `isAuthenticated` como prop para ser agnóstico al auth module.
 *
 * @param {boolean} isAuthenticated - Estado de autenticación actual
 * @param {Object}  [options]
 * @param {Function} [options.onSyncSuccess] - (result) => void — feedback al usuario
 * @param {Function} [options.onSyncError]   - (error)  => void — feedback al usuario
 *
 * @example
 * // En el componente raíz o layout principal:
 * const { isAuthenticated } = useAuthStore();
 * useWishlistSync(isAuthenticated, {
 *   onSyncSuccess: (result) => {
 *     if (result.hadGuestItems && result.migratedCount > 0) {
 *       toast.success(`${result.migratedCount} productos sincronizados a tu lista de deseos`);
 *     }
 *   },
 *   onSyncError: () => toast.error('Error al sincronizar tu lista de deseos'),
 * });
 */

import { useEffect, useRef, useCallback } from 'react';
import { useWishlistStore, wishlistSelectors } from '../store/wishlist.store';
import { SyncStatus } from '../domain/wishlist.model';

const useWishlistSync = (isAuthenticated, options = {}) => {
  const { onSyncSuccess = null, onSyncError = null } = options;

  const actions    = useWishlistStore(wishlistSelectors.actions);
  const syncStatus = useWishlistStore(wishlistSelectors.syncStatus);
  const syncResult = useWishlistStore(wishlistSelectors.syncResult);

  // Ref para trackear el estado anterior de autenticación
  // y evitar disparar sync en el render inicial
  const prevIsAuthRef   = useRef(null);
  const isMountedRef    = useRef(false);

  // ============================================================================
  // HANDLERS DE TRANSICIÓN
  // ============================================================================

  const handleLogin = useCallback(async () => {
    const result = await actions.onLogin();

    if (result.success) {
      if (onSyncSuccess) onSyncSuccess(result);
    } else {
      if (onSyncError) onSyncError(result.error);
    }

    // Limpiar syncStatus después de entregar el feedback
    // para que no persista si el componente se re-monta
    setTimeout(() => {
      actions.clearSyncStatus();
    }, 100);

  }, [actions, onSyncSuccess, onSyncError]);

  const handleLogout = useCallback(async () => {
    await actions.onLogout();
  }, [actions]);

  // ============================================================================
  // OBSERVER DE AUTENTICACIÓN
  // ============================================================================

  useEffect(() => {
    // Primer render: inicializar ref y cargar wishlist sin transición
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      prevIsAuthRef.current = isAuthenticated;

      // Carga inicial de la wishlist según el modo detectado
      actions.fetchWishlist();
      return;
    }

    // Cambios posteriores al primer render
    const prevIsAuth = prevIsAuthRef.current;
    prevIsAuthRef.current = isAuthenticated;

    // Guest → Authenticated: login
    if (!prevIsAuth && isAuthenticated) {
      handleLogin();
      return;
    }

    // Authenticated → Guest: logout
    if (prevIsAuth && !isAuthenticated) {
      handleLogout();
      return;
    }

    // Sin cambio: no hacer nada
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  // Nota: handleLogin/handleLogout/actions se excluyen intencionalmente.
  // El efecto debe dispararse SOLO cuando cambia isAuthenticated.
  // Las funciones son estables (useCallback + selectors atómicos).

  // ============================================================================
  // RETURN: ESTADO DEL SYNC PARA UI
  // ============================================================================

  return {
    syncStatus,
    syncResult,
    isSyncing: syncStatus === SyncStatus.IN_PROGRESS,
    syncCompleted: syncStatus === SyncStatus.COMPLETED,
    syncFailed: syncStatus === SyncStatus.FAILED,
  };
};

export default useWishlistSync;