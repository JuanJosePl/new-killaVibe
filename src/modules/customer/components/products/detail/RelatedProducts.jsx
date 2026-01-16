// src/modules/customer/components/products/detail/RelatedProducts.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @component RelatedProducts
 * @description Grid de productos relacionados
 * 
 * Props:
 * - products: Array de productos relacionados
 * - onAddToCart: Función para agregar al carrito
 * - onAddToWishlist: Función para agregar a wishlist
 */
const RelatedProducts = ({ products = [], onAddToCart, onAddToWishlist }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-xl p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">Productos relacionados</h2>
          <p className="text-gray-600 font-medium">También te podrían interesar</p>
        </div>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <RelatedProductCard
            key={product._id}
            product={product}
            onAddToCart={() => onAddToCart(product._id)}
            onAddToWishlist={() => onAddToWishlist(product._id)}
            onView={() => navigate(`/customer/products/${product.slug}`)}
          />
        ))}
      </div>
    </div>
  );
};

// Card individual de producto relacionado
const RelatedProductCard = ({ product, onAddToCart, onAddToWishlist, onView }) => {
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const isInStock = product.stock > 0 || product.allowBackorder;
  const mainImage = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=Sin+Imagen';

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden group">
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden cursor-pointer" onClick={onView}>
        <img
          src={mainImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        
        {/* Badge de descuento */}
        {discount > 0 && (
          <span className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
            -{discount}%
          </span>
        )}

        {/* Botón wishlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToWishlist();
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
        >
          <svg className="w-5 h-5 text-gray-600 hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      {/* Información */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <h3
          onClick={onView}
          className="font-bold text-gray-900 text-sm line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
        >
          {product.name}
        </h3>

        {/* Precio */}
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-black text-gray-900">
            ${product.price.toFixed(2)}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-500 line-through">
              ${product.comparePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock */}
        <div className="flex items-center gap-2 text-xs">
          {isInStock ? (
            <>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-green-700 font-semibold">En stock</span>
            </>
          ) : (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full" />
              <span className="text-red-700 font-semibold">Sin stock</span>
            </>
          )}
        </div>

        {/* Botón agregar */}
        <button
          onClick={onAddToCart}
          disabled={!isInStock}
          className={`
            w-full py-2 rounded-xl font-bold text-sm transition-all
            ${isInStock
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isInStock ? 'Agregar al carrito' : 'Sin stock'}
        </button>
      </div>
    </div>
  );
};

export default RelatedProducts;