import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

// ✅ MIGRADO: Hook del módulo Products — reemplaza fetch manual con productsAPI
import {
  useProductsRepository,
  useProductDetail,
} from "@/modules/products";

// Componentes (ya migrados)
import { ProductBreadcrumb } from "../components/ProductBreadcrumb";
import { ProductDetail } from "../components/ProductDetail";
import { RelatedProducts } from "../components/RelatedProducts";

/**
 * @page ProductoDetalle
 *
 * CAMBIOS DE MIGRACIÓN:
 * - productsAPI.getProductBySlug(slug) + useState/useEffect manual
 *   → useProductDetail(repo, slug)  [cache-first, normalización automática]
 * - Loading/error states provistos directamente por el hook
 * - Ya no necesita validar response.success ni response.data
 * - Scroll to top: useEffect limpio sobre slug (sin cambios)
 * - ProductBreadcrumb: breadcrumb viene en product.breadcrumb (entidad canónica)
 * - RelatedProducts: recibe product._id (sin cambios)
 */
export default function ProductoDetalle() {
  const { slug } = useParams();

  // ──────────────────────────────────────────
  // REPOSITORY + HOOK DE DETALLE
  // ──────────────────────────────────────────
  const repo = useProductsRepository();

  // cache-first: busca en entity cache antes de hacer fetch
  const { product, isLoading, error, notFound } = useProductDetail(repo, slug);

  // ──────────────────────────────────────────
  // SCROLL TO TOP al navegar entre productos
  // ──────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // ──────────────────────────────────────────
  // LOADING
  // ──────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cargando producto...
          </h2>
          <p className="text-gray-600">Obteniendo la información más reciente</p>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────
  // ERROR / NOT FOUND
  // ──────────────────────────────────────────
  if (error || notFound || !product) {
    const message =
      error?.code === "PRODUCT_NOT_FOUND" || notFound
        ? "Producto no encontrado"
        : error?.message ?? "Error al cargar el producto";

    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{message}</h2>
          <p className="text-gray-600 mb-6">
            El producto que buscas no está disponible o no existe.
          </p>
          <Link
            to="/productos"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Volver a productos</span>
          </Link>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Breadcrumb jerárquico desde el backend */}
      {product.breadcrumb && product.breadcrumb.length > 0 && (
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <ProductBreadcrumb
              breadcrumb={product.breadcrumb}
              current={product.name}
            />
          </div>
        </div>
      )}

      {/*
        ProductDetail orquesta internamente:
        - ProductGallery  (galería con zoom y thumbnails)
        - ProductRating   (estrellas + distribución)
        - ProductSpecs    (especificaciones técnicas)
        - ProductFeatures (características destacadas)
        - ProductReviews  (sistema de reseñas)
        - InteractionButtons (AddToCartButton + WishlistButton)
      */}
      <ProductDetail product={product} />

      {/* Carrusel de productos relacionados */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <RelatedProducts productId={product._id} limit={8} />
        </div>
      </div>

      {/*
        SEO: integrar react-helmet aquí cuando esté disponible:
        product.seo.title, product.seo.description, product.seo.metaKeywords
      */}
    </main>
  );
}