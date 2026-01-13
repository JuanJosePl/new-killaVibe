import { createContext, useContext, useState, useCallback } from 'react';
import  customerOrdersApi  from '../api/customerOrders.api';

/**
 * @context CustomerOrdersContext
 * @description Estado global de órdenes
 * 
 * Responsabilidades:
 * - Crear órdenes desde carrito
 * - Listar órdenes del usuario
 * - Ver detalles y tracking
 * - Cancelar órdenes
 * - Solicitar devoluciones
 * 
 * Contrato Backend:
 * - POST /api/orders (crear orden)
 * - GET /api/orders (listar órdenes con paginación)
 * - GET /api/orders/:id (detalle)
 * - GET /api/orders/:id/tracking (tracking)
 * - PUT /api/orders/:id/cancel (cancelar)
 * - POST /api/orders/:id/return (solicitar devolución)
 * 
 * Reglas:
 * - Solo se puede cancelar si status = 'pending' | 'confirmed'
 * - No se puede cancelar si paymentStatus = 'paid' (requiere refund)
 * - Devolución solo si status = 'delivered' y < 30 días
 */

const CustomerOrdersContext = createContext(null);

export const CustomerOrdersProvider = ({ children }) => {
  // Estado principal
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [orderTracking, setOrderTracking] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar órdenes del usuario con filtros
   * 
   * @param {Object} filters
   * @param {number} filters.page - Página (default: 1)
   * @param {number} filters.limit - Límite (default: 10)
   * @param {string} filters.status - Filtrar por estado
   * @param {string} filters.sortBy - Campo ordenamiento (default: 'createdAt')
   * @param {string} filters.sortOrder - Orden ('asc', 'desc')
   * @returns {Promise<Object>} { orders, pagination }
   */
  const loadOrders = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await customerOrdersApi.getUserOrders(filters);
      
      setOrders(response.orders || response.data || []);
      setPagination(response.pagination);
      
      return response;
    } catch (err) {
      setError(err);
      console.error('Error loading orders:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Crear orden desde carrito
   * 
   * @param {Object} orderData
   * @param {Object} orderData.shippingAddress - Dirección envío (requerida)
   * @param {Object} orderData.billingAddress - Dirección facturación (opcional)
   * @param {string} orderData.paymentMethod - Método pago (requerido)
   * @param {string} orderData.customerNotes - Notas del cliente (opcional)
   * @returns {Promise<Object>} Orden creada
   * 
   * @throws {400} Carrito vacío o stock insuficiente
   */
  const createOrder = useCallback(async (orderData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const order = await customerOrdersApi.createOrder(orderData);
      
      // Agregar la nueva orden al inicio de la lista
      setOrders(prev => [order, ...prev]);
      setCurrentOrder(order);
      
      return order;
    } catch (err) {
      setError(err);
      console.error('Error creating order:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener detalles de una orden
   * 
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Orden completa
   * 
   * @throws {404} Orden no encontrada
   * @throws {403} No pertenece al usuario
   */
  const getOrderById = useCallback(async (orderId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const order = await customerOrdersApi.getOrderById(orderId);
      setCurrentOrder(order);
      
      return order;
    } catch (err) {
      setError(err);
      console.error('Error getting order:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Obtener tracking de una orden
   * 
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Timeline de tracking
   * 
   * Response: {
   *   orderNumber,
   *   currentStatus,
   *   trackingNumber,
   *   timeline: [
   *     { status, label, date, completed }
   *   ]
   * }
   */
  const getOrderTracking = useCallback(async (orderId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const tracking = await customerOrdersApi.getOrderTracking(orderId);
      setOrderTracking(tracking);
      
      return tracking;
    } catch (err) {
      setError(err);
      console.error('Error getting tracking:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cancelar una orden
   * 
   * Reglas:
   * - Solo si status = 'pending' | 'confirmed'
   * - No si paymentStatus = 'paid'
   * 
   * @param {string} orderId - ID de la orden
   * @returns {Promise<Object>} Orden cancelada
   * 
   * @throws {400} No se puede cancelar en este estado
   */
  const cancelOrder = useCallback(async (orderId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const order = await customerOrdersApi.cancelOrder(orderId);
      
      // Actualizar orden en la lista
      setOrders(prev => 
        prev.map(o => o._id === orderId ? order : o)
      );
      
      if (currentOrder?._id === orderId) {
        setCurrentOrder(order);
      }
      
      return order;
    } catch (err) {
      setError(err);
      console.error('Error cancelling order:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  /**
   * Solicitar devolución de orden
   * 
   * Reglas:
   * - Solo si status = 'delivered'
   * - Máximo 30 días desde entrega
   * 
   * @param {string} orderId - ID de la orden
   * @param {string} reason - Razón de la devolución (min 10 chars)
   * @returns {Promise<Object>} Orden actualizada
   * 
   * @throws {400} No se puede devolver / Período expirado
   */
  const requestReturn = useCallback(async (orderId, reason) => {
    if (!reason || reason.trim().length < 10) {
      throw new Error('La razón debe tener al menos 10 caracteres');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const order = await customerOrdersApi.requestReturn(orderId, reason);
      
      // Actualizar orden en la lista
      setOrders(prev => 
        prev.map(o => o._id === orderId ? order : o)
      );
      
      if (currentOrder?._id === orderId) {
        setCurrentOrder(order);
      }
      
      return order;
    } catch (err) {
      setError(err);
      console.error('Error requesting return:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  /**
   * Filtrar órdenes por estado
   * 
   * @param {string} status - Estado a filtrar
   * @returns {Array} Órdenes filtradas
   */
  const getOrdersByStatus = useCallback((status) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  }, [orders]);

  /**
   * Verificar si una orden puede ser cancelada
   * 
   * @param {Object} order - Orden a verificar
   * @returns {boolean}
   */
  const canCancelOrder = useCallback((order) => {
    if (!order) return false;
    
    const cancelableStatuses = ['pending', 'confirmed'];
    return (
      cancelableStatuses.includes(order.status) &&
      order.paymentStatus !== 'refunded'
    );
  }, []);

  /**
   * Verificar si una orden puede ser devuelta
   * 
   * @param {Object} order - Orden a verificar
   * @returns {boolean}
   */
  const canReturnOrder = useCallback((order) => {
    if (!order || order.status !== 'delivered') return false;
    
    // Verificar 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deliveredDate = new Date(order.deliveredAt);
    return deliveredDate > thirtyDaysAgo;
  }, []);

  /**
   * Obtener estadísticas de órdenes
   * 
   * @returns {Object} Stats
   */
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      pending: 0,
      delivered: 0,
      cancelled: 0,
      totalSpent: 0,
    };

    orders.forEach(order => {
      if (order.status === 'pending') stats.pending++;
      if (order.status === 'delivered') stats.delivered++;
      if (order.status === 'cancelled') stats.cancelled++;
      if (order.paymentStatus === 'paid') {
        stats.totalSpent += order.totalAmount;
      }
    });

    return stats;
  }, [orders]);

  /**
   * Recargar órdenes
   */
  const refreshOrders = useCallback((filters) => {
    return loadOrders(filters);
  }, [loadOrders]);

  /**
   * Limpiar orden actual
   */
  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
    setOrderTracking(null);
  }, []);

  // Valores computados
  const hasOrders = orders.length > 0;
  const recentOrders = orders.slice(0, 5);

  const value = {
    // Estado
    orders,
    currentOrder,
    orderTracking,
    pagination,
    isLoading,
    error,
    
    // Valores computados
    hasOrders,
    recentOrders,
    
    // Métodos
    loadOrders,
    createOrder,
    getOrderById,
    getOrderTracking,
    cancelOrder,
    requestReturn,
    getOrdersByStatus,
    canCancelOrder,
    canReturnOrder,
    getOrderStats,
    refreshOrders,
    clearCurrentOrder,
  };

  return (
    <CustomerOrdersContext.Provider value={value}>
      {children}
    </CustomerOrdersContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerOrders = () => {
  const context = useContext(CustomerOrdersContext);
  if (!context) {
    throw new Error('useCustomerOrders must be used within CustomerOrdersProvider');
  }
  return context;
};

export default CustomerOrdersContext;