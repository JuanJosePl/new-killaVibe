/**
 * @page CategoryDetailPage
 * @description Página de detalle de categoría.
 *
 * Consume:
 * - useCategoryActions → fetchBySlug
 * - useCategorySEO     → helmetProps / breadcrumb
 * - productsAPI        → productos de la categoría
 * Sin dependencia de Context ni CategoriesContext.
 */

import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import useCategoryActions from '../presentation/hooks/useCategoryActions.js';
import useCategorySEO     from '../presentation/hooks/useCategorySEO.js';
import CategoryCard       from '../presentation/components/CategoryCard.jsx';
import productsAPI        from '../../products/api/products.api';
import { ProductCard }    from '../../products/components/ProductCard';
import { useProductCart }     from '../../products/hooks/useProductCart';
import { useProductWishlist } from '../../products/hooks/useProductWishlist';
import { formatProductCount } from '../utils/categoryHelpers.js';

const CategoryDetailPage = () => {
  const { categorySlug } = useParams();
  const navigate         = useNavigate();

  const [products, setProducts]             = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  /* ── Categoría ─────────────────────────────────────────────────── */
  const {
    getBySlug,
    loading    : loadingCategory,
    detailError: categoryError,
  } = useCategoryActions();

  // La entidad seleccionada vive en el store luego de fetchBySlug
  const [category, setCategory] = useState(null);

  const { hydrateFromEntity, helmetProps, breadcrumb } = useCategorySEO();

  /* ── Productos ─────────────────────────────────────────────────── */
  const { addProductToCart, isProductInCart, getProductQuantity } = useProductCart();
  const { toggleProductWishlist, isProductInWishlist }            = useProductWishlist();

  /* ── Carga ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!categorySlug) return;

    getBySlug(categorySlug)
      .then((entity) => {
        setCategory(entity);
        hydrateFromEntity(entity);
      })
      .catch(() => setCategory(null));
  }, [categorySlug, getBySlug, hydrateFromEntity]);

  useEffect(() => {
    if (!categorySlug) return;

    setLoadingProducts(true);
    productsAPI
      .getProductsByCategory(categorySlug)
      .then((response) => {
        if (response?.success && Array.isArray(response.data)) {
          const normalized = response.data.map((p) => ({
            ...p,
            images      : p.images ?? [{ url: p.image, alt: p.name }],
            image       : p.image ?? p.images?.[0]?.url ?? '/placeholder-product.jpg',
            mainCategory: p.mainCategory ?? p.categories?.[0] ?? null,
          }));
          setProducts(normalized);
        } else {
          setProducts([]);
        }
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [categorySlug]);

  /* ── Estados de UI ─────────────────────────────────────────────── */
  if (loadingCategory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Cargando categoría...</p>
        </div>
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Categoría no encontrada</h2>
          <p className="text-gray-600 mb-6">{categoryError ?? 'La categoría que buscas no existe'}</p>
          <button
            onClick={() => navigate('/categorias')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver todas las categorías
          </button>
        </div>
      </div>
    );
  }

  /* ── Render ────────────────────────────────────────────────────── */
  return (
    <>
      {/* SEO — props calculados por useCategorySEO desde CategorySEOContext */}
      <Helmet>
        <title>{helmetProps.title || category.name}</title>
        <meta name="description" content={helmetProps.description || category.description} />
        <meta name="keywords"    content={helmetProps.keywords    || ''} />
        <meta property="og:title"       content={helmetProps.ogTitle  || category.name} />
        <meta property="og:description" content={helmetProps.ogDesc   || category.description} />
        <meta property="og:image"       content={helmetProps.ogImage  || category.images.hero} />
        <meta property="og:url"         content={helmetProps.canonical || window.location.href} />
        <link rel="canonical"           href={helmetProps.canonical    || window.location.href} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">

          {/* Breadcrumb */}
          {breadcrumb.length > 0 && (
            <nav className="mb-6 flex items-center gap-2 text-sm flex-wrap">
              <Link to="/" className="text-gray-500 hover:text-blue-600">Inicio</Link>
              <span className="text-gray-300">›</span>
              <Link to="/categorias" className="text-gray-500 hover:text-blue-600">Categorías</Link>
              {breadcrumb.map((crumb, idx) => (
                <div key={crumb._id ?? idx} className="flex items-center gap-2">
                  <span className="text-gray-300">›</span>
                  {idx === breadcrumb.length - 1 ? (
                    <span className="text-gray-900 font-medium">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.url} className="text-gray-500 hover:text-blue-600">
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          )}

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">

              {category.images.hero && (
                <div className="w-full md:w-64 h-64 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={category.images.hero}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = '/placeholder-category.jpg'; }}
                  />
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-900">{category.name}</h1>
                  {category.featured && (
                    <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded">
                      DESTACADA
                    </span>
                  )}
                </div>

                {category.description && (
                  <p className="text-gray-600 leading-relaxed mb-6">{category.description}</p>
                )}

                <div className="flex flex-wrap gap-6">
                  <Stat icon="📦" label="Productos"    value={formatProductCount(category.productCount)} />
                  <Stat icon="👁️" label="Vistas"       value={category.views} />
                  {category.hasSubcategories && (
                    <Stat icon="📁" label="Subcategorías" value={category.subcategories.length} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Subcategorías */}
          {category.hasSubcategories && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Subcategorías</h2>
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
                        onError={(e) => { e.target.src = '/placeholder-category.jpg'; }}
                      />
                    )}
                    <h3 className="font-semibold text-gray-900">{sub.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatProductCount(sub.productCount)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Productos */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos en {category.name}
            </h2>

            {loadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                <p className="mt-4 text-gray-600">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="text-gray-400 mb-4 text-5xl">📦</div>
                <h3 className="text-xl font-semibold text-gray-900">No hay productos</h3>
                <p className="text-gray-500">Aún no hay productos en esta categoría</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    showWishlistButton
                    showAddToCart
                    onToggleWishlist={() => toggleProductWishlist(product)}
                    onAddToCart={() => addProductToCart(product, 1)}
                    isInWishlist={isProductInWishlist(product._id)}
                    isInCart={isProductInCart(product._id)}
                    cartQuantity={getProductQuantity(product._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

/* ── Sub-componente Stat ───────────────────────────────────────────── */
const Stat = ({ icon, label, value }) => (
  <div className="flex items-center gap-2">
    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
      <span className="text-blue-600 font-bold">{icon}</span>
    </div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default CategoryDetailPage;