// modules/orders/presentation/hooks/useOrderDetail.js
//
// Hook para detalle de una orden individual + tracking.
// Carga orden y tracking en paralelo o secuencialmente según necesidad.

import { useCallback, useEffect } from 'react';
import { useOrdersStore } from '../store/orders.store.js';

/**
 * @hook useOrderDetail
 * @description Hook para gestionar el detalle de una orden y su tracking.
 *
 * @param {string|null} orderId       - ID de la orden a cargar
 * @param {Object}      [options]
 * @param {boolean}     [options.withTracking=false] - ¿Cargar tracking también?
 * @param {boolean}     [options.autoLoad=true]      - ¿Cargar al montar?
 *
 * @returns {Object}
 */
export function useOrderDetail(orderId, { withTracking = false, autoLoad = true } = {}) {
  const {
    selectedOrder,
    orderTracking,
    loading,
    errors,
    loadOrderDetail,
    loadOrderTracking,
    clearSelectedOrder,
    clearError,
  } = useOrdersStore();

  // Cargar orden (y tracking si se pide) al montar o cuando cambia orderId
  useEffect(() => {
    if (!orderId || !autoLoad) return;

    loadOrderDetail(orderId);

    if (withTracking) {
      loadOrderTracking(orderId);
    }

    // Limpiar al desmontar
    return () => clearSelectedOrder();
  }, [orderId, autoLoad, withTracking]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Recargar la orden manualmente.
   */
  const reloadOrder = useCallback(() => {
    if (orderId) return loadOrderDetail(orderId);
  }, [orderId, loadOrderDetail]);

  /**
   * Cargar tracking manualmente.
   */
  const loadTracking = useCallback(() => {
    if (orderId) return loadOrderTracking(orderId);
  }, [orderId, loadOrderTracking]);

  return {
    // Data
    order:    selectedOrder,
    tracking: orderTracking,

    // Estados
    isLoadingOrder:    loading.detail,
    isLoadingTracking: loading.tracking,
    orderError:        errors.detail,
    trackingError:     errors.tracking,

    // Acciones
    reloadOrder,
    loadTracking,
    clearSelectedOrder,
    clearError,
  };
}

export default useOrderDetail;