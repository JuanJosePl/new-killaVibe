import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  formatProductCount,
  getCategoryUrl,
  getCategoryImage,
} from "../utils/categoryHelpers";

/**
 * @component CategoryCard
 * @description Card de categoría con slider automático de productos
 *
 * CARACTERÍSTICAS:
 * - Slider automático de imágenes de productos (si hay)
 * - Fallback a imagen de categoría
 * - Indicadores de navegación
 * - Badge de destacado
 * - Hover effects mejorados
 * - productCount formateado
 *
 * @param {Object} category - Categoría con datos completos
 * @param {Array} categoryProducts - Productos de la categoría para slider
 * @param {boolean} showProductCount - Mostrar conteo de productos
 * @param {boolean} featured - Modo destacado (doble ancho)
 * @param {Function} onClick - Handler de click (opcional)
 */
const CategoryCard = ({
  category,
  categoryProducts = [],
  showProductCount = true,
  featured = false,
  onClick,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Imagen base de categoría (fallback)
  const categoryBaseImage = useMemo(() => {
    return getCategoryImage(category, featured ? "hero" : "thumbnail");
  }, [category, featured]);

  // 2. Slider automático (solo si hay productos con imágenes)
  useEffect(() => {
    if (categoryProducts && categoryProducts.length > 1) {
      const timer = setInterval(() => {
        setCurrentImageIndex((prev) =>
          prev === categoryProducts.length - 1 ? 0 : prev + 1
        );
      }, 3000); // Cambio cada 3 segundos

      return () => clearInterval(timer);
    }
  }, [categoryProducts]);

  if (!category) return null;

  const url = getCategoryUrl(category);

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(category);
    }
  };

  // 3. Lógica de selección de imagen
  const hasProducts = categoryProducts && categoryProducts.length > 0;

  // Imagen del producto actual en slider
  const productImage = hasProducts
    ? categoryProducts[currentImageIndex]?.images?.[0]?.url ||
      categoryProducts[currentImageIndex]?.image
    : null;

  // PRIORIDAD: Imagen de producto > Imagen de categoría > Placeholder
  const displayImage = productImage || categoryBaseImage;

  return (
    <Link
      to={url}
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-[420px] w-full ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      {/* Contenedor de Imagen */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <img
          src={displayImage}
          alt={category.name}
          className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            // Fallback a placeholder si imagen falla
            if (
              e.target.src !==
              window.location.origin + "/placeholder-category.jpg"
            ) {
              e.target.src = "/placeholder-category.jpg";
            }
          }}
        />

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-300" />

        {/* Indicadores del Slider (puntos) */}
        {hasProducts && categoryProducts.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
            {categoryProducts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === currentImageIndex ? "bg-white w-6" : "bg-white/40 w-2"
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge de Destacado */}
        {category.featured && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded shadow-sm">
            DESTACADA
          </div>
        )}
      </div>

      {/* Contenido de la Card */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
            {category.name}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {category.description ||
              `Explora nuestra selección de ${category.name}`}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            VER COLECCIÓN <span className="text-lg">→</span>
          </span>

          {showProductCount && (
            <span className="text-xs font-medium text-gray-400">
              {formatProductCount(category.productCount)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard;
