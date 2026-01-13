// src/modules/customer/components/cart/EmptyCart.jsx

import React from 'react';

/**
 * @component EmptyCart
 * @description Estado vacío premium del carrito con diseño acogedor
 * 
 * Features:
 * - Animación de carrito vacío
 * - CTA destacado con gradiente
 * - Sugerencias de categorías
 * - Beneficios visuales
 * - Diseño responsive
 * - Micro-interacciones
 */
const EmptyCart = ({ onContinueShopping }) => {
  const suggestions = [
    {
      icon: '🔥',
      title: 'Ofertas',
      description: 'Los mejores precios',
      color: 'from-red-100 to-orange-100',
      hoverColor: 'group-hover:from-red-200 group-hover:to-orange-200',
    },
    {
      icon: '⭐',
      title: 'Destacados',
      description: 'Los más vendidos',
      color: 'from-yellow-100 to-amber-100',
      hoverColor: 'group-hover:from-yellow-200 group-hover:to-amber-200',
    },
    {
      icon: '🆕',
      title: 'Novedades',
      description: 'Recién llegados',
      color: 'from-green-100 to-emerald-100',
      hoverColor: 'group-hover:from-green-200 group-hover:to-emerald-200',
    },
  ];

  const benefits = [
    {
      icon: '🚚',
      title: 'Envío Gratis',
      description: 'En compras mayores a $50',
    },
    {
      icon: '🔒',
      title: 'Pago Seguro',
      description: 'Protegemos tus datos',
    },
    {
      icon: '↩️',
      title: 'Devoluciones',
      description: '30 días sin preguntas',
    },
    {
      icon: '💳',
      title: 'Múltiples Pagos',
      description: 'Tarjetas y más',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center overflow-hidden relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-40 h-40 bg-blue-500 rounded-full filter blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-500 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Animated Cart Icon */}
          <div className="relative inline-block mb-8">
            <div className="relative">
              {/* Cart */}
              <div className="text-9xl sm:text-[12rem] animate-bounce-subtle filter drop-shadow-2xl">
                🛒
              </div>
              
              {/* Empty Badge */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-2xl animate-pulse">
                0
              </div>

              {/* Floating Elements */}
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-1/4 left-0 text-4xl animate-float opacity-30">💨</div>
                <div className="absolute top-1/2 right-0 text-4xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>💨</div>
              </div>
            </div>
          </div>

          {/* Message */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Tu carrito está vacío
          </h2>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            ¡Es hora de llenarlo con productos increíbles! Descubre nuestras ofertas y novedades.
          </p>

          {/* CTA Button */}
          <button
            onClick={onContinueShopping}
            className="group relative inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-10 py-5 rounded-2xl font-bold text-lg sm:text-xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
            
            <span className="relative z-10">Explorar Productos</span>
            
            <svg className="relative z-10 w-6 h-6 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Suggestions */}
          <div className="mt-16 pt-10 border-t border-gray-200">
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">
              Categorías Populares
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={onContinueShopping}
                  className={`group relative bg-gradient-to-br ${suggestion.color} ${suggestion.hoverColor} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1 border-2 border-transparent hover:border-gray-200`}
                >
                  <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform">
                    {suggestion.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {suggestion.description}
                  </p>
                  
                  {/* Arrow */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all">
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-4xl mb-3 transform hover:scale-110 transition-transform">
              {benefit.icon}
            </div>
            <h4 className="font-bold text-gray-900 mb-1 text-sm sm:text-base">
              {benefit.title}
            </h4>
            <p className="text-xs text-gray-600">
              {benefit.description}
            </p>
          </div>
        ))}
      </div>

      {/* Fun Stats */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">
          ¿Sabías que...?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-4xl font-bold mb-2">10K+</div>
            <div className="text-sm opacity-90">Productos disponibles</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50K+</div>
            <div className="text-sm opacity-90">Clientes felices</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">4.9⭐</div>
            <div className="text-sm opacity-90">Calificación promedio</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyCart;