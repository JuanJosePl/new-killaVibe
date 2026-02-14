// src/modules/customer/components/products/detail/ProductDetailSkeleton.jsx

import React from 'react';

/**
 * @component ProductDetailSkeleton
 * @description Skeleton loader para la página de detalle del producto
 */
const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 pb-16 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-300 rounded" />
          <div className="h-4 w-4 bg-gray-300 rounded" />
          <div className="h-4 w-24 bg-gray-300 rounded" />
          <div className="h-4 w-4 bg-gray-300 rounded" />
          <div className="h-4 w-32 bg-gray-300 rounded" />
        </div>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Galería Skeleton */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <div className="aspect-square bg-gray-300 rounded-3xl" />
            
            {/* Thumbnails */}
            <div className="grid grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-300 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Info Skeleton */}
          <div className="space-y-6">
            {/* Categoría */}
            <div className="h-6 w-32 bg-gray-300 rounded-full" />
            
            {/* Título */}
            <div className="space-y-2">
              <div className="h-8 w-full bg-gray-300 rounded" />
              <div className="h-8 w-3/4 bg-gray-300 rounded" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="w-5 h-5 bg-gray-300 rounded" />
                ))}
              </div>
              <div className="h-4 w-24 bg-gray-300 rounded" />
            </div>

            {/* Precio */}
            <div className="space-y-2">
              <div className="h-10 w-40 bg-gray-300 rounded" />
              <div className="h-6 w-32 bg-gray-300 rounded" />
            </div>

            {/* Stock */}
            <div className="h-16 bg-gray-300 rounded-2xl" />

            {/* Cantidad */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-300 rounded" />
              <div className="h-12 w-40 bg-gray-300 rounded-2xl" />
            </div>

            {/* Botones */}
            <div className="space-y-3">
              <div className="h-14 bg-gray-300 rounded-2xl" />
              <div className="h-14 bg-gray-300 rounded-2xl" />
            </div>

            {/* Botones secundarios */}
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-300 rounded-2xl" />
              <div className="h-12 bg-gray-300 rounded-2xl" />
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-300 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="bg-white/60 rounded-3xl overflow-hidden">
          {/* Tab headers */}
          <div className="flex border-b border-gray-200">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex-1 h-14 bg-gray-300 m-2 rounded-xl" />
            ))}
          </div>
          
          {/* Tab content */}
          <div className="p-8 space-y-4">
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-5/6 bg-gray-300 rounded" />
            <div className="h-6 w-4/6 bg-gray-300 rounded" />
            <div className="h-6 w-full bg-gray-300 rounded" />
            <div className="h-6 w-3/4 bg-gray-300 rounded" />
          </div>
        </div>

        {/* Reviews Skeleton */}
        <div className="bg-white/60 rounded-3xl p-8">
          <div className="h-8 w-48 bg-gray-300 rounded mb-6" />
          
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border-b border-gray-200 py-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-32 bg-gray-300 rounded" />
                  <div className="h-3 w-24 bg-gray-300 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-300 rounded" />
                <div className="h-4 w-5/6 bg-gray-300 rounded" />
                <div className="h-4 w-4/6 bg-gray-300 rounded" />
              </div>
            </div>
          ))}
        </div>

        {/* Related Products Skeleton */}
        <div className="bg-white/60 rounded-3xl p-8">
          <div className="h-8 w-56 bg-gray-300 rounded mb-6" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-300 rounded-2xl" />
                <div className="h-4 w-full bg-gray-300 rounded" />
                <div className="h-4 w-3/4 bg-gray-300 rounded" />
                <div className="h-6 w-24 bg-gray-300 rounded" />
                <div className="h-10 bg-gray-300 rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;