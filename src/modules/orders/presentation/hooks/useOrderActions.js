// modules/orders/presentation/hooks/useOrderActions.js
//
// Hook de escritura para el módulo Orders.
// Maneja: crear, cancelar, solicitar devolución.
// Expone estados de loading/error por operación.

import { useCallback } from 'react';
import { useOrdersStore } from '../store/orders.store.js';

/**
 * @hook useOrderActions
 * @description Hook de operaciones de escritura sobre órdenes.
 *
 * @returns {Object}
 */
export function useOrderActions() {
  const {
    loading,
    errors,
    cancellingOrderId,
    createOrder:    storeCreateOrder,
    cancelOrder:    storeCancelOrder,
    requestReturn:  storeRequestReturn,
    clearError,
  } = useOrdersStore();

  /**
   * Crear orden desde el carrito.
   * @param {Object} orderData - { shippingAddress, billingAddress?, paymentMethod, customerNotes? }
   * @returns {Promise<{ success, order?, error? }>}
   */
  const createOrder = useCallback(async (orderData) => {
    return storeCreateOrder(orderData);
  }, [storeCreateOrder]);

  /**
   * Cancelar una orden.
   * Recibe la entidad completa (necesaria para validación de dominio en service).
   *
   * @param {OrderEntity} order
   * @returns {Promise<{ success, order?, error? }>}
   */
  const cancelOrder = useCallback(async (order) => {
    return storeCancelOrder(order);
  }, [storeCancelOrder]);

  /**
   * Solicitar devolución de una orden.
   *
   * @param {OrderEntity} order
   * @param {string} reason - Mínimo 10 caracteres
   * @returns {Promise<{ success, order?, error? }>}
   */
  const requestReturn = useCallback(async (order, reason) => {
    return storeRequestReturn(order, reason);
  }, [storeRequestReturn]);

  return {
    // Estados por operación
    isCreating:        loading.create,
    isCancelling:      loading.cancel,
    isReturning:       loading.return,
    cancellingOrderId,

    // Errores por operación
    createError:  errors.create,
    cancelError:  errors.cancel,
    returnError:  errors.return,

    // Acciones
    createOrder,
    cancelOrder,
    requestReturn,
    clearError,
  };
}

export default useOrderActions;