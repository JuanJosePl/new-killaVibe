// src/modules/customer/components/products/detail/ProductInfo.jsx

import React from 'react';

/**
 * @component ProductInfo
 * @description Información básica del producto (título, marca, rating)
 * 
 * Props:
 * - product: Objeto producto completo
 * - discount: Porcentaje de descuento
 * - reviewStats: Estadísticas de reviews { average, total }
 * - onScrollToReviews: Función para scroll a sección de reviews
 */
const ProductInfo = ({ product, discount = 0, reviewStats, onScrollToReviews }) => {
  if (!product) return null;

  const averageRating = reviewStats?.average || 0;
  const totalReviews = reviewStats?.total || 0;

  return (
    <div className="space-y-4">
      {/* Categoría */}
      {product.category?.name && (
        <div className="flex items-center gap-2">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
            {product.category.name}
          </span>
          {product.brand && (
            <span className="text-gray-500 text-sm font-medium">
              por {product.brand}
            </span>
          )}
        </div>
      )}

      {/* Título */}
      <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
        {product.name}
      </h1>

      {/* SKU */}
      {product.sku && (
        <p className="text-sm text-gray-500 font-mono">
          SKU: <span className="font-semibold">{product.sku}</span>
        </p>
      )}

      {/* Rating y Reviews */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Estrellas */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, index) => {
            const filled = index < Math.floor(averageRating);
            const halfFilled = index === Math.floor(averageRating) && averageRating % 1 >= 0.5;
            
            return (
              <svg
                key={index}
                className={`w-5 h-5 ${
                  filled 
                    ? 'text-yellow-400' 
                    : halfFilled 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            );
          })}
        </div>

        {/* Promedio numérico */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            {averageRating.toFixed(1)}
          </span>
          <span className="text-gray-500 text-sm">
            ({totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'})
          </span>
        </div>

        {/* Link a reviews */}
        {totalReviews > 0 && (
          <button
            onClick={onScrollToReviews}
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold underline transition-colors"
          >
            Ver todas las reseñas
          </button>
        )}
      </div>

      {/* Descripción corta */}
      {product.shortDescription && (
        <p className="text-gray-700 text-base leading-relaxed border-l-4 border-blue-600 pl-4 py-2 bg-blue-50/50 rounded-r-xl">
          {product.shortDescription}
        </p>
      )}

      {/* Badges adicionales */}
      <div className="flex flex-wrap gap-2">
        {product.isFeatured && (
          <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Producto Destacado
          </span>
        )}
        
        {product.isNew && (
          <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            ✨ Nuevo
          </span>
        )}
        
        {discount > 20 && (
          <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            🔥 Oferta Limitada
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductInfo;