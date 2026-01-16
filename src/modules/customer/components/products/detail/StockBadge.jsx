// src/modules/customer/components/products/detail/StockBadge.jsx

import React from 'react';

/**
 * @component StockBadge
 * @description Badge dinámico de disponibilidad de stock
 * 
 * Props:
 * - stock: Cantidad en stock
 * - isInStock: Boolean si está disponible
 * - isLowStock: Boolean si está bajo en stock
 * - allowBackorder: Boolean si acepta pedidos pendientes
 */
const StockBadge = ({ stock = 0, isInStock = false, isLowStock = false, allowBackorder = false }) => {
  // Sin stock
  if (!isInStock && !allowBackorder) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-xl">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div>
            <p className="text-red-900 font-bold">Sin stock disponible</p>
            <p className="text-red-700 text-sm">Este producto no está disponible actualmente</p>
          </div>
        </div>
      </div>
    );
  }

  // Backorder permitido
  if (!isInStock && allowBackorder) {
    return (
      <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-orange-900 font-bold">Pedido anticipado</p>
            <p className="text-orange-700 text-sm">Disponible para pre-orden. Envío en 7-10 días</p>
          </div>
        </div>
      </div>
    );
  }

  // Stock bajo
  if (isLowStock) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-xl animate-pulse">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-yellow-900 font-bold">¡Últimas {stock} unidades!</p>
            <p className="text-yellow-700 text-sm">Stock limitado - Ordena ahora antes de que se agote</p>
          </div>
        </div>
      </div>
    );
  }

  // Stock normal
  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-xl">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-green-900 font-bold">Disponible en stock</p>
          <p className="text-green-700 text-sm">
            {stock > 50 ? 'Más de 50' : stock} unidades disponibles - Envío inmediato
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockBadge;