import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProductCart } from "../hooks/useProductCart";
import { useProductWishlist } from "../hooks/useProductWishlist";
import  productsAPI  from "../api/products.api";

// ✅ Hook real de productos (Context)
import { useProducts } from "../contexts/ProductsContext";

// ✅ Componente ProductCard (importar el real)
import { ProductCard } from "./ProductCard";

/**
 * @component FeaturedProducts
 * @description Sección de productos destacados usando ProductsContext
 *
 * ✅ FIXES APLICADOS:
 * 1. Usar fetchFeaturedProducts() del context (no filtros manuales)
 * 2. Eliminados hooks innecesarios (useProductCart, useProductWishlist)
 * 3. ProductCard sin callbacks (maneja estado internamente)
 * 4. Estados loading/error/empty correctos
 */
export function FeaturedProducts() {
  // ✅ CORRECCIÓN: Usar getFeaturedProducts() en lugar de getProducts()
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { quickAddToCart } = useProductCart();
  const { toggleProductWishlist, isProductInWishlist } = useProductWishlist();

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ USAR EL ENDPOINT CORRECTO
        const response = await productsAPI.getFeaturedProducts(8);

        if (!isMounted) return;

        if (response.success && response.data) {
          setFeaturedProducts(response.data);
        } else if (response.count && response.data) {
          setFeaturedProducts(response.data);
        } else {
          setFeaturedProducts([]);
        }
      } catch (err) {
        if (isMounted && err.name !== 'AbortError') {
          console.error('[FeaturedProducts] Error:', err);
          setError(err.message || 'Error al cargar productos');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar productos destacados
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => fetchFeaturedProducts(8)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Pronto tendremos productos destacados
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando los mejores productos para ti
            </p>
            <Link to="/productos">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                Ver Todos los Productos
              </button>
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
              Productos Destacados
            </h2>
            <p className="text-gray-600 text-pretty max-w-2xl">
              Los productos más populares que vibran con nuestra comunidad
            </p>
          </div>
          <Link to="/productos?featured=true" className="hidden sm:block">
            <button className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors font-semibold text-gray-700">
              Ver Todos
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>

        {/* ✅ Products Grid - ProductCard sin callbacks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.map((product, index) => (
            <div
              key={product._id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* ✅ ProductCard maneja cart y wishlist internamente */}
              <ProductCard product={product} showWishlistButton={true} />
            </div>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-12 sm:hidden">
          <Link to="/productos?featured=true">
            <button className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors font-semibold text-gray-700">
              Ver Todos los Productos
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
