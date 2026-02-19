import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

// ✅ MIGRADO: Hook del dominio Products — cache-first, no fetch manual
import {
  useProductsRepository,
  useFeaturedProducts,
} from "@/modules/products";

import { ProductCard } from "./ProductCard";

/**
 * @component FeaturedProducts
 *
 * CAMBIOS DE MIGRACIÓN:
 * - productsAPI.getFeaturedProducts() + useState/useEffect manual
 *   → useFeaturedProducts(repo, limit)  [cache-first, module-level dedup]
 * - useProductCart / useProductWishlist eliminados
 *   → ProductCard los maneja internamente vía integration bridges
 * - Error de retry corregido: llamaba a fetchFeaturedProducts() que no existía en scope
 *   → ahora usa refresh() del hook
 */
export function FeaturedProducts() {
  const repo = useProductsRepository();
  const { products, isLoading, error, refresh } = useFeaturedProducts(repo, 8);

  // ────────────────────────────
  // LOADING
  // ────────────────────────────
  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando productos destacados...</p>
          </div>
        </div>
      </section>
    );
  }

  // ────────────────────────────
  // ERROR
  // ────────────────────────────
  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar productos destacados
            </h3>
            <p className="text-gray-600 mb-6">{error?.message ?? "Error desconocido"}</p>
            <button
              onClick={refresh}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Reintentar
            </button>
          </div>
        </div>
      </section>
    );
  }

  // ────────────────────────────
  // VACÍO
  // ────────────────────────────
  if (!products || products.length === 0) {
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

  // ────────────────────────────
  // RENDER
  // ────────────────────────────
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

        {/* Grid — ProductCard maneja cart y wishlist internamente */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product._id}
              className="animate-slide-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard product={product} showWishlistButton />
            </div>
          ))}
        </div>

        {/* Mobile — Ver todos */}
        <div className="text-center mt-12 sm:hidden">
          <Link to="/productos?featured=true">
            <button className="flex items-center justify-center gap-2 w-full px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-white transition-colors font-semibold text-gray-700">
              Ver Todos los Productos
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}