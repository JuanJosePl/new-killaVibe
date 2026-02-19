/**
 * @module cart.store
 * @description Store Zustand del módulo Cart.
 *
 * REGLAS:
 * ✅ Acciones atómicas — cada acción hace UNA cosa
 * ✅ Selectores atómicos — no devuelven objetos compuestos
 * ✅ loading.global para ops que bloquean toda la UI (clear, fetch)
 * ✅ loading.items (Set de productIds) para spinners individuales
 * ✅ NO llama API directamente — delega a cartService
 * ✅ Las acciones devuelven { success, error? } — nunca lanzan
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import cartService from '../../application/cart.service';
import { syncGuestCartToUser } from '../../infrastructure/cart-sync.service';
import {
  createInitialCartState,
  createCart,
  generateCartSummary,
  CartMode,
  CartSyncStatus,
} from '../../domain/cart.model';
import { isProductInCart, findCartItem } from '../../domain/cart.rules';
import { CART_CACHE_TTL } from '../../domain/cart.constants';

// ── STORE ──────────────────────────────────────────────────────────────────

export const useCartStore = create(
  devtools(
    (set, get) => ({
      ...createInitialCartState(),

      // ── FETCH ────────────────────────────────────────────────────────────

      fetchCart: async (forceRefresh = false) => {
        const { initialized, loading, cache } = get();
        if (loading.global && !forceRefresh) return;

        set(s => ({ loading: { ...s.loading, global: true }, error: null }));

        const result = await cartService.fetchCart({
          forceRefresh,
          cache,
          cacheTTL: CART_CACHE_TTL,
        });

        if (result.success) {
          set({
            cart:        result.cart,
            initialized: true,
            loading:     { global: false, items: new Set() },
            cache:       { data: result.cart, timestamp: Date.now() },
          });
        } else {
          set(s => ({
            loading:     { ...s.loading, global: false },
            initialized: true,
            error:       result.error,
          }));
        }
      },

      // ── ADD ──────────────────────────────────────────────────────────────

      addItem: async (productData, quantity = 1, attributes = {}) => {
        const productId = productData._id || productData.id || productData.productId;

        set(s => ({
          loading: { ...s.loading, items: new Set([...s.loading.items, productId]) },
          error:   null,
        }));

        const result = await cartService.addItem(productData, quantity, attributes);

        set(s => {
          const items = new Set(s.loading.items);
          items.delete(productId);
          return {
            loading: { ...s.loading, items },
            ...(result.success
              ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
              : { error: result.error }
            ),
          };
        });

        return result;
      },

      // ── UPDATE ───────────────────────────────────────────────────────────

      updateItem: async (productId, quantity, attributes = {}) => {
        set(s => ({
          loading: { ...s.loading, items: new Set([...s.loading.items, productId]) },
          error:   null,
        }));

        const result = await cartService.updateItem(productId, quantity, attributes);

        set(s => {
          const items = new Set(s.loading.items);
          items.delete(productId);
          return {
            loading: { ...s.loading, items },
            ...(result.success
              ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
              : { error: result.error }
            ),
          };
        });

        return result;
      },

      // ── REMOVE ───────────────────────────────────────────────────────────

      removeItem: async (productId, attributes = {}) => {
        set(s => ({
          loading: { ...s.loading, items: new Set([...s.loading.items, productId]) },
          error:   null,
        }));

        const result = await cartService.removeItem(productId, attributes);

        set(s => {
          const items = new Set(s.loading.items);
          items.delete(productId);
          return {
            loading: { ...s.loading, items },
            ...(result.success
              ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
              : { error: result.error }
            ),
          };
        });

        return result;
      },

      // ── CLEAR ────────────────────────────────────────────────────────────

      clearCart: async () => {
        set(s => ({ loading: { ...s.loading, global: true }, error: null }));

        const result = await cartService.clearCart();

        set(s => ({
          loading: { ...s.loading, global: false },
          ...(result.success
            ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
            : { error: result.error }
          ),
        }));

        return result;
      },

      // ── COUPON ───────────────────────────────────────────────────────────

      applyCoupon: async (code) => {
        set(s => ({ loading: { ...s.loading, global: true }, error: null }));

        const result = await cartService.applyCoupon(code);

        set(s => ({
          loading: { ...s.loading, global: false },
          ...(result.success
            ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
            : { error: result.error }
          ),
        }));

        return result;
      },

      // ── SHIPPING ─────────────────────────────────────────────────────────

      updateShippingAddress: async (addressData) => {
        set(s => ({ loading: { ...s.loading, global: true }, error: null }));

        const result = await cartService.updateShippingAddress(addressData);

        set(s => ({
          loading: { ...s.loading, global: false },
          ...(result.success
            ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
            : { error: result.error }
          ),
        }));

        return result;
      },

      updateShippingMethod: async (shippingData) => {
        set(s => ({ loading: { ...s.loading, global: true }, error: null }));

        const result = await cartService.updateShippingMethod(shippingData);

        set(s => ({
          loading: { ...s.loading, global: false },
          ...(result.success
            ? { cart: result.cart, cache: { data: result.cart, timestamp: Date.now() } }
            : { error: result.error }
          ),
        }));

        return result;
      },

      // ── AUTH TRANSITIONS ─────────────────────────────────────────────────

      /**
       * Llamar cuando el usuario hace LOGIN.
       * 1. Captura items guest
       * 2. Ejecuta sync
       * 3. Actualiza el store con el carrito final del backend
       */
      onLogin: async (callbacks = {}) => {
        const { onSyncSuccess, onSyncError } = callbacks;

        set(s => ({
          mode:       CartMode.AUTHENTICATED,
          syncStatus: CartSyncStatus.IN_PROGRESS,
          loading:    { ...s.loading, global: true },
          error:      null,
        }));

        try {
          const syncResult = await syncGuestCartToUser({
            onProgress: () => {},
          });

          const finalCart = createCart(syncResult.finalCart);

          set({
            cart:        finalCart,
            mode:        CartMode.AUTHENTICATED,
            syncStatus:  CartSyncStatus.COMPLETED,
            syncResult,
            loading:     { global: false, items: new Set() },
            initialized: true,
            cache:       { data: finalCart, timestamp: Date.now() },
          });

          if (syncResult.success && onSyncSuccess) {
            onSyncSuccess(syncResult);
          }
          if (!syncResult.success && onSyncError) {
            onSyncError(syncResult.error);
          }
        } catch (err) {
          set(s => ({
            syncStatus: CartSyncStatus.FAILED,
            loading:    { ...s.loading, global: false },
            error:      err.message,
          }));
          if (onSyncError) onSyncError(err.message);
        }
      },

      /**
       * Llamar cuando el usuario hace LOGOUT.
       * Limpia el store y carga el carrito guest del localStorage.
       */
      onLogout: () => {
        const { loadGuestCart } = require('../../infrastructure/guest-cart.manager');
        const guestCart = loadGuestCart();

        set({
          cart:        guestCart,
          mode:        CartMode.GUEST,
          syncStatus:  CartSyncStatus.IDLE,
          syncResult:  null,
          loading:     { global: false, items: new Set() },
          error:       null,
          cache:       { data: null, timestamp: null },
          initialized: true,
        });
      },

      // ── UTILIDADES ───────────────────────────────────────────────────────

      clearError: () => set({ error: null }),
    }),
    { name: 'CartStore' }
  )
);

// ── SELECTORES ATÓMICOS ────────────────────────────────────────────────────
// No devuelven objetos compuestos — un selector = un valor.

export const cartSelectors = {
  items:          (s) => s.cart.items,
  itemCount:      (s) => s.cart.itemCount,
  subtotal:       (s) => s.cart.subtotal,
  total:          (s) => s.cart.total,
  discount:       (s) => s.cart.discount,
  shipping:       (s) => s.cart.shipping,
  shippingCost:   (s) => s.cart.shippingCost,
  tax:            (s) => s.cart.tax,
  coupon:         (s) => s.cart.coupon,
  shippingMethod: (s) => s.cart.shippingMethod,
  shippingAddress:(s) => s.cart.shippingAddress,

  loadingGlobal:  (s) => s.loading.global,
  loadingItems:   (s) => s.loading.items,

  error:          (s) => s.error,
  initialized:    (s) => s.initialized,
  mode:           (s) => s.mode,
  syncStatus:     (s) => s.syncStatus,
  syncResult:     (s) => s.syncResult,
  cache:          (s) => s.cache,
};