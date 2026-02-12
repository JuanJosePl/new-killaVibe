import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Heart,
  Eye,
  Star,
  Zap,
  Truck,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

// Hooks reales integrados
import { useAuth } from "../../../core/hooks/useAuth";
import { useCartContext } from "../../../modules/cart/context/CartContext";
import { useWishlistContext } from "../../../modules/wishlist/context/WishlistContext"; // ✅ AGREGADO

// Utilidades reales
import { formatPrice, calculateDiscountPercentage } from "../utils/priceHelpers";
import { 
  isNewProduct, 
  isLowStock, 
  getPrimaryImage, 
  isProductAvailable 
} from "../utils/productHelpers";

/**
 * @component ProductCard
 * @description Componente de tarjeta de producto con efectos visuales avanzados y lógica de negocio.
 * 
 * ✅ FIXES APLICADOS:
 * - Verificación correcta de productos en wishlist usando isInWishlist()
 * - Estado local sincronizado con contexto global
 * - Manejo correcto de agregar/quitar de wishlist
 */
export function ProductCard({
  product,
  className = "",
  showWishlistButton = true,
  onAddToCart,
  onToggleWishlist,
  isInWishlist: isInWishlistProp, // ⚠️ DEPRECADO: Ahora usamos el contexto
}) {
  const { addItem } = useCartContext();
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlistContext(); // ✅ NUEVO
  
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ✅ ESTADO LOCAL: Sincronizado con wishlist global
  const [isFavorite, setIsFavorite] = useState(false);

  // ✅ SINCRONIZAR con wishlist cuando el producto o wishlist cambien
  useEffect(() => {
    const productId = product._id || product.id;
    if (productId) {
      const inWishlist = isInWishlist(productId);
      setIsFavorite(inWishlist);
    }
  }, [product._id, product.id, isInWishlist]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !product._id) {
      console.error("Error: Intentando agregar un producto inválido", product);
      return;
    }

    if (available) {
      if (addItem) {
        addItem(product, 1, {}); 
      } else if (onAddToCart) {
        onAddToCart(product, 1, {}); 
      }
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsWishlistLoading(true);

    try {
      const productId = product._id || product.id;

      if (isFavorite) {
        // ✅ Quitar de wishlist
        await removeFromWishlist(productId);
        setIsFavorite(false);
      } else {
        // ✅ Agregar a wishlist (enviamos el producto completo)
        await addToWishlist(product);
        setIsFavorite(true);
      }

      // Callback opcional (si se pasa desde padre)
      if (onToggleWishlist) {
        await onToggleWishlist(product);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      // Revertir estado en caso de error
      setIsFavorite(!isFavorite);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // ============================================================================
  // LÓGICA DE NEGOCIO / HELPERS
  // ============================================================================
  
  const discountPercentage = calculateDiscountPercentage(product.comparePrice, product.price);
  const isNew = isNewProduct(product);
  const lowStock = isLowStock(product);
  const available = isProductAvailable(product);
  const primaryImage = getPrimaryImage(product);

  const averageRating = product.rating?.average || null;
  const ratingCount = product.rating?.count || 0;

  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        to={`/productos/${product.slug}`}
        className="block"
      >
        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-card to-card/80 border-2 border-border/50 transition-all duration-500 hover:shadow-2xl hover:scale-[1.02] backdrop-blur-sm ${
            !available ? "opacity-70 grayscale" : ""
          } ${isHovered ? "border-primary/30 shadow-xl shadow-primary/10" : ""}`}
        >
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-accent/0 to-primary/0 group-hover:from-primary/5 group-hover:via-accent/5 group-hover:to-primary/5 transition-all duration-700 pointer-events-none"></div>

          {/* Top Badges */}
          <div className="absolute top-3 left-3 z-20 flex flex-col space-y-2">
            {discountPercentage > 0 && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg animate-pulse backdrop-blur-sm">
                <Zap className="h-3 w-3 fill-current" />
                <span>-{discountPercentage}%</span>
              </div>
            )}
            {product.isFeatured && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-primary to-purple-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur-sm">
                <Star className="h-3 w-3 fill-current" />
                <span>Destacado</span>
              </div>
            )}
            {isNew && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg backdrop-blur-sm">
                <Sparkles className="h-3 w-3" />
                <span>NUEVO</span>
              </div>
            )}
            {lowStock && available && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full font-bold text-xs shadow-lg animate-pulse backdrop-blur-sm">
                <TrendingUp className="h-3 w-3" />
                <span>¡Últimos {product.stock}!</span>
              </div>
            )}
          </div>

          {/* ✅ Wishlist Button - CORREGIDO */}
          {showWishlistButton && (
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading}
                className={`h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isFavorite 
                    ? "bg-red-500 text-white scale-110" 
                    : "bg-white/90 text-gray-700 hover:scale-110 hover:bg-red-50"
                } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Heart className={`h-5 w-5 transition-all ${isFavorite ? "fill-current" : ""}`} />
              </button>
            </div>
          )}

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted/30">
            {!isImageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-shimmer flex items-center justify-center">
                <div className="text-muted-foreground animate-pulse text-xs font-medium">Cargando...</div>
              </div>
            )}

            <img
              src={isImageError ? getPrimaryImage({}) : primaryImage}
              alt={product.name}
              className={`h-full w-full object-cover transition-all duration-700 ${
                isImageLoaded ? "opacity-100" : "opacity-0"
              } ${isHovered ? "scale-110 rotate-2" : "scale-100 rotate-0"}`}
              onLoad={() => setIsImageLoaded(true)}
              onError={() => {
                if (!isImageError) {
                  setIsImageError(true);
                  setIsImageLoaded(true);
                }
              }}
              loading="lazy"
            />

            {/* Hover Overlays */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-500 ${isHovered ? "opacity-100" : "opacity-0"}`}>
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-tighter">
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                    <Truck className="h-3 w-3" />
                    <span>Envío rápido</span>
                  </div>
                  <div className="flex items-center space-x-1 bg-white/20 backdrop-blur-md px-2 py-1 rounded-md">
                    <Shield className="h-3 w-3" />
                    <span>Garantía</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${isHovered ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
              <button className="px-6 py-3 bg-white text-foreground rounded-full font-bold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110 flex items-center space-x-2 backdrop-blur-sm">
                <Eye className="h-5 w-5" />
                <span>Ver detalles</span>
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-5 space-y-3">
            {product.mainCategory && (
              <div className="text-[10px] uppercase tracking-[0.2em] font-black text-primary/70">
                {product.mainCategory.name}
              </div>
            )}

            <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300 min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            {averageRating && (
              <div className="flex items-center space-x-1.5">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < Math.round(averageRating) ? "fill-current" : "text-muted"}`} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-muted-foreground">({ratingCount})</span>
              </div>
            )}

            {/* Price Section */}
            <div className="pt-2">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(product.price)}
                </span>
                {product.comparePrice > product.price && (
                  <span className="text-xs line-through text-muted-foreground/60 font-medium">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <div className="text-[10px] font-bold text-green-500 flex items-center mt-1">
                  <Sparkles className="h-3 w-3 mr-1" />
                  AHORRAS {formatPrice(product.comparePrice - product.price)}
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!available}
              className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 overflow-hidden relative group/btn ${
                !available
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02] active:scale-95"
              }`}
            >
              <ShoppingCart className="h-5 w-5 relative z-10 transition-transform group-hover/btn:-rotate-12" />
              <span className="relative z-10">{!available ? "Agotado" : "Agregar al carrito"}</span>
              
              {/* Shine effect on button hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
            </button>

            {/* Stock Status Footer */}
            {available && (
              <div className="text-[11px] text-center pt-1">
                {product.stock > 10 ? (
                  <span className="text-green-500/80 font-medium flex items-center justify-center">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                    Producto disponible
                  </span>
                ) : (
                  <span className="text-orange-500 font-bold flex items-center justify-center uppercase tracking-tighter">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    ¡Solo quedan {product.stock} unidades!
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* External Border & Glow Decoration */}
          <div className={`absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none transition-all duration-500 ${isHovered ? "border-primary/20 shadow-inner" : ""}`}></div>
        </div>
      </Link>
    </div>
  );
}