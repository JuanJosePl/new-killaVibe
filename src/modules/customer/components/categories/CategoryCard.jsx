// src/modules/customer/components/categories/CategoryCard.jsx

import React from 'react';

/**
 * @component CategoryCard
 * @description Card de categoría reutilizable
 */
const CategoryCard = ({ category, onClick, featured = false, size = 'md' }) => {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300
        ${featured
          ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
          : 'bg-white hover:shadow-xl hover:scale-102'
        }
        border-2 border-transparent hover:border-purple-400
        ${sizeClasses[size]}
      `}
    >
      {/* Thumbnail Image */}
      {category.images?.thumbnail && (
        <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-purple-100 to-pink-100">
          <img
            src={category.images.thumbnail}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}

      {/* Icon Fallback */}
      {!category.images?.thumbnail && (
        <div
          className={`text-6xl mb-4 transform group-hover:scale-110 transition-transform duration-300 ${
            featured ? 'drop-shadow-lg' : ''
          }`}
        >
          {category.icon || '📦'}
        </div>
      )}

      {/* Content */}
      <div>
        <h3
          className={`text-2xl font-bold mb-2 line-clamp-2 ${
            featured ? 'text-white' : 'text-gray-900'
          }`}
        >
          {category.name}
        </h3>
        
        {category.description && (
          <p
            className={`text-sm line-clamp-2 mb-3 ${
              featured ? 'text-white/90' : 'text-gray-600'
            }`}
          >
            {category.description}
          </p>
        )}
      </div>

      {/* Product Count Badge */}
      {category.productCount !== undefined && (
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${
            featured
              ? 'bg-white/20 text-white'
              : 'bg-purple-100 text-purple-700'
          }`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          {category.productCount} productos
        </div>
      )}

      {/* Arrow Icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <svg
          className={`w-6 h-6 ${featured ? 'text-white' : 'text-purple-600'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-pink-400/0 to-purple-400/0 group-hover:from-purple-400/10 group-hover:via-pink-400/10 group-hover:to-purple-400/10 transition-all duration-500" />
    </div>
  );
};

export default CategoryCard;