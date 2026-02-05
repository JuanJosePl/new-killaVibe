// src/modules/customer/pages/CustomerCategoryDetailPage.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCustomerCategories } from "../context/CustomerCategoriesContext";
import { useCustomerProducts } from "../context/CustomerProductsContext";
import { useCustomerActivity } from "../context/CustomerActivityContext";
import { useCustomerCart } from "../context/CustomerCartContext";
import { useCustomerWishlist } from "../context/CustomerWishlistContext";
import CategoryCard from "../components/categories/CategoryCard";
import ProductGrid from "../components/products/ProductGrid";

const CustomerCategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { getCategoryBySlug } = useCustomerCategories();
  const { getProductsByCategory, isLoading: productsLoading } =
    useCustomerProducts();
  const { trackCategoryView } = useCustomerActivity();
  const { addItem: addToCart, isInCart, getItemQuantity } = useCustomerCart();
  const { addItem: addToWishlist, isItemInWishlist } = useCustomerWishlist();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("subcategories");
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [cartLoadingStates, setCartLoadingStates] = useState({});
  const [wishlistLoadingStates, setWishlistLoadingStates] = useState({});

  useEffect(() => {
    loadCategoryAndProducts();
  }, [slug]);

  const loadCategoryAndProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("[CategoryDetailPage] ✅ Cargando categoría:", slug);

      const categoryData = await getCategoryBySlug(slug);
      setCategory(categoryData);

      console.log(
        "[CategoryDetailPage] ✅ Categoría cargada:",
        categoryData.name
      );

      trackCategoryView({
        _id: categoryData._id,
        name: categoryData.name,
        slug: categoryData.slug,
      });

      const hasSubcategories = categoryData.subcategories?.length > 0;
      const hasProducts = categoryData.stats?.productCount > 0;

      if (!hasSubcategories && hasProducts) {
        setActiveTab("products");
      } else if (hasSubcategories) {
        setActiveTab("subcategories");
      }

      if (hasProducts) {
        await loadProducts(categoryData.slug);
      }
    } catch (err) {
      console.error("[CategoryDetailPage] ❌ Error:", err);
      setError(err.message || "Categoría no encontrada");
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (categorySlug) => {
    try {
      setLoadingProducts(true);

      console.log(
        "[CategoryDetailPage] ✅ Cargando productos de:",
        categorySlug
      );

      const result = await getProductsByCategory(categorySlug, {
        page: 1,
        limit: 12,
        sort: "createdAt",
        order: "desc",
      });

      console.log(
        "[CategoryDetailPage] ✅ Productos recibidos:",
        result.products?.length
      );

      setProducts(result.products || []);
    } catch (err) {
      console.error("[CategoryDetailPage] ❌ Error loading products:", err);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddToCart = async (product) => {
    setCartLoadingStates((prev) => ({ ...prev, [product._id]: true }));
    try {
      await addToCart(product._id, 1);
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setCartLoadingStates((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleAddToWishlist = async (product) => {
    setWishlistLoadingStates((prev) => ({ ...prev, [product._id]: true }));
    try {
      if (isItemInWishlist(product._id)) {
        console.log("Ya está en wishlist");
      } else {
        await addToWishlist(product._id);
      }
    } catch (err) {
      console.error("Error adding to wishlist:", err);
    } finally {
      setWishlistLoadingStates((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleBreadcrumbClick = (breadcrumbSlug) => {
    if (breadcrumbSlug === slug) return;
    navigate(`/customer/categories/${breadcrumbSlug}`);
  };

  const handleSubcategoryClick = (subcategorySlug) => {
    navigate(`/customer/categories/${subcategorySlug}`);
  };

  const handleViewAllProducts = () => {
    navigate(`/customer/products?category=${slug}`);
  };

  const handleBackToCategories = () => {
    navigate("/customer/categories");
  };

  if (loading) return <LoadingState />;
  if (error)
    return <ErrorState error={error} onRetry={loadCategoryAndProducts} />;
  if (!category) return <NotFoundState onBack={handleBackToCategories} />;

  const hasSubcategories =
    category.subcategories && category.subcategories.length > 0;
  const hasProducts = category.stats?.productCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
        </div>

        {category.images?.hero && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={category.images.hero}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        )}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {category.breadcrumb && category.breadcrumb.length > 0 && (
            <Breadcrumb
              items={category.breadcrumb}
              onClick={handleBreadcrumbClick}
              onBack={handleBackToCategories}
            />
          )}

          <div className="mt-8 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {category.images?.thumbnail && (
              <div className="relative group flex-shrink-0">
                <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-300" />
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md ring-4 ring-white/30 shadow-2xl">
                  <img
                    src={category.images.thumbnail}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            )}

            <div className="flex-1 text-white space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                  {category.name}
                </h1>
                {category.featured && (
                  <span className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Destacado
                  </span>
                )}
              </div>

              {category.description && (
                <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                  {category.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <StatBadge
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                    </svg>
                  }
                  label="Productos"
                  value={category.stats?.productCount || 0}
                />
                <StatBadge
                  icon={
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  }
                  label="Vistas"
                  value={(category.stats?.views || 0).toLocaleString()}
                />
                {hasSubcategories && (
                  <StatBadge
                    icon={
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    }
                    label="Subcategorías"
                    value={category.subcategories.length}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 sm:h-16 text-slate-50"
            viewBox="0 0 1440 120"
            preserveAspectRatio="none"
          >
            <path
              fill="currentColor"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {hasSubcategories && hasProducts && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-2 shadow-lg inline-flex gap-2">
              <button
                onClick={() => setActiveTab("subcategories")}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === "subcategories"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                  Subcategorías ({category.subcategories.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("products")}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === "products"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                  Productos ({category.stats?.productCount || 0})
                </span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "subcategories" && hasSubcategories && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl">📂</span>
                Explora por Subcategoría
              </h2>
              <span className="text-sm text-gray-500 font-medium">
                {category.subcategories.length} categorías
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {category.subcategories.map((sub) => (
                <CategoryCard
                  key={sub._id}
                  category={sub}
                  onClick={() => handleSubcategoryClick(sub.slug)}
                  size="md"
                />
              ))}
            </div>
          </section>
        )}

        {activeTab === "products" && hasProducts && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🛍️</span>
                Productos en {category.name}
              </h2>
              {products.length > 0 && (
                <button
                  onClick={handleViewAllProducts}
                  className="group flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Ver todos ({category.stats?.productCount})
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}
            </div>

            <ProductGrid
              products={products}
              isLoading={loadingProducts}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              getIsInCart={(productId) => isInCart(productId)}
              getIsInWishlist={(productId) => isItemInWishlist(productId)}
              getIsCartLoading={(productId) =>
                cartLoadingStates[productId] || false
              }
              getIsWishlistLoading={(productId) =>
                wishlistLoadingStates[productId] || false
              }
            />

            {products.length > 0 &&
              products.length < category.stats?.productCount && (
                <div className="text-center pt-8">
                  <button
                    onClick={handleViewAllProducts}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    Ver Todos los Productos
                  </button>
                </div>
              )}
          </section>
        )}

        {!hasSubcategories && !hasProducts && (
          <EmptyState onBack={handleBackToCategories} />
        )}
      </div>
    </div>
  );
};

const Breadcrumb = ({ items, onClick, onBack }) => (
  <nav
    className="flex items-center gap-2 text-sm flex-wrap"
    aria-label="Breadcrumb"
  >
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-white/80 hover:text-white font-medium transition-colors group"
    >
      <svg
        className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Categorías
    </button>

    {items.map((item, index) => (
      <React.Fragment key={item.slug}>
        <svg
          className="w-4 h-4 text-white/60"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <button
          onClick={() => onClick(item.slug)}
          className={`font-medium transition-colors ${
            index === items.length - 1
              ? "text-white font-bold pointer-events-none"
              : "text-white/80 hover:text-white"
          }`}
        >
          {item.name}
        </button>
      </React.Fragment>
    ))}
  </nav>
);

const StatBadge = ({ icon, label, value }) => (
  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/30">
    <div className="text-white">{icon}</div>
    <div className="text-white">
      <span className="font-bold text-lg">{value}</span>
      <span className="text-sm text-white/80 ml-1">{label}</span>
    </div>
  </div>
);

const EmptyState = ({ onBack }) => (
  <div className="bg-white rounded-3xl shadow-2xl p-16 text-center max-w-2xl mx-auto">
    <div className="text-8xl mb-6 animate-bounce">📦</div>
    <h3 className="text-3xl font-bold text-gray-900 mb-4">
      Categoría en Construcción
    </h3>
    <p className="text-gray-600 text-lg mb-8">
      Estamos trabajando para traerte los mejores productos pronto. Mientras
      tanto, explora otras categorías.
    </p>
    <button
      onClick={onBack}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Ver Todas las Categorías
    </button>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-indigo-400/30 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-8 border-indigo-200 rounded-full" />
          <div className="absolute inset-0 border-8 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-4 border-6 border-purple-200 rounded-full" />
          <div
            className="absolute inset-4 border-6 border-t-transparent border-r-purple-600 border-b-transparent border-l-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
          />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
        Cargando categoría...
      </h3>
      <p className="text-gray-600">Preparando la mejor experiencia para ti</p>
    </div>
  </div>
);

const ErrorState = ({ error, onRetry }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-400/20 rounded-full blur-3xl" />
        <div className="relative text-8xl">⚠️</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al Cargar</h2>
      <p className="text-gray-600 mb-8 text-lg">{error}</p>
      <button
        onClick={onRetry}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        Intentar Nuevamente
      </button>
    </div>
  </div>
);

const NotFoundState = ({ onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="relative text-8xl">🔍</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Categoría No Encontrada
      </h2>
      <p className="text-gray-600 mb-8 text-lg">
        La categoría que buscas no existe o ha sido eliminada
      </p>
      <button
        onClick={onBack}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        Ver Todas las Categorías
      </button>
    </div>
  </div>
);

export default CustomerCategoryDetailPage;
