import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

/**
 * @component ProductBreadcrumb
 * @description Breadcrumb de navegación usando breadcrumb[] del backend
 *
 * ✅ USA:
 * - breadcrumb[] desde getSEOContext() del producto
 * - {name, slug, url} de cada nivel
 */
export function ProductBreadcrumb({
  breadcrumb = [],
  current = null,
  className = "",
}) {
  // ✅ Validación
  if (!breadcrumb || breadcrumb.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center space-x-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home Link */}
      <Link
        to="/"
        className="flex items-center text-gray-600 hover:text-primary transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="ml-1 hidden sm:inline">Inicio</span>
      </Link>

      {/* Breadcrumb Items */}
      {breadcrumb.map((crumb, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <Link
            to={crumb.url}
            className="text-gray-600 hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-none"
            title={crumb.name}
          >
            {crumb.name}
          </Link>
        </div>
      ))}

      {/* Current Page (si se proporciona) */}
      {current && (
        <>
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span
            className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none"
            title={current}
          >
            {current}
          </span>
        </>
      )}
    </nav>
  );
}

/**
 * @component CategoryBreadcrumb
 * @description Breadcrumb para páginas de categoría
 */
export function CategoryBreadcrumb({ category }) {
  if (!category) return null;

  const breadcrumb = category.breadcrumb || [];

  return <ProductBreadcrumb breadcrumb={breadcrumb} current={category.name} />;
}
