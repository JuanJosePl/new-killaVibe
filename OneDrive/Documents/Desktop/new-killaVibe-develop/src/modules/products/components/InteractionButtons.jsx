import { useState } from "react";
import { ShoppingCart, Check, Heart, Loader } from "lucide-react";
import { useProductCart } from "../hooks/useProductCart";
import { useProductWishlist } from "../hooks/useProductWishlist";
import { isProductAvailable } from "../utils/productHelpers";

/**
 * @component AddToCartButton
 * @description Botón standalone para agregar al carrito con todas las validaciones
 *
 * ✅ USA:
 * - useProductCart() - estado real del carrito
 * - isProductAvailable() - validación de disponibilidad
 * - Stock checking integrado
 */
export function AddToCartButton({
  product,
  quantity = 1,
  variant = "primary",
  size = "md",
  fullWidth = false,
  showIcon = true,
  className = "",
}) {
  const {
    isProductInCart,
    getProductQuantity,
    addProductToCart,
    incrementQuantity,
    loading,
  } = useProductCart();

  const [isAdding, setIsAdding] = useState(false);

  const inCart = isProductInCart(product._id);
  const quantityInCart = getProductQuantity(product._id);
  const available = isProductAvailable(product);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!available || isAdding) return;

    setIsAdding(true);
    try {
      if (inCart) {
        await incrementQuantity(product);
      } else {
        await addProductToCart(product, quantity);
      }
    } finally {
      setIsAdding(false);
    }
  };

  // ✅ Variantes de estilo
  const variants = {
    primary:
      "bg-gradient-to-r from-primary to-accent text-white hover:shadow-xl hover:shadow-primary/20",
    secondary:
      "bg-white border-2 border-primary text-primary hover:bg-primary/5",
    success: "bg-green-600 text-white hover:bg-green-700",
    disabled: "bg-gray-300 text-gray-600 cursor-not-allowed",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const getVariant = () => {
    if (!available) return "disabled";
    if (inCart) return "success";
    return variant;
  };

  const getButtonText = () => {
    if (isAdding || loading) return "Agregando...";
    if (!available) return "Agotado";
    if (inCart) return `En carrito (${quantityInCart})`;
    return "Agregar al carrito";
  };

  const ButtonIcon = inCart ? Check : ShoppingCart;
  const isDisabled = !available || isAdding || loading;

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`
        ${fullWidth ? "w-full" : ""}
        ${variants[getVariant()]}
        ${sizes[size]}
        rounded-xl font-bold transition-all duration-300
        flex items-center justify-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {showIcon && (isAdding || loading) && (
        <Loader className="h-5 w-5 animate-spin" />
      )}
      {showIcon && !isAdding && !loading && <ButtonIcon className="h-5 w-5" />}
      <span>{getButtonText()}</span>
    </button>
  );
}

/**
 * @component WishlistButton
 * @description Botón standalone para wishlist con estado persistente
 *
 * ✅ USA:
 * - useProductWishlist() - estado real de wishlist
 * - Persistencia en backend
 * - Animaciones de toggle
 */
export function WishlistButton({
  product,
  variant = "icon",
  size = "md",
  showText = false,
  className = "",
}) {
  const { isProductInWishlist, toggleProductWishlist, loading } =
    useProductWishlist();

  const [isToggling, setIsToggling] = useState(false);

  const inWishlist = isProductInWishlist(product._id);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isToggling) return;

    setIsToggling(true);
    try {
      await toggleProductWishlist(product);
    } finally {
      setIsToggling(false);
    }
  };

  // ✅ Variantes de estilo
  const variants = {
    icon: `rounded-full ${
      inWishlist
        ? "bg-red-500 text-white hover:bg-red-600"
        : "bg-white/90 text-gray-700 hover:bg-white"
    }`,
    button: `rounded-xl ${
      inWishlist
        ? "bg-red-50 border-2 border-red-500 text-red-600"
        : "bg-white border-2 border-gray-300 text-gray-700 hover:border-primary"
    }`,
  };

  const sizes = {
    sm: variant === "icon" ? "w-8 h-8" : "px-3 py-2 text-sm",
    md: variant === "icon" ? "w-10 h-10" : "px-4 py-2.5 text-base",
    lg: variant === "icon" ? "w-12 h-12" : "px-6 py-3 text-lg",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <button
      onClick={handleClick}
      disabled={isToggling || loading}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        backdrop-blur-md shadow-lg transition-all duration-300
        flex items-center justify-center space-x-2
        hover:scale-110 hover:shadow-xl
        disabled:opacity-50 disabled:cursor-wait
        ${inWishlist ? "scale-110" : ""}
        ${className}
      `}
      title={inWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
    >
      {isToggling || loading ? (
        <Loader className={`${iconSizes[size]} animate-spin`} />
      ) : (
        <Heart
          className={`${iconSizes[size]} transition-transform duration-300 ${
            inWishlist ? "fill-current scale-110" : ""
          }`}
        />
      )}
      {showText && (
        <span className="font-semibold">
          {inWishlist ? "En favoritos" : "Agregar a favoritos"}
        </span>
      )}
    </button>
  );
}

/**
 * @component QuickActionsBar
 * @description Barra combinada de acciones rápidas (cart + wishlist)
 */
export function QuickActionsBar({ product, className = "" }) {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <AddToCartButton product={product} fullWidth size="md" />
      <WishlistButton product={product} variant="icon" size="md" />
    </div>
  );
}
