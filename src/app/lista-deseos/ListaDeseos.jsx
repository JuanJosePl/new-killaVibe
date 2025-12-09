// app/lista-deseos/page.jsx
import { Heart, ShoppingCart, Trash2, ArrowLeft, Eye, Share2 } from "lucide-react"
import { PageLayout } from "../../components/page-layout"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Badge } from "../../components/ui/badge"
import { formatPrice } from "../../lib/products"
import { useCart } from "../../hooks/use-cart"
import { useScrollToTop } from "../../hooks/use-scroll-to-top"
import { Link } from "react-router-dom"

export default function WishlistPage() {
  const { wishlist, toggleWishlist, moveToCart, clearWishlist } = useCart()
  
  useScrollToTop()

  const handleMoveToCart = (productId) => {
    moveToCart(productId)
  }

  const handleRemoveFromWishlist = (product) => {
    toggleWishlist(product)
  }

  const handleClearWishlist = () => {
    if (confirm('¿Estás seguro de que quieres vaciar tu lista de deseos?')) {
      clearWishlist()
    }
  }

  const handleShareWishlist = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi lista de deseos - KillaVibes',
          text: `Mira mi lista de deseos con ${wishlist.length} productos increíbles`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace de la lista de deseos copiado al portapapeles')
    }
  }

  if (wishlist.length === 0) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <div className="bg-pink-50 dark:bg-pink-950 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-12 w-12 text-pink-500" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Tu lista de deseos está vacía</h1>
            <p className="text-muted-foreground mb-8">
              Guarda tus productos favoritos aquí para no perderlos de vista
            </p>
            <div className="space-y-4">
              <Button asChild className="w-full btn-primary">
                <Link to="/productos">Explorar Productos</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link to="/ofertas">Ver Ofertas Especiales</Link>
              </Button>
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
          <div className="flex items-center space-x-4">
            <Link to="/productos" className="flex items-center text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a productos
            </Link>
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Heart className="h-8 w-8 text-pink-500 mr-3" />
                Mi Lista de Deseos
              </h1>
              <p className="text-muted-foreground">
                {wishlist.length} producto{wishlist.length !== 1 ? 's' : ''} guardado{wishlist.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleShareWishlist} className="flex items-center space-x-2">
              <Share2 className="h-4 w-4" />
              <span>Compartir</span>
            </Button>
            <Button variant="outline" onClick={handleClearWishlist} className="flex items-center space-x-2">
              <Trash2 className="h-4 w-4" />
              <span>Vaciar Lista</span>
            </Button>
          </div>
        </div>

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((product) => (
            <Card key={product.id} className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
              <Link to={`/productos/${product.id}`}>
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {product.featured && <Badge className="absolute top-2 left-2 bg-primary">Destacado</Badge>}
                  {product.discount && (
                    <Badge className="absolute top-2 left-2 bg-red-500">
                      -{product.discount}%
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 space-y-2">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className="h-8 w-8 bg-red-50 text-red-500 hover:bg-red-100"
                      onClick={(e) => {
                        e.preventDefault()
                        handleRemoveFromWishlist(product)
                      }}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Link>

              <CardContent className="p-4">
                <Link to={`/productos/${product.id}`}>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-primary">
                      {product.discount 
                        ? formatPrice(product.price * (1 - product.discount / 100))
                        : formatPrice(product.price)
                      }
                    </span>
                    {product.discount && (
                      <span className="text-sm line-through text-muted-foreground">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  {product.inStock ? (
                    <Badge variant="secondary" className="text-xs">
                      En stock
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-xs">
                      Agotado
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleMoveToCart(product.id)}
                    disabled={!product.inStock}
                    className="flex-1 btn-primary text-sm"
                    size="sm"
                  >
                    <ShoppingCart className="h-3 w-3 mr-2" />
                    Agregar al carrito
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="flex-shrink-0 bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                    onClick={() => handleRemoveFromWishlist(product)}
                    title="Quitar de lista de deseos"
                  >
                    <Heart className="h-3 w-3 fill-current" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Wishlist Summary */}
        <Card className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-2">Resumen de tu lista de deseos</h3>
                <p className="text-muted-foreground">
                  Valor total: <span className="font-bold text-primary">{formatPrice(
                    wishlist.reduce((total, product) => total + product.price, 0)
                  )}</span>
                </p>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => {
                    wishlist.forEach(product => {
                      if (product.inStock) {
                        moveToCart(product.id)
                      }
                    })
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Agregar todos al carrito
                </Button>
                <Button asChild variant="outline">
                  <Link to="/productos">Seguir comprando</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}