import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ✅ MIGRADO: useRelatedProducts viene de hooks/useProductStock ahora
import {
  useProductsRepository,
  useRelatedProducts,
} from "@/modules/products";

import { ProductCard } from "./ProductCard";

/**
 * @component RelatedProducts
 *
 * CAMBIOS DE MIGRACIÓN:
 * - import { useRelatedProducts } from "../hooks/useProductDetails"
 *   → import { useRelatedProducts } from "@/modules/products"
 *   (el hook está en hooks/useProductStock.js pero re-exportado desde index.js)
 * - Ahora requiere repo inyectado (useProductsRepository)
 * - El hook carga automáticamente cuando productId cambia (tiene useEffect interno)
 *   pero necesitamos asegurarnos de que se llame a load()
 */
export function RelatedProducts({ productId, limit = 8, className = "" }) {
  const repo = useProductsRepository();
  const { products, isLoading: loading, error, reload } = useRelatedProducts(repo, productId, limit);

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Cargar al montar o cuando cambia productId
  useEffect(() => {
    if (productId) reload();
  }, [productId, reload]);

  // Loading
  if (loading) {
    return (
      <div className={`py-12 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Productos Relacionados
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-2xl h-64 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error silencioso — no bloquea la página
  if (error) {
    console.error("[RelatedProducts] Error:", error);
    return null;
  }

  // Vacío
  if (!products || products.length === 0) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollTo({
        left:
          scrollContainerRef.current.scrollLeft +
          (direction === "left" ? -scrollAmount : scrollAmount),
        behavior: "smooth",
      });
    }
  };

  const updateArrows = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
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
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          onScroll={updateArrows}
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 w-64 sm:w-72">
              <ProductCard product={product} showWishlistButton />
            </div>
          ))}
        </div>

        {showLeftArrow && (
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none" />
        )}
        {showRightArrow && (
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none" />
        )}
      </div>

      {/* Mobile grid */}
      <div className="grid grid-cols-2 gap-4 mt-6 sm:hidden">
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            showWishlistButton
          />
        ))}
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}