import { useRelatedProducts } from "../hooks/useProductDetails";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

/**
 * @component RelatedProducts
 * @description Carrusel de productos relacionados usando endpoint real
 *
 * ✅ USA:
 * - useRelatedProducts(productId, limit)
 * - Endpoint: GET /products/related/:productId
 * - Retorna ProductCardDTO[]
 */
export function RelatedProducts({ productId, limit = 8, className = "" }) {
  const { products, loading, error } = useRelatedProducts(productId, limit);
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // ✅ Loading State
  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos Relacionados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ Error State (silencioso - no bloquea la página)
  if (error) {
    console.error("Error loading related products:", error);
    return null;
  }

  // ✅ Empty State (no hay relacionados)
  if (!products || products.length === 0) {
    return null;
  }

  // Scroll handlers
  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);

      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const updateArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <div className={`py-12 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Productos Relacionados
        </h2>
        <div className="flex space-x-2">
          {showLeftArrow && (
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll izquierda"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Scroll derecha"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      {/* ✅ Carrusel Horizontal */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          onScroll={updateArrows}
          onLoad={updateArrows}
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 w-64 sm:w-72">
              <ProductCard product={product} showWishlistButton={true} />
            </div>
          ))}
        </div>

        {/* Gradient Overlays */}
        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Mobile: Grid alternativo */}
      <div className="grid grid-cols-2 gap-4 mt-6 sm:hidden">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showWishlistButton={true}
          />
        ))}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
