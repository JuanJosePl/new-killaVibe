// src/modules/customer/components/products/ProductCard.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @component ProductCard
 * @description Card premium de producto con estados de loading granulares
 * 
 * ✅ FEATURES:
 * - Loading states individuales (cart, wishlist)
 * - Indicadores visuales de estado (en carrito, en wishlist)
 * - Hover effects sutiles
 * - Responsive design
 * - Lazy loading de imágenes
 */
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  // ✅ NUEVOS PROPS
  isInCart = false,
  isInWishlist = false,
  isCartLoading = false,
  isWishlistLoading = false,
}) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Calcular descuento
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // Imagen principal
  const primaryImage = product.images?.[0]?.url || product.primaryImage?.url || '/placeholder-product.png';

  // Estado de stock
  const isInStock = product.stock > 0 || product.allowBackorder;
  const isLowStock = product.stock > 0 && product.stock <= (product.lowStockThreshold || 5);

  const handleClick = () => {
    navigate(`/customer/products/${product.slug}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!isCartLoading && isInStock) {
      onAddToCart?.(product);
    }
  };

  const handleAddToWishlist = (e) => {
    e.stopPropagation();
    if (!isWishlistLoading) {
      onAddToWishlist?.(product);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              -{discount}%
            </div>
          </div>
        )}

        {/* Featured Badge */}
        {product.isFeatured && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              ⭐ Destacado
            </div>
          </div>
        )}

        {/* Stock Badge */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <span className="text-white text-lg font-bold">Agotado</span>
          </div>
        )}

        {isLowStock && isInStock && (
          <div className="absolute bottom-3 left-3 z-10">
            <div className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
              ¡Últimas {product.stock} unidades!
            </div>
          </div>
        )}

        {/* Image */}
        {!imageError ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            )}
            <img
              src={primaryImage}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
              <span className="text-6xl mb-2 block">📦</span>
              <span className="text-sm text-gray-500">Imagen no disponible</span>
            </div>
          </div>
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 px-4">
            
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!isInStock || isCartLoading}
              className={`
                flex-1 px-4 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-lg
                flex items-center justify-center gap-2
                ${isCartLoading 
                  ? 'bg-gray-400 text-white cursor-wait' 
                  : isInCart
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-900 hover:bg-blue-600 hover:text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isCartLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Agregando...</span>
                </>
              ) : isInCart ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>En carrito</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Agregar</span>
                </>
              )}
            </button>
            
            {/* Wishlist Button */}
            <button
              onClick={handleAddToWishlist}
              disabled={isWishlistLoading}
              className={`
                p-2.5 rounded-xl transition-all duration-300 shadow-lg
                ${isWishlistLoading
                  ? 'bg-gray-400 text-white cursor-wait'
                  : isInWishlist
                  ? 'bg-red-500 text-white'
                  : 'bg-white/90 backdrop-blur-sm hover:bg-red-500 hover:text-white'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isWishlistLoading ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        {product.brand && (
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">
            {product.brand}
          </span>
        )}

        {/* Name */}
        <h3 className="font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[3rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating && product.rating.average > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.round(product.rating.average)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {product.rating.average.toFixed(1)} ({product.rating.count})
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-end gap-2">
          <span className="text-2xl font-black text-gray-900">
            ${product.price.toLocaleString('es-CO')}
          </span>
          {product.comparePrice && product.comparePrice > product.price && (
            <span className="text-sm text-gray-500 line-through mb-1">
              ${product.comparePrice.toLocaleString('es-CO')}
            </span>
          )}
        </div>

        {/* Stock Info */}
        <div className="flex items-center gap-2 text-sm">
          {isInStock ? (
            <>
              <div className={`w-2 h-2 rounded-full ${isLowStock ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              <span className={`font-medium ${isLowStock ? 'text-orange-700' : 'text-green-700'}`}>
                {isLowStock ? `Solo ${product.stock} disponibles` : 'Disponible'}
              </span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-red-700 font-medium">Agotado</span>
            </>
          )}
        </div>

        {/* Status Indicators */}
        {(isInCart || isInWishlist) && (
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            {isInCart && (
              <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span className="font-semibold">En carrito</span>
              </div>
            )}
            {isInWishlist && (
              <div className="flex items-center gap-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded-full">
                <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">Favorito</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-300 rounded-2xl" />
    </div>
  );
};

export default ProductCard;