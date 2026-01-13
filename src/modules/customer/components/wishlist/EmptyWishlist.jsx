// src/modules/customer/components/wishlist/EmptyWishlist.jsx

import React from 'react';

/**
 * @component EmptyWishlist
 * @description Estado vacío de wishlist con diseño atractivo y CTA
 * 
 * @props {Function} onContinueShopping - Callback para continuar comprando
 */
const EmptyWishlist = ({ onContinueShopping }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
      {/* Animated Icon */}
      <div className="relative inline-block mb-6">
        <div className="text-8xl animate-float">❤️</div>
        <div className="absolute -top-2 -right-2 bg-gray-300 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
          0
        </div>
      </div>

      {/* Message */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Tu lista de deseos está vacía
      </h2>
      <p className="text-gray-600 text-lg mb-8">
        ¡Guarda tus productos favoritos para comprarlos después!
      </p>

      {/* CTA Button */}
      <button
        onClick={onContinueShopping}
        className="group relative bg-gradient-to-r from-pink-600 to-red-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Explorar Productos
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-pink-700 to-red-700 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
      </button>

      {/* Suggestions */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-500 mb-4 font-medium">
          Sugerencias para ti:
        </p>
        <div className="grid grid-cols-3 gap-4">
          <SuggestionCard
            icon="🔥"
            title="Ofertas"
          />
          <SuggestionCard
            icon="⭐"
            title="Destacados"
          />
          <SuggestionCard
            icon="🆕"
            title="Novedades"
          />
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-3xl mb-2">🔔</div>
          <p className="text-xs text-gray-600">Notificaciones de precio</p>
        </div>
        <div>
          <div className="text-3xl mb-2">💰</div>
          <p className="text-xs text-gray-600">Ahorra dinero</p>
        </div>
        <div>
          <div className="text-3xl mb-2">🚀</div>
          <p className="text-xs text-gray-600">Compra rápido</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Card de sugerencia
 */
const SuggestionCard = ({ icon, title }) => (
  <div className="group bg-gray-50 hover:bg-pink-50 rounded-xl p-4 transition-all duration-300 border-2 border-transparent hover:border-pink-200 cursor-pointer">
    <div className="text-3xl mb-2 transform group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <p className="text-sm font-medium text-gray-700 group-hover:text-pink-700">
      {title}
    </p>
  </div>
);

export default EmptyWishlist;