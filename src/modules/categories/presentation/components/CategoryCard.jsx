/**
 * @component CategoryCard
 * @description Card de categoría reutilizable.
 *
 * Recibe datos ya normalizados (CategoryEntity).
 * No contiene lógica de dominio ni transformaciones.
 * Slider de imágenes de productos (si se proporcionan).
 *
 * @param {import('../../domain/category.entity.js').CategoryEntity} category
 * @param {Array}    [categoryProducts=[]] - Productos para slider de imágenes
 * @param {boolean}  [showProductCount=true]
 * @param {boolean}  [featured=false]      - Doble ancho en grid
 * @param {Function} [onClick]             - Override de navegación
 */

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatProductCount } from '../../utils/categoryHelpers.js';

const PLACEHOLDER = '/images/category-placeholder.jpg';

const CategoryCard = ({
  category,
  categoryProducts = [],
  showProductCount  = true,
  featured          = false,
  onClick,
}) => {
  const [slideIndex, setSlideIndex] = useState(0);

  // Imagen base de la categoría
  const baseImage = useMemo(
    () => category?.getImage(featured ? 'hero' : 'thumbnail') ?? PLACEHOLDER,
    [category, featured]
  );

  // Slider automático cada 3 s (sólo si hay >1 producto con imagen)
  useEffect(() => {
    if (categoryProducts.length <= 1) return;

    const timer = setInterval(
      () => setSlideIndex((prev) =>
        prev === categoryProducts.length - 1 ? 0 : prev + 1
      ),
      3000
    );

    return () => clearInterval(timer);
  }, [categoryProducts.length]);

  if (!category) return null;

  // Imagen a mostrar: producto (slider) > base de categoría > placeholder
  const productImg  = categoryProducts[slideIndex]?.images?.[0]?.url
                   ?? categoryProducts[slideIndex]?.image
                   ?? null;
  const displayImg  = productImg ?? baseImage;
  const hasSlider   = categoryProducts.length > 1;

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <Link
      to={category.url}
      onClick={handleClick}
      className={`group relative flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-[420px] w-full ${
        featured ? 'md:col-span-2' : ''
      }`}
    >
      {/* ── Imagen ─────────────────────────────────────────────────── */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <img
          src={displayImg}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
          onError={(e) => {
            if (e.target.src !== window.location.origin + PLACEHOLDER) {
              e.target.src = PLACEHOLDER;
            }
          }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/20 transition-all duration-300" />

        {/* Indicadores de slider */}
        {hasSlider && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 z-10">
            {categoryProducts.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  idx === slideIndex ? 'bg-white w-6' : 'bg-white/40 w-2'
                }`}
              />
            ))}
          </div>
        )}

        {/* Badge destacado */}
        {category.featured && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded shadow-sm">
            DESTACADA
          </div>
        )}
      </div>

      {/* ── Contenido ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">
            {category.name}
          </h3>
          <p className="mt-2 text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {category.description || `Explora nuestra selección de ${category.name}`}
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