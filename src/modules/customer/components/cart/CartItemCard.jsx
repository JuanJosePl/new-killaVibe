// src/modules/customer/components/cart/CartItemCard.jsx

import React, { useState } from 'react';

/**
 * @component CartItemCard
 * @description Card premium de item del carrito con diseño acogedor
 * 
 * Features:
 * - Diseño glassmorphism moderno
 * - Animaciones suaves en hover
 * - Controles intuitivos de cantidad
 * - Badges de descuento destacados
 * - Imagen con overlay y zoom
 * - Estados de loading granulares
 * - Responsive perfecto
 * - Atributos visuales (talla, color)
 */
const CartItemCard = ({ item, onUpdateQuantity, onRemove, isLoading }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const product = item.product;
  const imageUrl = product.primaryImage?.url || product.images?.[0]?.url;
  const hasDiscount = item.originalPrice > item.price;
  const savings = hasDiscount ? item.originalPrice - item.price : 0;
  const discountPercent = hasDiscount ? Math.round((savings / item.originalPrice) * 100) : 0;

  return (
    <div 
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-sm font-medium text-gray-600">Actualizando...</p>
          </div>
        </div>
      )}

      {/* Discount Badge - Floating */}
      {hasDiscount && (
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg animate-pulse-glow flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            -{discountPercent}%
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-6">
        {/* Product Image - Left Side */}
        <div className="relative flex-shrink-0">
          <div className="w-full sm:w-32 h-40 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow">
            {imageUrl ? (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
                  </div>
                )}
                <img
                  src={imageUrl}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  } ${isHovered ? 'scale-110' : 'scale-100'}`}
                  onLoad={() => setImageLoaded(true)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                📦
              </div>
            )}
          </div>

          {/* Quick View Badge */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="bg-white text-gray-700 p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Product Info - Center */}
        <div className="flex-1 min-w-0">
          {/* Product Name */}
          <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          
          {/* Attributes */}
          {item.attributes && Object.keys(item.attributes).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {Object.entries(item.attributes).map(([key, value]) => (
                <span 
                  key={key} 
                  className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold"
                >
                  <span className="capitalize">{key}:</span>
                  <span className="font-bold">{value}</span>
                </span>
              ))}
            </div>
          )}

          {/* Price Section */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                ${item.price.toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 font-medium">c/u</span>
            </div>
            
            {hasDiscount && (
              <div className="flex flex-col gap-1">
                <span className="text-sm text-gray-500 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  Ahorras ${savings.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Stock Status */}
          {product.stock < 10 && product.stock > 0 && (
            <div className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              ¡Solo {product.stock} disponibles!
            </div>
          )}

          {/* Quantity Controls - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-xl px-2 py-1">
              <button
                onClick={() => onUpdateQuantity(item.quantity - 1)}
                disabled={isLoading || item.quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg"
              >
                −
              </button>
              
              <span className="w-12 text-center font-bold text-xl text-gray-900">
                {item.quantity}
              </span>
              
              <button
                onClick={() => onUpdateQuantity(item.quantity + 1)}
                disabled={isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 font-bold text-lg"
              >
                +
              </button>
            </div>

            <button
              onClick={onRemove}
              disabled={isLoading}
              className="group/delete flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-xl hover:bg-red-50 transition-all duration-300 disabled:opacity-40"
            >
              <svg className="w-5 h-5 transform group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden lg:inline">Eliminar</span>
            </button>
          </div>
        </div>

        {/* Item Total - Right Side (Desktop) */}
        <div className="hidden sm:flex flex-col items-end justify-between">
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1 font-medium">Total</p>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
            {hasDiscount && (
              <p className="text-sm text-gray-500 line-through mt-1">
                ${(item.originalPrice * item.quantity).toFixed(2)}
              </p>
            )}
          </div>

          {/* Save for Later */}
          <button className="group/save flex items-center gap-2 text-gray-600 hover:text-pink-600 text-sm font-medium transition-colors">
            <svg className="w-5 h-5 transform group-hover/save:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Guardar
          </button>
        </div>
      </div>

      {/* Mobile Controls */}
      <div className="sm:hidden border-t border-gray-100 p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 bg-white border-2 border-gray-200 rounded-xl px-2 py-1 shadow-sm">
            <button
              onClick={() => onUpdateQuantity(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            >
              −
            </button>
            
            <span className="w-10 text-center font-bold text-lg text-gray-900">
              {item.quantity}
            </span>
            
            <button
              onClick={() => onUpdateQuantity(item.quantity + 1)}
              disabled={isLoading}
              className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-bold"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Total</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onRemove}
            disabled={isLoading}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Eliminar
          </button>

          <button className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-pink-200 text-pink-600 hover:bg-pink-50 py-2.5 rounded-xl font-semibold transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Guardar
          </button>
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-blue-200 transition-all duration-500 pointer-events-none"></div>
    </div>
  );
};

export default CartItemCard;