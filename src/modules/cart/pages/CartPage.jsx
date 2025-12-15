// CartPage.jsx
import { useCart, useCartActions, CartItem, CartSummary } from './modules/cart';

function CartPage() {
  const { cart, loading, summary, items, isEmpty } = useCart();
  const { updateQuantity, removeFromCart, clearCart } = useCartActions(
    (msg) => toast.success(msg),
    (err) => toast.error(err)
  );

  if (isEmpty) return <EmptyCart />;

  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2 space-y-4">
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
      <div>
        <CartSummary
          summary={summary}
          cart={cart}
          onCheckout={() => navigate('/checkout')}
        />
      </div>
    </div>
  );
}