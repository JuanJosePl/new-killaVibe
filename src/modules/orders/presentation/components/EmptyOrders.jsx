// modules/orders/presentation/components/EmptyOrders.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @component EmptyOrders
 * @description Estado vacío cuando el usuario no tiene órdenes.
 */
export function EmptyOrders() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
      <div className="relative inline-block mb-6">
        <div className="text-8xl animate-bounce">📦</div>
        <div className="absolute -top-2 -right-2 text-4xl animate-ping opacity-50">✨</div>
      </div>

      <h2 className="text-3xl font-bold text-gray-900 mb-3">Aún no tienes órdenes</h2>
      <p className="text-gray-500 text-lg mb-8">
        ¡Comienza tu primera compra y descubre productos increíbles!
      </p>

      <button
        onClick={() => navigate('/')}
        className="group relative bg-gradient-to-r from-green-600 to-blue-600 text-white
          px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl
          transform hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          Explorar Productos
          <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-green-700
          transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
      </button>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-sm text-gray-400 mb-6 font-medium">¿Por qué comprar con nosotros?</p>
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: '🚚', title: 'Envío Rápido',    desc: 'Entregas en 24-48h' },
            { icon: '🔒', title: 'Compra Segura',   desc: 'Pago 100% protegido' },
            { icon: '↩️', title: 'Devoluciones',    desc: '30 días para devolver' },
          ].map(b => (
            <div key={b.title} className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200">
              <div className="text-3xl mb-2">{b.icon}</div>
              <h3 className="font-semibold text-gray-900 text-sm mb-1">{b.title}</h3>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default EmptyOrders;
