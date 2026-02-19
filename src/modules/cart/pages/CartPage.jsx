import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react';

// Componentes (migrados)
import CartSummary from '../presentation/components/CartSummary';
import CartItem    from '../presentation/components/CartItem';
import EmptyCart   from '../presentation/components/EmptyCart';
import CouponForm  from '../presentation/components/CouponForm';

// Hooks de la nueva arquitectura
import useCart        from '../presentation/hooks/useCart';
import useCartActions from '../presentation/hooks/useCartActions';

/**
 * @page CartPage
 * @description Página del carrito — unificada guest + authenticated.
 *
 * MIGRADO:
 * - Eliminado todo acceso a CartContext / CustomerCartContext
 * - Eliminado paso de `updateQuantity` / `removeFromCart` como props a CartItem
 *   (CartItem ahora llama a sus propios hooks internamente)
 * - CartSummary ya no recibe `summary` ni `cart` como props
 * - CouponForm integrado en sidebar
 * - UI idéntica al original (incluso el filtrado de items dañados)
 */
function CartPage() {
  const navigate = useNavigate();

  // ── LECTURA ────────────────────────────────────────────────────────────────
  const {
    items,
    loading,
    error,
    initialized,
    isEmpty,
  } = useCart();

  // ── ESCRITURA ──────────────────────────────────────────────────────────────
  const {
    clearCart,
    removeFromCart,
    initCart,
  } = useCartActions(
    (msg) => toast.success(String(msg)),
    (msg) => {
      const errorMsg = typeof msg === 'string' ? msg : msg?.message || 'Error en el carrito';
      toast.error(errorMsg);
    }
  );

  // ── CARGA INICIAL ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!initialized) initCart();
  }, [initialized]);

  // ── ESTADOS DE PANTALLA COMPLETA ───────────────────────────────────────────

  if (error && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8 text-center">
        <div className="bg-red-50 border border-red-200 p-6 rounded-2xl">
          <p className="text-red-600 font-bold">Ocurrió un error al cargar el carrito.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 text-sm underline text-red-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (loading.global && !initialized) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isEmpty) {
    return <EmptyCart />;
  }

  // ── RENDER PRINCIPAL ───────────────────────────────────────────────────────

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">

      {/* HEADER CON BOTÓN VACIAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Carrito de Compras
        </h1>

        <button
          onClick={() => {
            if (window.confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
              clearCart();
            }
          }}
          disabled={loading.global}
          className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-red-100 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-all duration-300 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
          <span>Vaciar Carrito</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LISTADO DE PRODUCTOS */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item, index) => {
            // Filtrado preventivo: items dañados o sin producto válido
            const product = item?.product || {};
            const pid     = item?.productId || product._id || product.id;

            if (!product || !product.name || !pid) {
              return (
                <div
                  key={index}
                  className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center text-red-600 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span role="img" aria-label="warning">⚠️</span>
                    Producto no disponible o datos incompletos
                  </span>
                  <button
                    onClick={() => removeFromCart(pid || item?.productId, item?.attributes)}
                    className="underline font-bold hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              );
            }

            const safeKey = `${pid}-${JSON.stringify(item?.attributes || {})}`;

            return (
              // CartItem ya consume sus propios hooks —
              // no necesita recibir onUpdateQuantity / onRemove
              <CartItem
                key={safeKey}
                item={item}
              />
            );
          })}
        </div>

        {/* SIDEBAR: CUPÓN + RESUMEN */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-4">

            {/* Cupón */}
            <CouponForm />

            {/* CartSummary ya lee todo de useCart() internamente */}
            <CartSummary
              onCheckout={() => navigate('/checkout')}
              loading={loading.global}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;