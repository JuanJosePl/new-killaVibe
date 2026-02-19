import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

/**
 * @component EmptyCart
 * @description Estado vacío del carrito.
 * UI idéntica al original — no tenía lógica de negocio que migrar.
 */
const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="bg-gray-100 p-6 rounded-full mb-4">
        <ShoppingBag size={48} className="text-gray-400" />
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Tu carrito está vacío
      </h2>

      <p className="text-gray-600 mb-8 max-w-sm">
        ¡Parece que aún no has añadido nada! Explora nuestros productos y encuentra algo increíble para ti.
      </p>

      <Link
        to="/productos"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
      >
        Explorar Productos
      </Link>
    </div>
  );
};

export default EmptyCart;