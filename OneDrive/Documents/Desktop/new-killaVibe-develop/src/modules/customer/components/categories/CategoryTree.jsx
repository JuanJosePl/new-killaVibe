// src/modules/customer/components/categories/CategoryTree.jsx

import React, { useState } from "react";

/**
 * @component CategoryTree
 * @description Árbol jerárquico de categorías con diseño premium KillaVibe
 */
const CategoryTree = ({ tree, onSelectCategory, level = 0 }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (categoryId) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (!tree || tree.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gray-300 rounded-full blur-3xl opacity-30" />
          <div className="relative text-8xl">📂</div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          No hay categorías disponibles
        </h3>
        <p className="text-gray-600">
          Las categorías aparecerán aquí cuando estén disponibles
        </p>
      </div>
    );
  }

  return (
    <div
      className={`space-y-2 ${
        level > 0
          ? "ml-6 pl-6 border-l-2 border-gradient-to-b from-indigo-200 to-purple-200"
          : ""
      }`}
    >
      {tree.map((category) => {
        const hasChildren = category.children && category.children.length > 0;
        const isExpanded = expandedNodes.has(category._id);

        return (
          <div key={category._id} className="group">
            {/* Category Node */}
            <div
              className={`
                relative flex items-center justify-between
                p-4 rounded-xl transition-all duration-300
                ${
                  level === 0
                    ? "bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100"
                    : "bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                }
                border-2 border-transparent hover:border-indigo-300
                cursor-pointer shadow-sm hover:shadow-xl
                transform hover:scale-[1.02]
              `}
            >
              {/* Left Side: Icon/Image + Name + Expand Button */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Expand/Collapse Button (if has children) */}
                {hasChildren && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(category._id);
                    }}
                    className="flex-shrink-0 p-2 rounded-lg bg-white shadow-md hover:shadow-lg hover:bg-indigo-600 hover:text-white transition-all duration-300 group/btn"
                  >
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isExpanded ? "rotate-90" : ""
                      }`}
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
                  </button>
                )}

                {/* Icon or Thumbnail */}
                <div className="flex-shrink-0">
                  {category.images?.thumbnail ? (
                    <div className="relative group/img">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-xl blur opacity-0 group-hover/img:opacity-50 transition-opacity duration-300" />
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 shadow-lg ring-2 ring-white">
                        <img
                          src={category.images.thumbnail}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-14 h-14 flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl shadow-lg">
                      <span className="text-3xl transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                        {category.icon || "📁"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Name */}
                <button
                  onClick={() => onSelectCategory(category.slug)}
                  className="flex-1 text-left min-w-0"
                >
                  <h3
                    className={`
                    font-bold text-gray-900 group-hover:text-indigo-600 
                    transition-colors duration-300 truncate
                    ${level === 0 ? "text-lg" : "text-base"}
                  `}
                  >
                    {category.name}
                  </h3>
                  {category.description && level === 0 && (
                    <p className="text-sm text-gray-600 truncate mt-1">
                      {category.description}
                    </p>
                  )}
                </button>
              </div>

              {/* Right Side: Product Count + Arrow */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Product Count Badge */}
                {category.productCount !== undefined && (
                  <div className="hidden sm:flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-md group-hover:shadow-lg transition-shadow duration-300">
                    <svg
                      className="w-4 h-4 text-indigo-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                    <span className="text-sm font-bold text-gray-700">
                      {category.productCount}
                    </span>
                  </div>
                )}

                {/* View Category Arrow */}
                <button
                  onClick={() => onSelectCategory(category.slug)}
                  className="p-2 rounded-lg bg-indigo-600 text-white opacity-0 group-hover:opacity-100 hover:bg-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110"
                >
                  <svg
                    className="w-5 h-5"
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
                </button>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 rounded-xl" />
            </div>

            {/* Recursive Children with Slide Animation */}
            {hasChildren && (
              <div
                className={`
                  overflow-hidden transition-all duration-500 ease-in-out
                  ${
                    isExpanded
                      ? "max-h-[10000px] opacity-100 mt-2"
                      : "max-h-0 opacity-0"
                  }
                `}
              >
                <CategoryTree
                  tree={category.children}
                  onSelectCategory={onSelectCategory}
                  level={level + 1}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryTree;
