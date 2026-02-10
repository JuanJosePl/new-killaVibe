// products/components/ProductCard.jsx
import { useState } from "react";
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

import { useProductCart } from "../hooks/useProductCart";
import { useProductWishlist } from "../hooks/useProductWishlist";

import {
  formatPrice,
  calculateDiscountPercentage,
} from "../utils/priceHelpers";
import {
  isNewProduct,
  isLowStock,
  isProductAvailable,
  getAvailabilityStatus,
} from "../utils/productHelpers";

export function ProductCard({
  product,
  className = "",
  showWishlistButton = true,
  variant = "default",
}) {
  const {
    isProductInCart,
    getProductQuantity,
    addProductToCart,
    loading: cartLoading,
  } = useProductCart();

  const {
    isProductInWishlist,
    toggleProductWishlist,
    loading: wishlistLoading,
  } = useProductWishlist();

  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const {
    _id,
    name,
    slug,
    price,
    comparePrice,
    image,
    rating,
    brand,
    salesCount,
    mainCategory,
    stock,
    isFeatured,
  } = product;

  const discountPercentage = calculateDiscountPercentage(comparePrice, price);
  const isNew = isNewProduct(product);
  const lowStock = isLowStock(product);
  const available = isProductAvailable(product);
  const availabilityStatus = getAvailabilityStatus(product);

  const averageRating = rating?.average || null;
  const ratingCount = rating?.count || 0;

  const inCart = isProductInCart(_id);
  const quantityInCart = getProductQuantity(_id);
  const inWishlist = isProductInWishlist(_id);

  // ✅ FIX #1: Se elimina el guard `if (!inCart)`.
  // El contexto ya maneja duplicados incrementando la cantidad.
  // Ahora el botón siempre agrega/incrementa mientras haya stock y esté disponible.
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!available || cartLoading) return;

    await addProductToCart(product, 1);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!wishlistLoading) {
      await toggleProductWishlist(product);
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
        // ✅ FIX: ahora muestra la cantidad y permite seguir agregando
        text: `En carrito (${quantityInCart}) · +1`,
        disabled: false,
        className: "bg-green-600 text-white hover:bg-green-700",
        icon: Check,
      };
    }

    switch (availabilityStatus) {
      case "out_of_stock":
        return {
          text: "Agotado",
          disabled: true,
          className: "bg-gray-300 text-gray-600 cursor-not-allowed",
          icon: AlertCircle,
        };

      case "low_stock":
        return {
          text: "Agregar al carrito",
          disabled: false,
          className: "bg-orange-500 hover:bg-orange-600 text-white",
          icon: ShoppingCart,
        };

      case "backorder":
        return {
          text: "Bajo pedido",
          disabled: false,
          className: "bg-blue-500 hover:bg-blue-600 text-white",
          icon: ShoppingCart,
        };

      case "in_stock":
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
            {discountPercentage > 0 && (
              <div className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-[10px] font-bold shadow-md">
                <Zap className="h-2.5 w-2.5 fill-current" />
                <span>-{discountPercentage}%</span>
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
                disabled={wishlistLoading}
                className={`h-9 w-9 rounded-full backdrop-blur-sm shadow-md transition-all duration-200 flex items-center justify-center ${
                  inWishlist
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-white/90 text-gray-700 hover:bg-white hover:scale-110"
                } ${wishlistLoading ? "opacity-50 cursor-wait" : ""}`}
                title={
                  inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"
                }
              >
                <Heart
                  className={`h-4 w-4 transition-all ${
                    inWishlist ? "fill-current" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {/* CONTENEDOR DE IMAGEN */}
          <div className="relative overflow-hidden">
            <div className="relative aspect-square bg-white">
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
                </div>
              )}

              {image ? (
                <img
                  src={image}
                  alt={name}
                  className={`w-full h-full object-contain transition-all duration-500 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <Package className="h-16 w-16" />
                </div>
              )}
            </div>

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

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="p-3 space-y-2">
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
                  {mainCategory.name}
                </div>
              )
            )}

            <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-gray-900 group-hover:text-primary transition-colors min-h-[2.5rem]">
              {name}
            </h3>

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

            <div className="pt-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {formatPrice(price)}
                </span>
                {comparePrice > price && (
                  <span className="text-xs line-through text-gray-400">
                    {formatPrice(comparePrice)}
                  </span>
                )}
              </div>
              {discountPercentage > 0 && (
                <div className="text-[10px] font-semibold text-green-600 flex items-center mt-0.5">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Ahorras {formatPrice(comparePrice - price)}
                </div>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={buttonConfig.disabled}
              className={`w-full py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm ${buttonConfig.className}`}
            >
              <ButtonIcon className="h-4 w-4" />
              <span>{buttonConfig.text}</span>
            </button>

            {available && availabilityStatus === "low_stock" && (
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
