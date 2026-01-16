// src/modules/customer/components/products/detail/ProductDetailError.jsx

import React from 'react';

/**
 * @component ProductDetailError
 * @description Componente de error para cuando falla la carga del producto
 * 
 * Props:
 * - error: Mensaje de error (opcional)
 * - onRetry: Función para reintentar carga
 * - navigate: Función de navegación de React Router
 */
const ProductDetailError = ({ error, onRetry, navigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl border-2 border-red-200 shadow-2xl p-12 text-center">
          
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Título */}
          <h1 className="text-3xl font-black text-gray-900 mb-3">
            ¡Oops! Producto no encontrado
          </h1>

          {/* Descripción */}
          <p className="text-gray-700 text-lg mb-2">
            No pudimos cargar la información de este producto.
          </p>

          {/* Mensaje de error técnico */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 mt-4">
              <p className="text-sm text-red-800 font-mono">
                {error}
              </p>
            </div>
          )}

          {/* Posibles causas */}
          <div className="text-left bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Posibles causas:
            </h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>El producto ya no está disponible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>La URL puede estar incorrecta</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>Puede haber un problema temporal con el servidor</span>
              </li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Reintentar */}
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar
              </button>
            )}

            {/* Volver a productos */}
            <button
              onClick={() => navigate('/customer/products')}
              className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-black text-lg hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Ver todos los productos
            </button>
          </div>

          {/* Link adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-3">
              ¿Necesitas ayuda adicional?
            </p>
            <button
              onClick={() => navigate('/customer/contact')}
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline"
            >
              Contacta con soporte
            </button>
          </div>
        </div>

        {/* Sugerencias de productos */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/customer')}
            className="text-gray-600 hover:text-gray-900 font-semibold text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailError;