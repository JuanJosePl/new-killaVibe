// modules/orders/presentation/store/orders.store.js
//
// Store Zustand del módulo Orders.
// Reemplaza completamente CustomerOrdersContext.
//
// Responsabilidades:
//   - Estado global de órdenes
//   - Acciones atómicas (sin lógica de negocio pesada)
//   - Loading/error granulares por operación
//   - Delegación total a orders.service.js
//
// Reglas:
//   - Sin lógica de dominio directa
//   - Sin llamadas a API directas
//   - Sin Context de React
//   - Todo estado es serializable

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import ordersService from '../../application/orders.service.js';

const initialState = {
  // Lista de órdenes paginada
  orders:     [],
  pagination: null,

  // Orden seleccionada / detalle
  selectedOrder:   null,
  orderTracking:   null,

  // Estados de loading granulares
  loading: {
    list:    false,
    detail:  false,
    create:  false,
    cancel:  false,
    return:  false,
    tracking: false,
  },

  // Error por operación
  errors: {
    list:    null,
    detail:  null,
    create:  null,
    cancel:  null,
    return:  null,
    tracking: null,
  },

  // ID de la orden que está siendo cancelada (para UI optimista)
  cancellingOrderId: null,
};

export const useOrdersStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // =========================================
      // ACCIONES DE LECTURA
      // =========================================

      /**
       * Cargar listado de órdenes del usuario.
       * @param {Object} filters
       */
      loadOrders: async (filters = {}) => {
        set(s => ({
          loading: { ...s.loading, list: true },
          errors:  { ...s.errors,  list: null  },
        }));

        try {
          const { orders, pagination } = await ordersService.getUserOrders(filters);
          set({ orders, pagination });
          return { success: true };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, list: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({ loading: { ...s.loading, list: false } }));
        }
      },

      /**
       * Cargar detalle de una orden.
       * @param {string} orderId
       */
      loadOrderDetail: async (orderId) => {
        set(s => ({
          loading: { ...s.loading, detail: true },
          errors:  { ...s.errors,  detail: null  },
          selectedOrder: null,
          orderTracking: null,
        }));

        try {
          const order = await ordersService.getOrderById(orderId);
          set({ selectedOrder: order });
          return { success: true, order };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, detail: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({ loading: { ...s.loading, detail: false } }));
        }
      },

      /**
       * Cargar tracking de una orden.
       * @param {string} orderId
       */
      loadOrderTracking: async (orderId) => {
        set(s => ({
          loading: { ...s.loading, tracking: true },
          errors:  { ...s.errors,  tracking: null  },
        }));

        try {
          const tracking = await ordersService.getOrderTracking(orderId);
          set({ orderTracking: tracking });
          return { success: true, tracking };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, tracking: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({ loading: { ...s.loading, tracking: false } }));
        }
      },

      // =========================================
      // ACCIONES DE ESCRITURA
      // =========================================

      /**
       * Crear orden desde carrito.
       * @param {Object} orderData
       */
      createOrder: async (orderData) => {
        set(s => ({
          loading: { ...s.loading, create: true },
          errors:  { ...s.errors,  create: null  },
        }));

        try {
          const order = await ordersService.createOrder(orderData);

          // Agregar al inicio de la lista
          set(s => ({
            orders:        [order, ...s.orders],
            selectedOrder: order,
          }));

          return { success: true, order };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, create: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({ loading: { ...s.loading, create: false } }));
        }
      },

      /**
       * Cancelar una orden.
       * Requiere la entidad cargada para validación de dominio.
       * @param {OrderEntity} order
       */
      cancelOrder: async (order) => {
        set(s => ({
          loading:           { ...s.loading, cancel: true },
          errors:            { ...s.errors,  cancel: null  },
          cancellingOrderId: order._id,
        }));

        try {
          const updated = await ordersService.cancelOrder(order);

          // Actualizar en la lista
          set(s => ({
            orders: s.orders.map(o => o._id === order._id ? updated : o),
            selectedOrder: s.selectedOrder?._id === order._id ? updated : s.selectedOrder,
          }));

          return { success: true, order: updated };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, cancel: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({
            loading:           { ...s.loading, cancel: false },
            cancellingOrderId: null,
          }));
        }
      },

      /**
       * Solicitar devolución de una orden.
       * Requiere la entidad cargada para validación de dominio.
       * @param {OrderEntity} order
       * @param {string} reason
       */
      requestReturn: async (order, reason) => {
        set(s => ({
          loading: { ...s.loading, return: true },
          errors:  { ...s.errors,  return: null  },
        }));

        try {
          const updated = await ordersService.requestReturn(order, reason);

          set(s => ({
            orders: s.orders.map(o => o._id === order._id ? updated : o),
            selectedOrder: s.selectedOrder?._id === order._id ? updated : s.selectedOrder,
          }));

          return { success: true, order: updated };
        } catch (err) {
          set(s => ({ errors: { ...s.errors, return: err } }));
          return { success: false, error: err };
        } finally {
          set(s => ({ loading: { ...s.loading, return: false } }));
        }
      },

      // =========================================
      // MUTACIONES DE UI (SINCRONO)
      // =========================================

      clearSelectedOrder: () => set({ selectedOrder: null, orderTracking: null }),

      clearError: (operation) =>
        set(s => ({ errors: { ...s.errors, [operation]: null } })),

      reset: () => set(initialState),
    }),
    { name: 'orders-store' }
  )
);

// =========================================
// SELECTORES
// =========================================

/**
 * Selector: lista de órdenes filtrada por estado.
 * Operación local — no requiere nueva petición.
 */
export const selectOrdersByStatus = (status) => (state) =>
  ordersService.filterOrdersByStatus(state.orders, status);

/**
 * Selector: estadísticas calculadas de la lista actual.
 */
export const selectOrderStats = (state) =>
  ordersService.computeOrderStats(state.orders);

/**
 * Selector: ¿hay órdenes cargadas?
 */
export const selectHasOrders = (state) => state.orders.length > 0;

/**
 * Selector: ¿alguna operación en curso?
 */
export const selectIsAnyLoading = (state) =>
  Object.values(state.loading).some(Boolean);