import { useEffect } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";

// ============================================================================
// APIs Y HOOKS
// ============================================================================
import  productsAPI  from "../../api/products.api";
import { useState } from "react";

// ============================================================================
// ✅ COMPONENTES INTEGRADOS
// ============================================================================
import { ProductBreadcrumb } from "../../components/ProductBreadcrumb";
import { ProductDetail } from "../../components/ProductDetail";
import { RelatedProducts } from "../../components/RelatedProducts";

/**
 * @component ProductoDetalle
 * @description Página de detalle completo del producto
 *
 * ✅ INTEGRACIÓN COMPLETA:
 * - ProductBreadcrumb (navegación jerárquica)
 * - ProductDetail (componente principal que orquesta TODO)
 *   ├── ProductGallery (galería con zoom)
 *   ├── ProductRating (estrellas + distribución)
 *   ├── ProductReviews (sistema completo)
 *   ├── ProductSpecs (especificaciones técnicas)
 *   ├── ProductFeatures (características destacadas)
 *   └── InteractionButtons (cart + wishlist integrados)
 * - RelatedProducts (carrusel completo)
 *
 * 🎯 La page solo se encarga de:
 * - Fetch del producto por slug
 * - Manejo de loading/error states
 * - Scroll to top
 * - Renderizar componentes principales
 */
export default function ProductoDetalle() {
  const { slug } = useParams();

  // ==========================================================================
  // ESTADO LOCAL
  // ==========================================================================
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ==========================================================================
  // ✅ FETCH PRODUCTO
  // ==========================================================================
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await productsAPI.getProductBySlug(slug);

        if (response.success && response.data) {
          const prod = response.data;

          // Validación de seguridad
          if (!prod._id) {
            throw new Error("Datos de producto incompletos");
          }

          setProduct(prod);
        } else {
          setError(response.message || "Producto no encontrado");
        }
      } catch (err) {
        console.error("[ProductoDetalle] Error:", err);
        setError(err.message || "Error al cargar el producto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ✅ Scroll to top al cargar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Cargando producto...
          </h2>
          <p className="text-gray-600">
            Obteniendo la información más reciente
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================
  if (error || !product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Producto no encontrado"}
          </h2>
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

  // ==========================================================================
  // ✅ RENDER SUCCESS
  // ==========================================================================
  return (
    <main className="min-h-screen bg-gray-50">
      {/* ✅ INTEGRACIÓN: ProductBreadcrumb */}
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

      {/* ✅ INTEGRACIÓN: ProductDetail - COMPONENTE PRINCIPAL */}
      {/* 
        Este componente maneja INTERNAMENTE:
        - ProductGallery (galería completa con zoom y thumbnails)
        - Información del producto (brand, title, rating, price, stock)
        - Quantity selector
        - CTAs (AddToCart, Wishlist, Share) vía InteractionButtons
        - Tabs de:
          * Descripción
          * ProductSpecs (especificaciones técnicas)
          * ProductFeatures (características destacadas)
          * ProductReviews (sistema completo de reviews)
        
        La page solo pasa el producto completo como prop.
      */}
      <ProductDetail product={product} />

      {/* ✅ INTEGRACIÓN: RelatedProducts */}
      <div className="bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <RelatedProducts productId={product._id} limit={8} />
        </div>
      </div>

      {/* ✅ SEO Metadata (opcional - integrar react-helmet) */}
      {product.seo && (
        <>
          {/* 
            Aquí se integraría react-helmet o similar:
            <Helmet>
              <title>{product.seo.metaTitle}</title>
              <meta name="description" content={product.seo.metaDescription} />
              <meta name="keywords" content={product.seo.keywords.join(", ")} />
              <link rel="canonical" href={window.location.href} />
            </Helmet>
          */}
        </>
      )}
    </main>
  );
}
