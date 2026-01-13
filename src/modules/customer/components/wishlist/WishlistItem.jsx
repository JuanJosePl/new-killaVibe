// src/modules/customer/components/wishlist/WishlistItem.jsx

import React, { useState } from 'react';

/**
 * @component WishlistItem
 * @description Card premium de item de wishlist con diseño romántico y acogedor
 * 
 * Features:
 * - Diseño card moderno con sombras suaves
 * - Animaciones en hover con efecto lift
 * - Badge de descuento pulsante
 * - Indicadores visuales de disponibilidad
 * - Imagen con zoom y overlay
 * - Botones de acción con iconos
 * - Estados de loading granulares
 * - Responsive perfecto
 * - Tema rosa/rojo acogedor
 */
const WishlistItem = ({ item, onRemove, onMoveToCart, isLoading }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const product = item.product;
  const imageUrl = product.primaryImage?.url || product.images?.[0]?.url;
  
  const priceDropped = item.priceDropped;
  const priceChanged = item.priceChanged;
  const isAvailable = item.isAvailable;
  
  const savings = priceChanged && item.priceWhenAdded > product.price 
    ? item.priceWhenAdded - product.price 
    : 0;
  const discountPercent = savings > 0 
    ? Math.round((savings / item.priceWhenAdded) * 100) 
    : 0;

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 transform hover:-translate-y-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-30 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl animate-pulse">❤️</span>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600">Procesando...</p>
          </div>
        </div>
      )}

      {/* Product Image Section */}
      <div className="relative h-64 bg-gradient-to-br from-pink-50 to-red-50 overflow-hidden">
        {imageUrl ? (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-pink-200 border-t-pink-600"></div>
              </div>
            )}
            <img
              src={imageUrl}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 ${
                imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              } ${isHovered ? 'scale-110' : 'scale-100'}`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Gradient Overlay on Hover */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent transition-opacity duration-500 ${
              isHovered ? 'opacity-60' : 'opacity-0'
            }`}></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-7xl">
            📦
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          {/* Discount Badge */}
          {priceDropped && (
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl animate-pulse-glow flex items-center gap-1.5">
              <svg className="w-4 h-4 animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
              </svg>
              ¡Precio Bajo! -{discountPercent}%
            </div>
          )}

          {/* Stock Badge */}
          {!isAvailable && (
            <div className="bg-gray-900 bg-opacity-90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
              Agotado
            </div>
          )}
        </div>

        {/* Remove Button - Heart */}
        <button
          onClick={onRemove}
          disabled={isLoading}
          className="absolute top-3 right-3 bg-white text-red-600 hover:bg-red-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg disabled:opacity-50 transition-all duration-300 z-10 hover:scale-110 active:scale-95"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Quick Actions on Hover */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 transform transition-all duration-500 ${
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}>
          <button
            onClick={onMoveToCart}
            disabled={isLoading || !isAvailable}
            className="w-full bg-white bg-opacity-95 backdrop-blur-sm text-blue-600 py-3 rounded-xl font-bold shadow-xl hover:bg-blue-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {isAvailable ? 'Agregar al Carrito' : 'No Disponible'}
          </button>
        </div>
      </div>

      {/* Product Info Section */}
      <div className="p-5">
        {/* Product Name */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {product.name}
        </h3>

        {/* Price Section */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            ${product.price?.toFixed(2)}
          </span>
          
          {priceChanged && item.priceWhenAdded > product.price && (
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 line-through">
                ${item.priceWhenAdded.toFixed(2)}
              </span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                -{discountPercent}% OFF
              </span>
            </div>
          )}
        </div>

        {/* Savings Badge */}
        {savings > 0 && (
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
            <div className="bg-green-500 text-white rounded-full p-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-green-900">¡Ahorro especial!</p>
              <p className="text-sm font-bold text-green-700">${savings.toFixed(2)} menos</p>
            </div>
          </div>
        )}

        {/* Action Button - Mobile Visible */}
        <button
          onClick={onMoveToCart}
          disabled={isLoading || !isAvailable}
          className={`w-full py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
            isAvailable
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } disabled:opacity-50`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {isAvailable ? 'Agregar al Carrito' : 'Sin Stock'}
        </button>

        {/* Added Date */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Guardado {new Date(item.addedAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}</span>
          </div>
          
          {item.notifyPriceChange && (
            <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-xs font-medium">Alertas ON</span>
            </div>
          )}
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-pink-200 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

export default WishlistItem;