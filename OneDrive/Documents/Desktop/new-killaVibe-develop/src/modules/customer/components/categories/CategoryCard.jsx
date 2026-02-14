// src/modules/customer/components/categories/CategoryCard.jsx

import React, { useState } from "react";

/**
 * @component CategoryCard
 * @description Card premium de categoría con diseño KillaVibe
 */
const CategoryCard = ({ category, onClick, featured = false, size = "md" }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500
        ${
          featured
            ? "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:shadow-purple-500/50"
            : "bg-white hover:shadow-2xl"
        }
        border-2 ${
          featured
            ? "border-white/30"
            : "border-gray-200 hover:border-indigo-400"
        }
        hover:scale-105 transform
        ${sizeClasses[size]}
      `}
    >
      {/* Animated Background Gradient */}
      {featured && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 animate-gradient-x" />
        </div>
      )}

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* Thumbnail Image */}
        {category.images?.thumbnail && !imageError ? (
          <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg">
            {!imageLoaded && (
              <div className="w-full h-full animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
            )}
            <img
              src={category.images.thumbnail}
              alt={category.name}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              className={`
                w-full h-full object-cover transition-all duration-700
                group-hover:scale-125 group-hover:rotate-3
                ${imageLoaded ? "opacity-100" : "opacity-0"}
              `}
            />
          </div>
        ) : (
          // Icon Fallback with Animation
          <div
            className={`
            w-full aspect-square rounded-xl mb-4 flex items-center justify-center
            ${
              featured
                ? "bg-white/20 backdrop-blur-sm"
                : "bg-gradient-to-br from-indigo-100 to-purple-100"
            }
            shadow-lg
          `}
          >
            <div
              className={`
              text-7xl transform transition-all duration-500
              group-hover:scale-125 group-hover:rotate-12
              ${featured ? "drop-shadow-2xl filter" : ""}
            `}
            >
              {category.icon || "📦"}
            </div>
          </div>
        )}

        {/* Category Name */}
        <h3
          className={`
          font-black mb-2 line-clamp-2 leading-tight
          transition-all duration-300
          ${
            featured
              ? "text-white drop-shadow-lg"
              : "text-gray-900 group-hover:text-indigo-600"
          }
          ${textSizes[size]}
        `}
        >
          {category.name}
        </h3>

        {/* Description */}
        {category.description && (
          <p
            className={`
            text-sm line-clamp-2 mb-3 leading-relaxed
            transition-colors duration-300
            ${
              featured
                ? "text-white/90"
                : "text-gray-600 group-hover:text-gray-700"
            }
          `}
          >
            {category.description}
          </p>
        )}

        {/* Product Count Badge */}
        {category.productCount !== undefined && (
          <div
            className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold
            transition-all duration-300 shadow-md
            ${
              featured
                ? "bg-white/30 backdrop-blur-md text-white border border-white/30 group-hover:bg-white/40"
                : "bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white"
            }
          `}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>
            <span>{category.productCount} productos</span>
          </div>
        )}

        {/* Featured Badge */}
        {category.featured && !featured && (
          <div className="absolute top-3 right-3">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Destacada
            </div>
          </div>
        )}
      </div>

      {/* Arrow Icon - Appears on Hover */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
        <div
          className={`
          p-2 rounded-full shadow-lg
          ${featured ? "bg-white/30 backdrop-blur-md" : "bg-indigo-600"}
        `}
        >
          <svg
            className={`w-5 h-5 ${featured ? "text-white" : "text-white"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Hover Glow Effect */}
      {!featured && (
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500 rounded-2xl" />
      )}

      {/* Shimmer Effect on Hover */}
      <div
        className={`
        absolute inset-0 -translate-x-full group-hover:translate-x-full
        transition-transform duration-1000 ease-in-out
        bg-gradient-to-r ${
          featured
            ? "from-transparent via-white/20 to-transparent"
            : "from-transparent via-indigo-200/30 to-transparent"
        }
      `}
      />
    </div>
  );
};

export default CategoryCard;
