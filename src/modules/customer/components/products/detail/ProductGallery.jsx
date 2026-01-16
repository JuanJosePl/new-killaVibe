// src/modules/customer/components/products/detail/ProductGallery.jsx

import React, { useState } from 'react';

/**
 * @component ProductGallery
 * @description Galería de imágenes interactiva con thumbnails
 * 
 * Props:
 * - images: Array de objetos { url, alt }
 * - productName: Nombre del producto (fallback alt)
 * - discount: Porcentaje de descuento (opcional)
 * - isFeatured: Si el producto es destacado
 */
const ProductGallery = ({ images = [], productName, discount = 0, isFeatured = false }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  // Fallback a imagen placeholder si no hay imágenes
  const displayImages = images.length > 0 
    ? images 
    : [{ url: 'https://via.placeholder.com/600x600?text=Sin+Imagen', alt: productName }];

  const currentImage = displayImages[selectedIndex];

  return (
    <div className="space-y-4">
      {/* IMAGEN PRINCIPAL */}
      <div className="relative bg-white rounded-3xl border-2 border-gray-200 shadow-xl overflow-hidden group">
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {discount > 0 && (
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg">
              -{discount}% OFF
            </span>
          )}
          {isFeatured && (
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-black shadow-lg flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Destacado
            </span>
          )}
        </div>

        {/* Imagen */}
        <div 
          className={`relative aspect-square cursor-zoom-in transition-transform duration-300 ${
            isZoomed ? 'scale-150' : 'scale-100'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentImage.url}
            alt={currentImage.alt || productName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Zoom Indicator */}
        {!isZoomed && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
            Click para ampliar
          </div>
        )}
      </div>

      {/* THUMBNAILS */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-5 gap-3">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`
                relative aspect-square rounded-2xl border-2 overflow-hidden transition-all
                ${selectedIndex === index 
                  ? 'border-blue-600 ring-4 ring-blue-100 scale-110 shadow-lg' 
                  : 'border-gray-300 hover:border-gray-400 hover:scale-105'
                }
              `}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} - Vista ${index + 1}`}
                className="w-full h-full object-cover"
              />
              
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-blue-600/20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {displayImages.length > 1 && (
        <div className="text-center">
          <span className="text-sm text-gray-600 font-medium">
            {selectedIndex + 1} / {displayImages.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductGallery;