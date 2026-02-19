/**
 * @hook useCartSync
 * @description Observa transiciones de autenticación y dispara el sync del carrito.
 *
 * - Montado UNA sola vez en el layout raíz
 * - NO modifica el sistema de auth
 * - Agnóstico: recibe isAuthenticated como prop
 * - Detecta: false→true (login) y true→false (logout)
 *
 * @param {boolean}  isAuthenticated          - Estado de auth actual
 * @param {Object}   [callbacks]
 * @param {Function} [callbacks.onSyncSuccess] - (result) => void
 * @param {Function} [callbacks.onSyncError]   - (error: string) => void
 */

import { useEffect, useRef } from 'react';
import { useCartStore }      from '../store/cart.store';
import { CartSyncStatus }    from '../../domain/cart.model';

const useCartSync = (isAuthenticated, callbacks = {}) => {
  const { onSyncSuccess, onSyncError } = callbacks;

  const onLogin        = useCartStore(s => s.onLogin);
  const onLogout       = useCartStore(s => s.onLogout);
  const fetchCart      = useCartStore(s => s.fetchCart);
  const initialized    = useCartStore(s => s.initialized);
  const syncStatus     = useCartStore(s => s.syncStatus);

  const prevAuth       = useRef(null);
  const hasMounted     = useRef(false);

  // Carga inicial al montar
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      fetchCart();
    }
  }, []);

  // Detecta transiciones de auth
  useEffect(() => {
    if (prevAuth.current === null) {
      // Primera ejecución — establecer el valor inicial sin disparar sync
      prevAuth.current = isAuthenticated;
      return;
    }

    const wasAuth = prevAuth.current;
    prevAuth.current = isAuthenticated;

    if (!wasAuth && isAuthenticated) {
      // LOGIN: guest → authenticated
      onLogin({ onSyncSuccess, onSyncError });
    } else if (wasAuth && !isAuthenticated) {
      // LOGOUT: authenticated → guest
      onLogout();
    }
  }, [isAuthenticated]);

  return {
    syncStatus,
    isSyncing: syncStatus === CartSyncStatus.IN_PROGRESS,
    initialized,
  };
};

export default useCartSync;