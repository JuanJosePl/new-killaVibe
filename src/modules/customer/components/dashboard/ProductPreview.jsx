// src/modules/customer/components/dashboard/ProductPreview.jsx

import React from 'react';

/**
 * @component ProductPreview
 * @description Preview de producto mejorado con hover effects y diseño moderno
 *
 * @props {Object} product - Producto
 * @props {Function} onClick - Callback al hacer click
 * @props {boolean} showPrice - Mostrar precio
 */
const ProductPreview = ({ product, onClick, showPrice = true }) => {
  const imageUrl = product?.primaryImage?.url || product?.images?.[0]?.url;

  const getStockStatus = () => {
    if (!product.stock) return null;
    
    if (product.stock === 0) {
      return { text: 'Sin stock', color: 'bg-red-100 text-red-600', icon: '❌' };
    }
    if (product.stock < 10) {
      return { text: `¡Solo ${product.stock}!`, color: 'bg-yellow-100 text-yellow-600', icon: '⚠️' };
    }
    return { text: `${product.stock} disponibles`, color: 'bg-green-100 text-green-600', icon: '✓' };
  };

  const stockStatus = getStockStatus();

  return (
    <div
      onClick={onClick}
      className="group relative flex gap-3 p-3 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 rounded-xl border border-gray-100 hover:border-blue-200 cursor-pointer transition-all duration-300 hover:shadow-lg"
    >
      {/* Product Image with Overlay */}
      <div className="relative w-20 h-20 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
            />
            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 group-hover:scale-110 transition-transform">
            📦
          </div>
        )}

        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg animate-pulse">
            -{product.discount}%
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        {/* Name */}
        <div>
          <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
            {product.name}
          </p>

          {/* Rating (if available) */}
          {product.rating && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-xs font-semibold text-gray-700">
                {product.rating.average?.toFixed(1) || '0.0'}
              </span>
              <span className="text-xs text-gray-400">
                ({product.rating.count || 0})
              </span>
            </div>
          )}
        </div>

        {/* Price & Stock */}
        <div className="flex items-end justify-between gap-2 mt-1">
          {/* Price */}
          {showPrice && typeof product.price === 'number' && (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  ${product.price.toFixed(2)}
                </span>
              </div>

              {/* Original Price (if discount) */}
              {product.discount > 0 && product.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          )}

          {/* Stock Status */}
          {stockStatus && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stockStatus.color} whitespace-nowrap flex items-center gap-1`}>
              <span>{stockStatus.icon}</span>
              <span>{stockStatus.text}</span>
            </span>
          )}
        </div>
      </div>

      {/* Arrow Indicator */}
      <div className="flex-shrink-0 flex items-center">
        <svg 
          className="w-5 h-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-xl"></div>
    </div>
  );
};

export default ProductPreview;