import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import useCategoryActions from "../hooks/useCategoryActions";
import  productsAPI  from "../../products/api/products.api";
import { ProductCard } from "../../products/components/ProductCard";
import { useProductCart } from "../../products/hooks/useProductCart";
import { useProductWishlist } from "../../products/hooks/useProductWishlist";
import { formatProductCount } from "../utils/categoryHelpers";

/**
 * @page CategoryDetailPage
 * @description Página de detalle de categoría con productos, breadcrumb y SEO
 *
 * CARACTERÍSTICAS:
 * - Breadcrumb pre-construido desde backend
 * - SEO context completo para meta tags
 * - Subcategorías con productCount actualizado
 * - Productos de la categoría
 * - Stats de la categoría
 * - Integración con cart y wishlist
 *
 * ✅ CORREGIDO: Transformación de productos para compatibilidad con ProductCard
 */
const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState(null);

  // Hooks de categoría
  const { fetchBySlug } = useCategoryActions();

  // Hooks de productos
  const { addProductToCart, isProductInCart, getProductQuantity } =
    useProductCart();
  const { toggleProductWishlist, isProductInWishlist } = useProductWishlist();

  // Cargar categoría por slug
  useEffect(() => {
    const loadCategory = async () => {
      if (!categorySlug) return;

      setLoadingCategory(true);
      setError(null);

      try {
        console.log("[CategoryDetailPage] Loading category:", categorySlug);

        // ✅ Backend retorna CategoryDetailDTO completo
        const data = await fetchBySlug(categorySlug);

        console.log("[CategoryDetailPage] Category loaded:", data);
        setCategory(data);
      } catch (err) {
        setError(err.message || "Error al cargar categoría");
        console.error("[CategoryDetailPage] Error loading category:", err);
      } finally {
        setLoadingCategory(false);
      }
    };

    loadCategory();
  }, [categorySlug, fetchBySlug]);

  // Cargar productos de la categoría
  useEffect(() => {
    const loadProducts = async () => {
      if (!categorySlug) return;

      setLoadingProducts(true);

      try {
        console.log(
          "[CategoryDetailPage] Loading products for category:",
          categorySlug
        );

        // ✅ Endpoint directo de productos por categoría
        const response = await productsAPI.getProductsByCategory(categorySlug);

        console.log("[CategoryDetailPage] Products response:", response);

        if (response && response.success && Array.isArray(response.data)) {
          // ✅ Transformar productos para asegurar compatibilidad con ProductCard
          const transformedProducts = response.data.map((product) => ({
            ...product,
            // Asegurar que images sea un array
            images: product.images || [
              { url: product.image, alt: product.name },
            ],
            // Asegurar que image exista (fallback)
            image:
              product.image ||
              product.images?.[0]?.url ||
              "/placeholder-product.jpg",
            // Asegurar que mainCategory exista
            mainCategory:
              product.mainCategory || product.categories?.[0] || null,
            category: product.category || product.categories?.[0] || null,
          }));

          console.log(
            "[CategoryDetailPage] Products transformed:",
            transformedProducts
          );
          setProducts(transformedProducts);
        } else {
          console.warn(
            "[CategoryDetailPage] Invalid response format:",
            response
          );
          setProducts([]);
        }
      } catch (err) {
        console.error("[CategoryDetailPage] Error loading products:", err);
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, [categorySlug]);

  // Loading inicial
  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Cargando categoría...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Categoría no encontrada
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "La categoría que buscas no existe"}
          </p>
          <button
            onClick={() => navigate("/categorias")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todas las categorías
          </button>
        </div>
      </div>
    );
  }

  // ✅ SEO Context desde backend (CategoryDetailDTO.seoContext)
  const seoMetaTags = category.seoContext?.metaTags || {};

  return (
    <>
      {/* ✅ SEO Meta Tags desde backend */}
      <Helmet>
        <title>{seoMetaTags.title || category.name}</title>
        <meta
          name="description"
          content={seoMetaTags.description || category.description}
        />
        <meta name="keywords" content={seoMetaTags.keywords || ""} />

        {/* Open Graph */}
        <meta
          property="og:title"
          content={seoMetaTags["og:title"] || category.name}
        />
        <meta
          property="og:description"
          content={seoMetaTags["og:description"] || category.description}
        />
        <meta
          property="og:image"
          content={seoMetaTags["og:image"] || category.images?.hero}
        />
        <meta
          property="og:url"
          content={seoMetaTags["og:url"] || window.location.href}
        />

        {/* Canonical */}
        <link
          rel="canonical"
          href={seoMetaTags.canonical || window.location.href}
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* ✅ Breadcrumb pre-construido desde backend */}
          {category.breadcrumb && category.breadcrumb.length > 0 && (
            <nav className="mb-6 flex items-center gap-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-blue-600">
                Inicio
              </Link>
              <span className="text-gray-300">{">"}</span>
              <Link
                to="/categorias"
                className="text-gray-500 hover:text-blue-600"
              >
                Categorías
              </Link>

              {category.breadcrumb.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-gray-300">{">"}</span>
                  {idx === category.breadcrumb.length - 1 ? (
                    <span className="text-gray-900 font-medium">
                      {crumb.name}
                    </span>
                  ) : (
                    <Link
                      to={crumb.url}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Header de Categoría */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Imagen Hero */}
              {category.images?.hero && (
                <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden bg-gray-100">
                  <img
                    src={category.images.hero}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-category.jpg";
                    }}
                  />
                </div>
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">
                    {category.name}
                  </h1>
                  {category.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                      DESTACADA
                    </span>
                  )}
                </div>

                {category.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {category.description}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">📦</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Productos</p>
                      <p className="font-bold text-gray-900">
                        {formatProductCount(category.stats?.productCount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">👁️</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Vistas</p>
                      <p className="font-bold text-gray-900">
                        {category.stats?.views || 0}
                      </p>
                    </div>
                  </div>

                  {category.hasSubcategories && (
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">📁</span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Subcategorías</p>
                        <p className="font-bold text-gray-900">
                          {category.subcategories?.length || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subcategorías */}
          {category.hasSubcategories &&
            category.subcategories &&
            category.subcategories.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Subcategorías
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub._id}
                      to={`/categorias/${sub.slug}`}
                      className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md hover:border-blue-200 transition-all"
                    >
                      {sub.images?.thumbnail && (
                        <img
                          src={sub.images.thumbnail}
                          alt={sub.name}
                          className="w-full h-32 object-cover rounded-md mb-3"
                          onError={(e) => {
                            e.target.src = "/placeholder-category.jpg";
                          }}
                        />
                      )}
                      <h3 className="font-semibold text-gray-900">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatProductCount(sub.productCount)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          {/* Productos de la Categoría */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos en {category.name}
            </h2>

            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4 text-5xl">📦</div>
                <h3 className="text-xl font-semibold text-gray-900">
                  No hay productos
                </h3>
                <p className="text-gray-500">
                  Aún no hay productos en esta categoría
                </p>
              </div>
            ) : (
              <>
                {/* Debug info (eliminar en producción) */}
                {process.env.NODE_ENV === "development" && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>Debug:</strong> {products.length} productos
                      cargados
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {products.map((product) => {
                    console.log(
                      "[CategoryDetailPage] Rendering product:",
                      product._id,
                      product.name
                    );

                    return (
                      <ProductCard
                        key={product._id}
                        product={product}
                        showWishlistButton={true}
                        showAddToCart={true}
                        onToggleWishlist={() => toggleProductWishlist(product)}
                        onAddToCart={() => addProductToCart(product, 1)}
                        isInWishlist={isProductInWishlist(product._id)}
                        isInCart={isProductInCart(product._id)}
                        cartQuantity={getProductQuantity(product._id)}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CategoryDetailPage;
