// src/modules/customer/components/products/detail/ProductActions.jsx

import React from 'react';

/**
 * @component ProductActions
 * @description Acciones del producto (cantidad, agregar carrito, wishlist)
 * 
 * Props:
 * - product: Objeto producto
 * - quantity: Cantidad seleccionada
 * - setQuantity: Función para actualizar cantidad
 * - isInStock: Boolean disponibilidad
 * - onAddToCart: Función agregar al carrito
 * - onAddToWishlist: Función toggle wishlist
 * - onBuyNow: Función comprar ahora
 * - isAddingToCart: Loading state carrito
 * - isInWishlist: Boolean si está en wishlist
 * - isTogglingWishlist: Loading state wishlist
 */
const ProductActions = ({
  product,
  quantity,
  setQuantity,
  isInStock,
  onAddToCart,
  onAddToWishlist,
  onBuyNow,
  isAddingToCart = false,
  isInWishlist = false,
  isTogglingWishlist = false,
}) => {
  const maxQuantity = Math.min(product?.stock || 0, 10);
  const canAddToCart = isInStock && quantity > 0;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) setQuantity(quantity + 1);
  };

  return (
    <div className="space-y-4">
      {/* SELECTOR DE CANTIDAD */}
      {isInStock && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700">Cantidad</label>
          <div className="flex items-center gap-4">
            {/* Counter */}
            <div className="flex items-center bg-gray-100 rounded-2xl border-2 border-gray-300 overflow-hidden">
              <button
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="px-5 py-3 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-gray-700"
              >
                −
              </button>
              <span className="px-6 py-3 font-black text-lg text-gray-900 min-w-[3rem] text-center">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= maxQuantity}
                className="px-5 py-3 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold text-gray-700"
              >
                +
              </button>
            </div>

            {/* Stock disponible */}
            <span className="text-sm text-gray-600 font-medium">
              Máximo: {maxQuantity} unidades
            </span>
          </div>
        </div>
      )}

      {/* BOTONES PRINCIPALES */}
      <div className="space-y-3">
        {/* Agregar al carrito */}
        <button
          onClick={onAddToCart}
          disabled={!canAddToCart || isAddingToCart}
          className={`
            w-full py-4 rounded-2xl font-black text-lg transition-all transform flex items-center justify-center gap-3
            ${canAddToCart
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-2xl hover:scale-105 active:scale-95'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
            ${isAddingToCart ? 'opacity-75 cursor-wait' : ''}
          `}
        >
          {isAddingToCart ? (
            <>
              <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Agregando...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {canAddToCart ? 'Agregar al carrito' : 'Sin stock'}
            </>
          )}
        </button>

        {/* Comprar ahora */}
        {canAddToCart && (
          <button
            onClick={onBuyNow}
            disabled={isAddingToCart}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-black text-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Comprar ahora
          </button>
        )}
      </div>

      {/* BOTONES SECUNDARIOS */}
      <div className="grid grid-cols-2 gap-3">
        {/* Wishlist */}
        <button
          onClick={onAddToWishlist}
          disabled={isTogglingWishlist}
          className={`
            py-3 rounded-2xl font-bold transition-all border-2 flex items-center justify-center gap-2
            ${isInWishlist
              ? 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100'
              : 'bg-white border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-700'
            }
            ${isTogglingWishlist ? 'opacity-75 cursor-wait' : ''}
          `}
        >
          {isTogglingWishlist ? (
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg
              className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
              fill={isInWishlist ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          {isInWishlist ? 'Guardado' : 'Guardar'}
        </button>

        {/* Compartir */}
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: product?.name,
                url: window.location.href,
              });
            } else {
              navigator.clipboard.writeText(window.location.href);
              alert('¡Link copiado al portapapeles!');
            }
          }}
          className="py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-2xl font-bold hover:border-blue-500 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Compartir
        </button>
      </div>
    </div>
  );
};

export default ProductActions;