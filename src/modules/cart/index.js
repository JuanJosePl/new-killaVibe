/**
 * @module cart
 * @description API pública del módulo Cart.
 *
 * Todo lo que los componentes y módulos externos necesitan viene de aquí.
 * Nada se importa directamente desde subcarpetas internas.
 *
 * Lo que NO se exporta (detalles de implementación):
 * ❌ infrastructure/
 * ❌ repository/
 * ❌ domain/ (modelos internos, constantes privadas)
 * ❌ store (acceso directo al Zustand store)
 * ❌ api/ (clientes HTTP)
 *
 * @example
 * import { useCart, useCartActions, CartPage } from '@/modules/cart';
 */

// ── HOOKS ──────────────────────────────────────────────────────────────────
export { default as useCart }        from './presentation/hooks/useCart';
export { default as useCartActions } from './presentation/hooks/useCartActions';
export { default as useCartSync }    from './presentation/hooks/useCartSync';

// ── PAGES ──────────────────────────────────────────────────────────────────
export { default as CartPage } from './pages/CartPage';

// ── COMPONENTS (reutilizables fuera del módulo) ────────────────────────────
export { default as CartItem }     from './presentation/components/CartItem';
export { default as CartSummary }  from './presentation/components/CartSummary';
export { default as EmptyCart }    from './presentation/components/EmptyCart';
export { default as CouponForm }   from './presentation/components/CouponForm';
export { default as ShippingForm } from './presentation/components/ShippingForm';