<<<<<<< Updated upstream
// CartPage.jsx
import { useCart, useCartActions, CartItem, CartSummary } from './modules/cart';

function CartPage() {
=======
// src/modules/cart/pages/CartPage.jsx
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast'; // ✅ Usar react-hot-toast
import CartSummary from '../components/CartSummary';
import CartItem from '../components/CartItem';
import CouponForm from '../components/CouponForm';
import useCartActions from '../hooks/useCartActions';
import useCart from '../hooks/useCart';
import EmptyCart from '../components/EmptyCart';
import { ShoppingCart, Trash2 } from 'lucide-react';

/**
 * @component CartPage
 * @description Página principal del carrito de compras
 */
export default function CartPage() {
  const navigate = useNavigate();
>>>>>>> Stashed changes
  const { cart, loading, summary, items, isEmpty } = useCart();
  
  const { 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    applyCoupon 
  } = useCartActions(
    (msg) => toast.success(msg, { duration: 2000 }),
    (err) => toast.error(err, { duration: 3000 })
  );

  // ============================================================================
  // HANDLERS
  // ============================================================================

<<<<<<< Updated upstream
=======
  const handleClearCart = () => {
    if (window.confirm('¿Estás seguro de vaciar el carrito? Esta acción no se puede deshacer.')) {
      clearCart();
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================

  if (loading && !cart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
                Cargando carrito...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: EMPTY STATE
  // ============================================================================

  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <EmptyCart />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: MAIN CONTENT
  // ============================================================================

>>>>>>> Stashed changes
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
                Carrito de Compras
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {summary?.itemCount || 0} {summary?.itemCount === 1 ? 'producto' : 'productos'} en tu carrito
              </p>
            </div>

            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                <Trash2 className="h-4 w-4" />
                Vaciar Carrito
              </button>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Items del carrito */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Productos ({items.length})
                </h2>
                
                <div className="space-y-4">
                  {items.map(item => (
                    <CartItem
                      key={`${item.product._id}-${JSON.stringify(item.attributes)}`}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                      loading={loading}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cupón Form */}
            <CouponForm
              onApply={applyCoupon}
              appliedCoupon={cart?.coupon}
              loading={loading}
            />

            {/* Cart Summary */}
            <CartSummary
              summary={summary}
              cart={cart}
              onCheckout={handleCheckout}
              loading={loading}
              showCheckoutButton={true}
            />
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <TrustBadge
            icon="🔒"
            title="Compra Segura"
            description="Protegemos tu información con encriptación SSL"
          />
          <TrustBadge
            icon="🚚"
            title="Envío Gratis"
            description="En compras mayores a $50.000"
          />
          <TrustBadge
            icon="↩️"
            title="Devoluciones Fáciles"
            description="30 días para cambios y devoluciones"
          />
        </div>
      </div>
    </div>
  );
<<<<<<< Updated upstream
=======
}

// ==============================================================================
// HELPER COMPONENT
// ==============================================================================

function TrustBadge({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4 p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="text-4xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
>>>>>>> Stashed changes
}