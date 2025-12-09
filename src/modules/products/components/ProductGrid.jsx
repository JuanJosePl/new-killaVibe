import { ProductCard } from './ProductCard';

/**
 * ProductGrid - Grid responsivo de productos
 * Integrado con el backend de KillaVibes
 * 
 * @param {Array} products - Array de productos del backend
 * @param {boolean} loading - Estado de carga
 * @param {string} viewMode - 'grid' o 'list'
 * @param {Function} onAddToCart - Callback para agregar al carrito
 * @param {Function} onToggleWishlist - Callback para toggle wishlist
 * @param {Function} isInWishlist - Función para verificar si está en wishlist
 */
export function ProductGrid({
  products = [],
  loading = false,
  viewMode = 'grid',
  onAddToCart,
  onToggleWishlist,
  isInWishlist = () => false,
  className = '',
}) {
  // LOADING STATE
  if (loading) {
    return (
      <div className={`${viewMode === 'grid' 
        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
        : 'space-y-6'} ${className}`}
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl h-64 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded-xl"></div>
          </div>
        ))}
      </div>
    );
  }

  // EMPTY STATE
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-8xl mb-6">🔍</div>
        <h3 className="text-2xl font-semibold text-gray-900 mb-4">
          No se encontraron productos
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          No hay productos que coincidan con los filtros aplicados.
          Intenta ajustar tus criterios de búsqueda.
        </p>
      </div>
    );
  }

  // PRODUCTS GRID
  return (
    <div className={`${viewMode === 'grid' 
      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
      : 'space-y-6'} ${className}`}
    >
      {products.map((product, index) => (
        <div
          key={product._id}
          className="animate-slide-in-up"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <ProductCard
            product={product}
            showWishlistButton={true}
            onAddToCart={onAddToCart}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={isInWishlist(product._id)}
            className={viewMode === 'list' ? 'flex' : ''}
          />
        </div>
      ))}
    </div>
  );
}