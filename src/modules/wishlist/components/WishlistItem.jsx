import React from 'react';
import {
  formatPrice,
  formatPriceChange,
  formatPriceChangePercentage,
  getPriceChangeMessage,
  getPriceChangeBadgeClass,
  formatAddedDate,
  canMoveToCart
} from '../utils/wishlistHelpers';

/**
 * @component WishlistItem
 * @description Componente para mostrar un item individual de wishlist
 * 
 * @param {Object} item - Item de wishlist
 * @param {Function} onRemove - Callback para eliminar
 * @param {Function} onMoveToCart - Callback para mover a carrito
 * @param {boolean} loading - Estado de carga
 * @param {boolean} disabled - Deshabilitar acciones
 */
const WishlistItem = ({
  item,
  onRemove,
  onMoveToCart,
  loading = false,
  disabled = false
}) => {
  const { product } = item;

  if (!product) {
    return null;
  }

  const moveToCartStatus = canMoveToCart(item);
  const priceChangeMessage = getPriceChangeMessage(item);
  const priceChangeBadgeClass = getPriceChangeBadgeClass(item);

  const handleRemove = () => {
    if (onRemove && !loading && !disabled) {
      onRemove(product._id);
    }
  };

  const handleMoveToCart = () => {
    if (onMoveToCart && !loading && !disabled && moveToCartStatus.canMove) {
      onMoveToCart(product._id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col sm:flex-row">
        {/* Imagen del producto */}
        <div className="w-full sm:w-48 h-48 flex-shrink-0 bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="flex-1 p-4 sm:p-6">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {product.name}
              </h3>
              
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
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    No disponible
                  </span>
                )}

                {/* Badge de bajo stock */}
                {item.isAvailable && product.stock <= 5 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                    Solo {product.stock} disponibles
                  </span>
                )}
              </div>
            </div>

            {/* Precio */}
            <div className="text-right ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </p>
              
              {/* Precio anterior */}
              {item.priceWhenAdded && item.priceChanged && (
                <div className="mt-1">
                  <p className="text-sm text-gray-500 line-through">
                    {formatPrice(item.priceWhenAdded)}
                  </p>
                  <p className={`text-sm font-medium ${item.priceDropped ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPriceChange(item)} ({formatPriceChangePercentage(item)})
                  </p>
                </div>
              )}

              {/* Compare Price */}
              {product.comparePrice && product.comparePrice > product.price && (
                <p className="text-sm text-gray-500 line-through mt-1">
                  {formatPrice(product.comparePrice)}
                </p>
              )}
            </div>
          </div>

          {/* Fecha agregado */}
          <p className="text-sm text-gray-500 mb-4">
            Agregado {formatAddedDate(item.addedAt)}
          </p>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleMoveToCart}
              disabled={loading || disabled || !moveToCartStatus.canMove}
              className={`
                flex-1 sm:flex-none px-4 py-2 rounded-lg font-medium text-sm
                transition-colors
                ${moveToCartStatus.canMove
                  ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              title={!moveToCartStatus.canMove ? moveToCartStatus.reason : 'Agregar al carrito'}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando...
                </span>
              ) : (
                'Agregar al carrito'
              )}
            </button>

            <button
              onClick={handleRemove}
              disabled={loading || disabled}
              className="px-4 py-2 rounded-lg font-medium text-sm text-red-600 hover:bg-red-50 disabled:text-red-300 disabled:cursor-not-allowed transition-colors border border-red-200"
            >
              Eliminar
            </button>
          </div>

          {/* Notificaciones activas */}
          {(item.notifyPriceChange || item.notifyAvailability) && (
            <div className="mt-3 flex gap-2 text-xs text-gray-600">
              {item.notifyPriceChange && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Notificar cambio de precio
                </span>
              )}
              {item.notifyAvailability && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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