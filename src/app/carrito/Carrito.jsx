import { ShoppingCart, Heart, RotateCcw, Trash2 } from "lucide-react"
import { PageLayout } from "../../components/page-layout"
import { CartItem } from "../../components/cart-item"
import { CartSummary } from "../../components/cart-summary"
import { Button } from "../../components/ui/button"
import { useCart } from "../../hooks/use-cart"
import { useScrollToTop } from "../../hooks/use-scroll-to-top"
import { Link } from "react-router-dom"
import { formatPrice } from "../../lib/utils"

export default function CartPage() {
  const { items, clearCart, wishlist, moveToCart, isLoading } = useCart()
  
  useScrollToTop()

  const handleCheckout = () => {
    window.location.href = '/checkout'
  }

  const handleClearCart = () => {
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
      clearCart()
    }
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando carrito...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (items.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-muted rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
            <p className="text-muted-foreground mb-8">
              ¡Descubre nuestros productos y llena tu carrito con tecnología increíble!
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full btn-primary">
                <Link to="/productos">Explorar Productos</Link>
              </Button>
              {wishlist.length > 0 && (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/lista-deseos">Ver Lista de Deseos ({wishlist.length})</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Carrito de Compras</h1>
            <p className="text-muted-foreground">
              Revisa tus productos antes de finalizar la compra
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleClearCart} className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Carrito</span>
            </Button>
            {wishlist.length > 0 && (
              <Button variant="outline" asChild className="flex items-center space-x-2">
                <Link to="/lista-deseos">
                  <Heart className="h-4 w-4" />
                  <span>Lista de Deseos ({wishlist.length})</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {items.map((item, index) => (
                <CartItem 
                  key={`${item.product?._id || item.product?.id || index}-${JSON.stringify(item.attributes)}`} 
                  item={item} 
                />
              ))}
            </div>

            {/* Recently Removed Items (Opcional) */}
            {wishlist.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>En tu lista de deseos</span>
                </h3>
                <div className="space-y-3">
                  {wishlist.slice(0, 3).map((item) => (
                    <div key={item._id || item.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={item.images?.[0]?.url || item.image} 
                          alt={item.name} 
                          className="h-12 w-12 object-cover rounded" 
                        />
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => moveToCart(item._id || item.id)}
                        className="flex items-center space-x-2"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Agregar al carrito</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary onCheckout={handleCheckout} />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}