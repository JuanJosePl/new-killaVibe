import { useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X, Package  } from "lucide-react";

/**
 * @component ProductGallery
 * @description Galería de imágenes profesional con zoom
 *
 * ✅ USA:
 * - images[] array completo
 * - images[].url, images[].altText, images[].order, images[].isPrimary
 * - primaryImage como imagen principal
 */
export function ProductGallery({ images = [], primaryImage, name }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // ✅ Validar y ordenar imágenes
  const sortedImages =
    images.length > 0
      ? [...images].sort((a, b) => (a.order || 0) - (b.order || 0))
      : primaryImage
      ? [
          {
            url: primaryImage.url || primaryImage,
            altText: name,
            isPrimary: true,
          },
        ]
      : [];

  if (sortedImages.length === 0) {
    return (
      <div className="bg-gray-100 rounded-2xl aspect-square flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Package className="h-16 w-16 mx-auto mb-2" />
          <p className="text-sm">Sin imágenes disponibles</p>
        </div>
      </div>
    );
  }

  const currentImage = sortedImages[selectedImageIndex];
  const imageUrl = currentImage?.url || primaryImage?.url || primaryImage;
  const altText = currentImage?.altText || name || "Imagen del producto";

  const handlePrevious = () => {
    setImageLoaded(false);
    setSelectedImageIndex((prev) =>
      prev === 0 ? sortedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setImageLoaded(false);
    setSelectedImageIndex((prev) =>
      prev === sortedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleThumbnailClick = (index) => {
    setImageLoaded(false);
    setSelectedImageIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden group">
        <div className="relative aspect-square">
          {/* Loading State */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-shimmer flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary"></div>
            </div>
          )}

          {/* Main Image */}
          <img
            src={imageUrl}
            alt={altText}
            className={`w-full h-full object-contain transition-all duration-500 ${
              imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
            }`}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Zoom Button */}
          <button
            onClick={() => setIsZoomed(true)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>

          {/* Navigation Arrows (si hay más de 1 imagen) */}
          {sortedImages.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 shadow-lg"
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
            </>
          )}

          {/* Image Counter */}
          {sortedImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded-full text-white text-sm font-medium">
              {selectedImageIndex + 1} / {sortedImages.length}
            </div>
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {sortedImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sortedImages.map((image, index) => {
            const thumbUrl = image?.url || image;
            const thumbAlt = image?.altText || `${name} - ${index + 1}`;

            return (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                  selectedImageIndex === index
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={thumbUrl}
                  alt={thumbAlt}
                  className="w-full h-full object-contain bg-white"
                  loading="lazy"
                />
                {image?.isPrimary && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ✅ Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <div className="relative max-w-6xl max-h-[90vh] w-full h-full">
            <img
              src={imageUrl}
              alt={altText}
              className="w-full h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation in Zoom */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium">
                  {selectedImageIndex + 1} / {sortedImages.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
