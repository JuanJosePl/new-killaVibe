// src/modules/customer/components/categories/CategoryTree.jsx

import React from 'react';

/**
 * @component CategoryTree
 * @description Árbol jerárquico de categorías recursivo
 */
const CategoryTree = ({ tree, onSelectCategory, level = 0 }) => {
  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No hay categorías disponibles</p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-1 ${
        level > 0 ? 'ml-6 pl-4 border-l-2 border-gray-200' : ''
      }`}
    >
      {tree.map((category) => (
        <div key={category._id}>
          {/* Category Button */}
          <button
            onClick={() => onSelectCategory(category.slug)}
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {/* Icon or Thumbnail */}
              {category.images?.thumbnail ? (
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                  <img
                    src={category.images.thumbnail}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <span className="text-2xl group-hover:scale-125 transition-transform">
                  {category.icon || '📁'}
                </span>
              )}

              {/* Name */}
              <span className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                {category.name}
              </span>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Product Count */}
              {category.productCount !== undefined && (
                <span className="text-sm text-gray-500 font-medium">
                  {category.productCount} productos
                </span>
              )}

              {/* Arrow */}
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors"
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
          </button>

          {/* Recursive Children */}
          {category.children && category.children.length > 0 && (
            <CategoryTree
              tree={category.children}
              onSelectCategory={onSelectCategory}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryTree;
