import { Link } from 'react-router-dom';
import {
  getCategoryImage,
  formatProductCount,
  getCategoryUrl,
} from '../utils/categoryHelpers';

/**
 * @component CategoryCard
 * @description Card visual para mostrar categoría en grid
 * 
 * @param {Object} category - Objeto categoría
 * @param {boolean} showProductCount - Mostrar conteo de productos
 * @param {boolean} featured - Estilo para destacadas
 * @param {string} size - 'sm'|'md'|'lg'
 * @param {Function} onClick - Callback al hacer clic
 */
const CategoryCard = ({
  category,
  showProductCount = true,
  featured = false,
  size = 'md',
  onClick,
}) => {
  if (!category) return null;

  const image = getCategoryImage(category, featured ? 'hero' : 'thumbnail');
  const url = getCategoryUrl(category);

  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(category);
    }
  };

  return (
    <Link
      to={url}
      onClick={handleClick}
      className={`
        group relative overflow-hidden rounded-lg bg-white shadow-md 
        transition-all duration-300 hover:shadow-xl hover:-translate-y-1
        ${featured ? 'col-span-2' : ''}
      `}
    >
      {/* Image Container */}
      <div className={`relative ${sizeClasses[size]} overflow-hidden bg-gray-200`}>
        <img
          src={image}
          alt={category.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured badge */}
        {category.featured && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
            DESTACADA
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {category.name}
        </h3>

        {category.description && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}

        {showProductCount && (
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {formatProductCount(category.productCount)}
            </span>
            
            <svg
              className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CategoryCard;