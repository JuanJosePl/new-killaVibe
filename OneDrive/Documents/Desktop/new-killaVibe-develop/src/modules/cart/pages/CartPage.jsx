import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Trash2 } from 'lucide-react'; 
import CartSummary from '../components/CartSummary';
import CartItem from '../components/CartItem';
import EmptyCart from '../components/EmptyCart';
import useCartActions from '../hooks/useCartActions';
import useCart from '../hooks/useCart';

function CartPage() {
  const navigate = useNavigate();

  const { cart, loading, summary, items = [], error } = useCart();

  // 1. Extraemos métodos de useCartActions con manejo de notificaciones
  const { updateQuantity, removeFromCart, clearCart } = useCartActions(
    (msg) => toast.success(String(msg)),
    (err) => {
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Error en el carrito';
      toast.error(errorMsg);
    }
  );

  // Handlers de estado inicial
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

  if (loading && items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
      {/* HEADER DEL CARRITO CON BOTÓN VACIAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Carrito de Compras
        </h1>
        
        {/* BOTÓN VACIAR CARRITO */}
        <button
          onClick={() => {
            if (window.confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
              clearCart();
            }
          }}
          disabled={loading}
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
            // Filtrado preventivo para el "producto inexistente" o dañado
            if (!item.product || item.product.name === 'Producto sin nombre' || !item.product._id) {
              return (
                <div key={index} className="p-4 bg-red-50 border border-red-200 rounded-xl flex justify-between items-center text-red-600 text-sm">
                  <span className="flex items-center gap-2">
                    <span role="img" aria-label="warning">⚠️</span> 
                    Producto no disponible o datos incompletos
                  </span>
                  <button 
                    onClick={() => removeFromCart(item.product?._id || item.productId, item.attributes)} 
                    className="underline font-bold hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </div>
              );
            }

            const safeKey = `${item.product._id}-${JSON.stringify(item.attributes || {})}`;

            return (
              <CartItem
                key={safeKey}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                loading={loading}
              />
            );
          })}
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <CartSummary
              summary={{
                subtotal: summary?.subtotal || 0,
                total: summary?.total || 0,
                itemCount: summary?.itemCount || 0,
                shipping: summary?.shipping || 0,
                tax: summary?.tax || 0,
                discount: summary?.discount || 0,
                savings: summary?.savings || 0,
                shippingDiscount: summary?.shippingDiscount || 0
              }}
              cart={cart}
              onCheckout={() => navigate('/checkout')}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartPage;