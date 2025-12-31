// src/modules/wishlist/components/WishlistItem.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Eye } from 'lucide-react';
import {
  formatPrice,
  formatPriceChange,
  formatPriceChangePercentage,
  getPriceChangeMessage,
  getPriceChangeBadgeClass,
  formatAddedDate,
  canMoveToCart
} from '../utils/wishlistHelpers';

// ✅ INTEGRACIÓN: Hook para mover a carrito
import { useWishlistToCart } from '../hooks/useWishlistToCart';

/**
 * @component WishlistItem
 * @description Componente para mostrar un item individual de wishlist
 * ✅ CON INTEGRACIÓN DE CART
 */
const WishlistItem = ({
  item,
  onRemove,
  onMoveToCart, // Callback opcional (override)
  loading = false,
  disabled = false
}) => {
  // ✅ INTEGRACIÓN: Hook para mover al carrito
  const { moveToCart, loading: movingToCart } = useWishlistToCart();

  const { product } = item;

  if (!product) {
    return null;
  }

  const moveToCartStatus = canMoveToCart(item);
  const priceChangeMessage = getPriceChangeMessage(item);
  const priceChangeBadgeClass = getPriceChangeBadgeClass(item);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRemove = () => {
    if (onRemove && !loading && !disabled) {
      onRemove(product._id);
    }
  };

  const handleMoveToCart = async () => {
    if (loading || disabled || !moveToCartStatus.canMove) return;

    // Si hay callback personalizado, usarlo
    if (onMoveToCart) {
      onMoveToCart(product._id);
      return;
    }

    // Sino, usar el hook integrado
    await moveToCart(product, 1, false); // false = eliminar de wishlist
  };

  const isLoading = loading || movingToCart;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="flex flex-col sm:flex-row">
        {/* Imagen del producto */}
        <Link 
          to={`/productos/${product.slug}`}
          className="w-full sm:w-48 h-48 flex-shrink-0 bg-gray-100 dark:bg-gray-700 relative overflow-hidden group-hover:scale-105 transition-transform duration-300"
        >
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <Eye className="w-16 h-16" />
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <span className="text-white font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Ver producto
            </span>
          </div>
        </Link>

        {/* Información del producto */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <Link 
                to={`/productos/${product.slug}`}
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
              </Link>
              
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Badge de cambio de precio */}
                {item.priceChanged && priceChangeMessage && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priceChangeBadgeClass}`}>
                    {priceChangeMessage}
                  </span>
                )}

                {/* Badge de no disponible */}
                {!item.isAvailable && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                    No disponible
                  </span>
                )}

                {/* Badge de bajo stock */}
                {item.isAvailable && product.stock <= 5 && product.stock > 0 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                    Solo {product.stock} disponibles
                  </span>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPrice(product.price)}
              </p>
              
              {/* Precio anterior */}
              {item.priceWhenAdded && item.priceChanged && (
                <div className="mt-1">
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                    {formatPrice(item.priceWhenAdded)}
                  </p>
                  <p className={`text-sm font-medium ${item.priceDropped ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatPriceChange(item)} ({formatPriceChangePercentage(item)})
                  </p>
                </div>
              )}

              {/* Compare Price */}
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-through mt-1">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>
          </div>

          {/* Fecha agregado */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Agregado {formatAddedDate(item.addedAt)}
          </p>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleMoveToCart}
              disabled={isLoading || !moveToCartStatus.canMove}
              className={`
                flex-1 sm:flex-none px-6 py-3 rounded-xl font-semibold text-sm
                transition-all duration-300 flex items-center justify-center gap-2
                ${moveToCartStatus.canMove
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                }
              `}
              title={!moveToCartStatus.canMove ? moveToCartStatus.reason : 'Agregar al carrito'}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  <span>Agregar al carrito</span>
                </>
              )}
            </button>

            <button
              onClick={handleRemove}
              disabled={isLoading}
              className="px-6 py-3 rounded-xl font-semibold text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:text-red-300 dark:disabled:text-red-700 disabled:cursor-not-allowed transition-all duration-300 border-2 border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          </div>

          {/* Notificaciones activas */}
          {(item.notifyPriceChange || item.notifyAvailability) && (
            <div className="mt-4 flex gap-3 text-xs text-gray-600 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              {item.notifyPriceChange && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notificar cambio de precio
                </span>
              )}
              {item.notifyAvailability && (
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notificar disponibilidad
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;