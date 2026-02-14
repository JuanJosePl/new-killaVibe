// src/modules/customer/components/products/ProductGrid.jsx

import React from "react";
import ProductCard from "./ProductCard";

const ProductGrid = ({
  products = [],
  isLoading = false,
  onAddToCart,
  onAddToWishlist,
  // ✅ NUEVOS PROPS
  getIsInCart,
  getIsInWishlist,
  getIsCartLoading,
  getIsWishlistLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative text-8xl">🔍</div>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          No encontramos productos
        </h3>
        <p className="text-gray-600 text-center max-w-md mb-8">
          Intenta ajustar los filtros o realiza una nueva búsqueda para
          encontrar lo que necesitas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.slug}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          // ✅ PASAR ESTADOS AL CARD
          isInCart={getIsInCart?.(product._id)}
          isInWishlist={getIsInWishlist?.(product._id)}
          isCartLoading={getIsCartLoading?.(product._id)}
          isWishlistLoading={getIsWishlistLoading?.(product._id)}
        />
      ))}
    </div>
  );
};

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
    <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-shimmer" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded w-full" />
        <div className="h-4 bg-gray-300 rounded w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="h-3 bg-gray-200 rounded w-12" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-6 bg-gray-300 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/3" />
    </div>
  </div>
);

export default ProductGrid;
