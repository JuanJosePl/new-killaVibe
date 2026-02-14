// src/modules/customer/components/wishlist/WishlistAlerts.jsx

import React, { useState } from 'react';

/**
 * @component WishlistAlerts
 * @description Alertas premium de cambios de precio y disponibilidad
 * 
 * Features:
 * - Diseño moderno con glassmorphism
 * - Animaciones de entrada
 * - Iconos animados
 * - Badges de contador
 * - Colores temáticos (rojo para descuentos, amarillo para stock)
 * - Botones de acción opcionales
 * - Collapse/expand animation
 * - Responsive perfecto
 */
const WishlistAlerts = ({ priceChangesCount = 0, unavailableCount = 0 }) => {
  const [isPriceAlertExpanded, setIsPriceAlertExpanded] = useState(true);
  const [isStockAlertExpanded, setIsStockAlertExpanded] = useState(true);

  if (priceChangesCount === 0 && unavailableCount === 0) return null;

  return (
    <div className="space-y-4 animate-fade-in-down">
      {/* Price Changes Alert */}
      {priceChangesCount > 0 && (
        <div className="group relative bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border-2 border-red-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-red-500 rounded-full filter blur-3xl"></div>
          </div>

          {/* Header */}
          <div 
            className="relative p-5 cursor-pointer"
            onClick={() => setIsPriceAlertExpanded(!isPriceAlertExpanded)}
          >
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <div className="flex-shrink-0 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-transform">
                  <svg className="w-8 h-8 text-white animate-bounce" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                </div>
                {/* Pulse Ring */}
                <div className="absolute inset-0 rounded-2xl bg-red-500 animate-pulse-glow opacity-50"></div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-red-900">
                    ¡Hay productos con descuento!
                  </h3>
                  <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
                    {priceChangesCount}
                  </span>
                </div>
                <p className="text-red-700 font-medium">
                  {priceChangesCount} producto{priceChangesCount > 1 ? 's han' : ' ha'} bajado de precio
                </p>
                <p className="text-red-600 text-sm mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  Aprovecha antes de que suban nuevamente
                </p>
              </div>

              {/* Expand Icon */}
              <button className="flex-shrink-0 text-red-600 hover:text-red-700 transition-colors">
                <svg 
                  className={`w-6 h-6 transform transition-transform ${isPriceAlertExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expandable Content */}
            <div className={`overflow-hidden transition-all duration-500 ${
              isPriceAlertExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm text-red-700 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Productos
                </button>
                <button className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2.5 rounded-xl font-bold hover:from-red-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Agregar Todos al Carrito
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-pink-500 to-orange-500"></div>
        </div>
      )}

      {/* Unavailable Items Alert */}
      {unavailableCount > 0 && (
        <div className="group relative bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 border-2 border-yellow-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-yellow-500 rounded-full filter blur-3xl"></div>
          </div>

          {/* Header */}
          <div 
            className="relative p-5 cursor-pointer"
            onClick={() => setIsStockAlertExpanded(!isStockAlertExpanded)}
          >
            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <div className="flex-shrink-0 relative">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:-rotate-6 transition-transform">
                  <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-yellow-900">
                    Productos sin stock
                  </h3>
                  <span className="bg-yellow-600 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    {unavailableCount}
                  </span>
                </div>
                <p className="text-yellow-700 font-medium">
                  {unavailableCount} producto{unavailableCount > 1 ? 's' : ''} no está{unavailableCount > 1 ? 'n' : ''} disponible{unavailableCount > 1 ? 's' : ''}
                </p>
                <p className="text-yellow-600 text-sm mt-1 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                  </svg>
                  Activaremos alertas cuando vuelvan
                </p>
              </div>

              {/* Expand Icon */}
              <button className="flex-shrink-0 text-yellow-600 hover:text-yellow-700 transition-colors">
                <svg 
                  className={`w-6 h-6 transform transition-transform ${isStockAlertExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Expandable Content */}
            <div className={`overflow-hidden transition-all duration-500 ${
              isStockAlertExpanded ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'
            }`}>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm text-yellow-700 px-4 py-2.5 rounded-xl font-bold hover:bg-yellow-100 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Productos
                </button>
                <button className="flex items-center gap-2 bg-white bg-opacity-80 backdrop-blur-sm text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-all shadow-sm hover:shadow-md">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Eliminar Agotados
                </button>
              </div>
            </div>
          </div>

          {/* Decorative Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500"></div>
        </div>
      )}
    </div>
  );
};

export default WishlistAlerts;