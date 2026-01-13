// src/modules/customer/hooks/useOrderOperations.js

import { useState, useCallback } from 'react';
import customerOrdersApi from '../api/customerOrders.api';

/**
 * @hook useOrderOperations
 * @description Hook personalizado para operaciones de órdenes
 * 
 * Beneficios:
 * - Loading granular por operación
 * - Manejo de errores consistente
 * - Filtros y paginación
 * - Caché de resultados
 * 
 * @returns {Object} Operaciones de órdenes con estados
 */
export const useOrderOperations = () => {
  // Estado
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Loading states específicos
  const [isCanceling, setIsCanceling] = useState(false);
  const [isReturning, setIsReturning] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState(null);

  /**
   * Cargar órdenes con filtros
   */
  const loadOrders = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await customerOrdersApi.getUserOrders(filters);
      setOrders(data.orders || []);
      setPagination(data.pagination);

      return { success: true, data };
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Error al cargar órdenes');
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener orden por ID
   */
  const getOrder = useCallback(async (orderId) => {
    try {
      const data = await customerOrdersApi.getOrderById(orderId);
      return { success: true, data };
    } catch (err) {
      console.error('Error getting order:', err);
      return { 
        success: false, 
        error: err.message || 'Error al cargar orden' 
      };
    }
  }, []);

  /**
   * Obtener tracking de orden
   */
  const getTracking = useCallback(async (orderId) => {
    try {
      const data = await customerOrdersApi.getOrderTracking(orderId);
      return { success: true, data };
    } catch (err) {
      console.error('Error getting tracking:', err);
      return { 
        success: false, 
        error: err.message || 'Error al cargar tracking' 
      };
    }
  }, []);

  /**
   * Cancelar orden
   */
  const cancelOrder = useCallback(async (orderId) => {
    setCancelingOrderId(orderId);
    setIsCanceling(true);

    try {
      await customerOrdersApi.cancelOrder(orderId);
      
      // Actualizar orden en la lista local
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' }
            : order
        )
      );

      return { 
        success: true,
        message: '✓ Orden cancelada exitosamente'
      };
    } catch (err) {
      console.error('Error canceling order:', err);
      return { 
        success: false, 
        error: err.message || 'No se puede cancelar esta orden' 
      };
    } finally {
      setIsCanceling(false);
      setCancelingOrderId(null);
    }
  }, []);

  /**
   * Solicitar devolución
   */
  const requestReturn = useCallback(async (orderId, reason) => {
    if (!reason || reason.trim().length < 10) {
      return {
        success: false,
        error: 'La razón debe tener al menos 10 caracteres'
      };
    }

    setIsReturning(true);

    try {
      await customerOrdersApi.requestReturn(orderId, reason);
      
      // Actualizar orden en la lista local
      setOrders(prev => 
        prev.map(order => 
          order._id === orderId 
            ? { ...order, status: 'returned' }
            : order
        )
      );

      return { 
        success: true,
        message: '✓ Solicitud de devolución enviada'
      };
    } catch (err) {
      console.error('Error requesting return:', err);
      return { 
        success: false, 
        error: err.message || 'Error al solicitar devolución' 
      };
    } finally {
      setIsReturning(false);
    }
  }, []);

  /**
   * Crear orden desde carrito
   */
  const createOrder = useCallback(async (orderData) => {
    try {
      const data = await customerOrdersApi.createOrder(orderData);
      return { 
        success: true, 
        data,
        message: '✓ Orden creada exitosamente'
      };
    } catch (err) {
      console.error('Error creating order:', err);
      return { 
        success: false, 
        error: err.message || 'Error al crear orden' 
      };
    }
  }, []);

  /**
   * Filtrar órdenes por estado
   */
  const filterByStatus = useCallback((status) => {
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  }, [orders]);

  /**
   * Obtener estadísticas de órdenes
   */
  const getStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      returned: 0,
      totalSpent: 0,
    };

    orders.forEach(order => {
      stats[order.status] = (stats[order.status] || 0) + 1;
      if (!['cancelled', 'returned'].includes(order.status)) {
        stats.totalSpent += order.totalAmount;
      }
    });

    return stats;
  }, [orders]);

  /**
   * Verificar si se puede cancelar una orden
   */
  const canCancelOrder = useCallback((order) => {
    return ['pending', 'confirmed'].includes(order.status);
  }, []);

  /**
   * Verificar si se puede devolver una orden
   */
  const canReturnOrder = useCallback((order) => {
    if (order.status !== 'delivered') return false;
    
    // Verificar que no hayan pasado más de 30 días
    const deliveryDate = new Date(order.deliveredAt || order.updatedAt);
    const daysSinceDelivery = Math.floor((Date.now() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSinceDelivery <= 30;
  }, []);

  return {
    // Data
    orders,
    pagination,
    
    // Estados
    isLoading,
    error,
    isCanceling,
    isReturning,
    cancelingOrderId,
    
    // Operaciones
    loadOrders,
    getOrder,
    getTracking,
    cancelOrder,
    requestReturn,
    createOrder,
    
    // Utilidades
    filterByStatus,
    getStats,
    canCancelOrder,
    canReturnOrder,
  };
};

export default useOrderOperations;