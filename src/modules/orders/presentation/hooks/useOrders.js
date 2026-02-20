// modules/orders/presentation/hooks/useOrders.js
//
// Hook de lectura para el módulo Orders.
// Orquesta store + carga inicial de datos.
// Sin lógica de dominio — solo conecta UI con store.

import { useCallback, useEffect } from 'react';
import {
  useOrdersStore,
  selectOrdersByStatus,
  selectOrderStats,
  selectHasOrders,
} from '../store/orders.store.js';

/**
 * @hook useOrders
 * @description Hook de lectura de órdenes.
 *
 * @param {Object} options
 * @param {Object}  [options.filters={}]    - Filtros iniciales (page, limit, status, etc.)
 * @param {boolean} [options.autoLoad=true] - ¿Cargar al montar?
 * @param {string}  [options.statusFilter]  - Filtrar la lista local por estado
 *
 * @returns {Object}
 */
export function useOrders({
  filters      = {},
  autoLoad     = true,
  statusFilter = null,
} = {}) {
  const {
    orders,
    pagination,
    loading,
    errors,
    loadOrders,
  } = useOrdersStore();

  const filteredOrders = useOrdersStore(selectOrdersByStatus(statusFilter));
  const stats          = useOrdersStore(selectOrderStats);
  const hasOrders      = useOrdersStore(selectHasOrders);

  // Carga automática al montar
  useEffect(() => {
    if (autoLoad) {
      loadOrders(filters);
    }
    // Solo al montar — filters se pasan en la llamada explícita
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoad]);

  /**
   * Recargar con filtros actualizados (paginación, cambio de tab, etc.)
   */
  const refresh = useCallback((newFilters = {}) => {
    return loadOrders({ ...filters, ...newFilters });
  }, [loadOrders, filters]);

  /**
   * Ir a página específica
   */
  const goToPage = useCallback((page) => {
    return loadOrders({ ...filters, page });
  }, [loadOrders, filters]);

  return {
    // Data
    orders:          statusFilter ? filteredOrders : orders,
    allOrders:       orders,
    pagination,
    stats,
    hasOrders,

    // Estados
    isLoading:   loading.list,
    error:       errors.list,

    // Acciones
    refresh,
    goToPage,
    loadOrders,
  };
}

export default useOrders;