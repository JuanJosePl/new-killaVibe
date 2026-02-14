// wishlist/components/WishlistButton.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useWishlistContext } from "../context/WishlistContext";
import { useWishlistActions } from "../hooks/useWishlistActions";
import { isProductInWishlist } from "../utils/wishlistHelpers";

/**
 * @component WishlistButton
 * @description Botón de corazón para agregar/quitar de wishlist
 *
 * 🆕 MEJORADO:
 * - Optimización de re-renders con useMemo
 * - Animación solo en success
 * - Mejor manejo de estados
 */
const WishlistButton = ({
  productId,
  notifyPriceChange = false,
  notifyAvailability = false,
  size = "md",
  variant = "icon",
  onSuccess,
  onError,
}) => {
  const { wishlist } = useWishlistContext();
  const { addToWishlist, removeFromWishlist, loading } = useWishlistActions(
    onSuccess,
    onError
  );

  const [isAnimating, setIsAnimating] = useState(false);

  // 🆕 OPTIMIZACIÓN: Solo re-calcular cuando cambia la lista de IDs, no todo el objeto wishlist
  const isInWishlist = useMemo(() => {
    if (!wishlist || !productId) return false;
    return isProductInWishlist(wishlist, productId);
  }, [wishlist?.items?.length, productId]); // Solo depende del length, no del objeto completo

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    try {
      if (isInWishlist) {
        await removeFromWishlist(productId);
      } else {
        await addToWishlist({
          productId,
          notifyPriceChange,
          notifyAvailability,
        });
      }

      // 🆕 Animación solo después de success
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  // Tamaños
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  // Variante icon (solo corazón)
  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={loading}
        className={`
          ${sizes[size]}
          rounded-full
          flex items-center justify-center
          transition-all duration-200
          ${
            isInWishlist
              ? "bg-red-100 text-red-600 hover:bg-red-200"
              : "bg-white text-gray-400 hover:text-red-500 hover:bg-red-50"
          }
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
          ${isAnimating ? "scale-125" : "scale-100"}
        `}
        title={isInWishlist ? "Quitar de favoritos" : "Agregar a favoritos"}
        aria-label={
          isInWishlist ? "Quitar de favoritos" : "Agregar a favoritos"
        }
      >
        {loading ? (
          <svg
            className={`${iconSizes[size]} animate-spin`}
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <svg
            className={`${iconSizes[size]} transition-transform ${
              isAnimating ? "scale-110" : ""
            }`}
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isInWishlist ? 0 : 2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
      </button>
    );
  }

  // Variante button (botón completo con texto)
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        inline-flex items-center gap-2
        px-4 py-2 rounded-lg
        font-medium text-sm
        transition-all duration-200
        ${
          isInWishlist
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-white text-gray-700 border border-gray-300 hover:border-red-500 hover:text-red-500"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
        ${isAnimating ? "scale-105" : "scale-100"}
      `}
    >
      {loading ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Procesando...</span>
        </>
      ) : (
        <>
          <svg
            className={`w-5 h-5 ${isAnimating ? "scale-110" : ""}`}
            fill={isInWishlist ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isInWishlist ? 0 : 2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{isInWishlist ? "En favoritos" : "Agregar a favoritos"}</span>
        </>
      )}
    </button>
  );
};

export default WishlistButton;
