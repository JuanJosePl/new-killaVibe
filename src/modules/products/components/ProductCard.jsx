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
  Check,
  Package,
  Flame,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

// ✅ MIGRADO: Dominio Products — fuente única de verdad
import {
  // Pricing
  formatCOP,
  getDiscountPercentage,
  getAbsoluteSaving,
  hasDiscount,
  // Availability
  canPurchase,
  isLowStock,
  getAvailabilityStatus,
  AVAILABILITY_STATUS,
  // Validators
  isNewProduct,
  // Utils
  getPrimaryImage,
  IMAGE_CONFIG,
} from "@/modules/products";

// ✅ MIGRADO: Bridges de integración (solo estos conocen Cart y Wishlist)
import { useProductCart } from "@/modules/products/integration/useProductCart";
import { useProductWishlist } from "@/modules/products/integration/useProductWishlist";

/**
 * @component ProductCard
 * @description Tarjeta de producto.
 *
 * CAMBIOS DE MIGRACIÓN:
 * - useCartContext / useWishlistContext → useProductCart / useProductWishlist
 * - formatPrice → formatCOP
 * - calculateDiscountPercentage → getDiscountPercentage (recibe product directamente)
 * - isProductAvailable → canPurchase
 * - Eliminado estado local `isFavorite` — la fuente de verdad es useProductWishlist
 * - Eliminado useEffect de sincronización de wishlist (anti-pattern)
 * - Limpiados estados duplicados: isImageLoaded + imageLoaded → solo imageLoaded
 */
export function ProductCard({
  product,
  className = "",
  showWishlistButton = true,
  onAddToCart,
  onToggleWishlist,
}) {
  // ============================================================================
  // HOOKS DE INTEGRACIÓN
  // ============================================================================
  const {
    isProductInCart,
    getProductQuantity,
    quickAddToCart,
    loading: cartLoading,
  } = useProductCart();

  const {
    isProductInWishlist,
    toggleProductWishlist,
    loading: wishlistLoading,
  } = useProductWishlist();

  // ============================================================================
  // ESTADOS LOCALES
  // ============================================================================
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // ============================================================================
  // EXTRACCIÓN DE DATOS DEL PRODUCTO (entidad canónica)
  // ============================================================================
  const _id = product?._id ?? product?.id;
  const name = product?.name ?? "Producto sin nombre";
  const slug = product?.slug ?? _id;
  const stock = product?.stock ?? 0;
  const brand = product?.brand ?? null;
  const isFeatured = product?.isFeatured ?? false;
  const salesCount = product?.salesCount ?? 0;
  const mainCategory = product?.mainCategory ?? null;

  const rating = product?.rating ?? null;
  const averageRating = rating?.average ?? 0;
  const ratingCount = rating?.count ?? 0;

  const primaryImage = getPrimaryImage(product);

  // ============================================================================
  // CÁLCULOS DERIVADOS (dominio puro — no duplicados)
  // ============================================================================
  const price = product?.price ?? 0;
  const comparePrice = product?.comparePrice ?? 0;

  // ✅ Funciones del dominio en lugar de helpers locales
  const discountPct = hasDiscount(product) ? getDiscountPercentage(product) : 0;
  const saving = hasDiscount(product) ? getAbsoluteSaving(product) : 0;
  const isNew = isNewProduct(product);
  const lowStock = isLowStock(product);
  const available = canPurchase(product);
  const availabilityStatus = getAvailabilityStatus(product);

  // Estados del carrito
  const inCart = isProductInCart(_id);
  const quantityInCart = getProductQuantity(_id);

  // ✅ Fuente de verdad: hook (elimina sincronización manual con useEffect)
  const isFavorite = isProductInWishlist(_id);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!product || !_id || !available) return;

    try {
      if (onAddToCart) {
        await onAddToCart(product, 1, {});
      } else {
        await quickAddToCart(product);
      }
    } catch (error) {
      console.error("[ProductCard] Error al agregar al carrito:", error);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!_id || isWishlistLoading || wishlistLoading) return;

    setIsWishlistLoading(true);
    try {
      if (onToggleWishlist) {
        await onToggleWishlist(product);
      } else {
        await toggleProductWishlist(product);
      }
    } catch (error) {
      console.error("[ProductCard] Error toggling wishlist:", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const getButtonConfig = () => {
    if (cartLoading) {
      return {
        text: "Agregando...",
        disabled: true,
        className: "bg-gray-400 text-white cursor-wait",
        icon: ShoppingCart,
      };
    }

    if (inCart) {
      return {
        text: `En carrito (${quantityInCart}) · +1`,
        disabled: false,
        className: "bg-green-600 text-white hover:bg-green-700",
        icon: Check,
      };
    }

    switch (availabilityStatus) {
      case AVAILABILITY_STATUS.OUT_OF_STOCK:
        return {
          text: "Agotado",
          disabled: true,
          className: "bg-gray-300 text-gray-600 cursor-not-allowed",
          icon: AlertCircle,
        };
      case AVAILABILITY_STATUS.LOW_STOCK:
        return {
          text: "Agregar al carrito",
          disabled: false,
          className: "bg-orange-500 hover:bg-orange-600 text-white",
          icon: ShoppingCart,
        };
      case AVAILABILITY_STATUS.BACKORDER:
        return {
          text: "Bajo pedido",
          disabled: false,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
          icon: ShoppingCart,
        };
      case AVAILABILITY_STATUS.AVAILABLE:
      default:
        return {
          text: "Agregar al carrito",
          disabled: false,
          className:
            "bg-gradient-to-r from-primary to-accent text-white hover:shadow-lg hover:scale-[1.02]",
          icon: ShoppingCart,
        };
    }
  };

  const buttonConfig = getButtonConfig();
  const ButtonIcon = buttonConfig.icon;

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div
      className={`group relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/productos/${slug}`} className="block">
        <div
          className={`relative overflow-hidden rounded-xl bg-white border border-gray-200 transition-all duration-300 hover:shadow-xl hover:border-primary/30 ${
            !available ? "opacity-70" : ""
          }`}
        >
          {/* BADGES SUPERIORES */}
          <div className="absolute top-2 left-2 z-20 flex flex-wrap gap-1.5 max-w-[calc(100%-80px)]">
            {discountPct > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>-{discountPct}%</span>
              </div>
            )}
            {isFeatured && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-primary to-purple-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
                <Star className="h-2.5 w-2.5 fill-current" />
                <span>Destacado</span>
              </div>
            )}
            {isNew && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
                <Sparkles className="h-2.5 w-2.5" />
                <span>NUEVO</span>
              </div>
            )}
            {salesCount > 10 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
                <Flame className="h-2.5 w-2.5" />
                <span>{salesCount}+</span>
              </div>
            )}
            {lowStock && available && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md animate-pulse">
                <TrendingUp className="h-2.5 w-2.5" />
                <span>¡{stock} left!</span>
              </div>
            )}
          </div>

          {/* WISHLIST BUTTON */}
          {showWishlistButton && (
            <div className="absolute top-2 right-2 z-20">
              <button
                onClick={handleToggleWishlist}
                disabled={isWishlistLoading || wishlistLoading}
                className={`h-10 w-10 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 flex items-center justify-center ${
                  isFavorite
                    ? "bg-red-500 text-white scale-110"
                    : "bg-white/90 text-gray-700 hover:scale-110 hover:bg-red-50"
                } ${isWishlistLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Heart
                  className={`h-5 w-5 transition-all ${isFavorite ? "fill-current" : ""}`}
                />
              </button>
            </div>
          )}

          {/* CONTENEDOR DE IMAGEN */}
          <div className="relative overflow-hidden">
            <div className="relative aspect-square bg-white">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary" />
                </div>
              )}
              <img
                src={isImageError ? IMAGE_CONFIG.FALLBACK_URL : primaryImage}
                alt={name}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                } ${isHovered ? "scale-110 rotate-2" : "scale-100 rotate-0"}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => {
                  if (!isImageError) {
                    setIsImageError(true);
                    setImageLoaded(true);
                  }
                }}
                loading="lazy"
              />

              {/* OVERLAY CON GRADIENTE */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent transition-opacity duration-300 pointer-events-none ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white text-[9px] font-semibold">
                    <Truck className="h-2.5 w-2.5" />
                    <span>Envío rápido</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-white text-[9px] font-semibold">
                    <Shield className="h-2.5 w-2.5" />
                    <span>Garantía</span>
                  </div>
                </div>
              </div>

              {/* BOTÓN VER DETALLES */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <button className="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold shadow-xl hover:scale-105 transition-transform flex items-center gap-2 text-sm pointer-events-auto">
                  <Eye className="h-4 w-4" />
                  <span>Ver detalles</span>
                </button>
              </div>
            </div>
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="p-3 space-y-2">
            {/* MARCA O CATEGORÍA */}
            {brand ? (
              <div className="flex items-center gap-1.5">
                <Package className="h-3 w-3 text-primary/70" />
                <span className="text-[9px] uppercase tracking-wider font-bold text-primary/70">
                  {brand}
                </span>
              </div>
            ) : (
              mainCategory && (
                <div className="text-[9px] uppercase tracking-wider font-bold text-primary/70">
                  {typeof mainCategory === "string"
                    ? mainCategory
                    : mainCategory?.name}
                </div>
              )
            )}

            {/* NOMBRE */}
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 group-hover:text-primary transition-colors min-h-[2.5rem]">
              {name}
            </h3>

            {/* RATING */}
            {averageRating > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.round(averageRating)
                          ? "fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium text-gray-500">
                  ({ratingCount})
                </span>
              </div>
            )}

            {/* PRECIO */}
            <div className="pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatCOP(price)}
                </span>
                {comparePrice > price && (
                  <span className="text-xs line-through text-gray-400">
                    {formatCOP(comparePrice)}
                  </span>
                )}
              </div>
              {discountPct > 0 && (
                <div className="text-[10px] font-semibold text-green-600 flex items-center mt-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ahorras {formatCOP(saving)}
                </div>
              )}
            </div>

            {/* BOTÓN AGREGAR AL CARRITO */}
            <button
              onClick={handleAddToCart}
              disabled={buttonConfig.disabled}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${buttonConfig.className}`}
            >
              <ButtonIcon className="h-4 w-4" />
              <span>{buttonConfig.text}</span>
            </button>

            {/* ADVERTENCIA STOCK BAJO */}
            {available && availabilityStatus === AVAILABILITY_STATUS.LOW_STOCK && (
              <div className="text-center">
                <span className="text-[10px] text-orange-600 font-semibold flex items-center justify-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  ¡Solo quedan {stock}!
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;