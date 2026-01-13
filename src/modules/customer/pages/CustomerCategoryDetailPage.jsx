// src/modules/customer/pages/CustomerCategoryDetailPage.jsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import useProducts from "../hooks/useProducts";
import { useCustomerCart } from "../context/CustomerCartContext";
import { useCustomerWishlist } from "../context/CustomerWishlistContext";
import ProductGrid from "../components/products/ProductGrid";

const CustomerCategoryDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const {
    currentCategory,
    breadcrumb,
    loadCategoryDetails,
    navigateToCategory,
    navigateUp,
    isLoading: categoryLoading,
    error: categoryError,
  } = useCategories();

  const {
    products,
    pagination,
    isLoading: productsLoading,
    filterByCategory,
    changeSort,
    goToPage,
    nextPage,
    prevPage,
  } = useProducts();

  const { addItem: addToCart, isInCart, getItemQuantity } = useCustomerCart();
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useCustomerWishlist();

  const [notification, setNotification] = useState(null);
  const [loadingStates, setLoadingStates] = useState({
    cart: new Set(),
    wishlist: new Set(),
  });

  // ============================================
  // ✅ CARGAR CATEGORÍA (UNA SOLA VEZ)
  // ============================================
  useEffect(() => {
    if (slug) {
      console.log("[CategoryDetail] ✅ Cargando categoría:", slug);
      loadCategoryDetails(slug);
    }
  }, [slug]); // ✅ Sin loadCategoryDetails en dependencias

  // ============================================
  // ✅ APLICAR FILTRO (UNA SOLA VEZ)
  // ============================================
  useEffect(() => {
    if (slug) {
      console.log(
        "[CategoryDetail] ✅ Filtrando productos por categoría:",
        slug
      );
      filterByCategory(slug);
    }
  }, [slug]); // ✅ Sin filterByCategory en dependencias

  // ============================================
  // HELPERS
  // ============================================
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const setItemLoading = (productId, operation, loading) => {
    setLoadingStates((prev) => {
      const newSet = new Set(prev[operation]);
      if (loading) {
        newSet.add(productId);
      } else {
        newSet.delete(productId);
      }
      return { ...prev, [operation]: newSet };
    });
  };

  const isItemLoading = (productId, operation) => {
    return loadingStates[operation].has(productId);
  };

  // ============================================
  // HANDLERS
  // ============================================
  const handleAddToCart = async (product) => {
    const productId = product._id;

    if (!product.stock || product.stock === 0) {
      showNotification("error", "Producto sin stock disponible");
      return;
    }

    if (isInCart(productId)) {
      const currentQty = getItemQuantity(productId);
      showNotification(
        "info",
        `Ya tienes ${currentQty} unidades en el carrito`
      );
      return;
    }

    setItemLoading(productId, "cart", true);

    try {
      await addToCart(productId, 1, {});
      showNotification("success", `✅ ${product.name} agregado al carrito`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      showNotification("error", "❌ Error al agregar al carrito");
    } finally {
      setItemLoading(productId, "cart", false);
    }
  };

  const handleToggleWishlist = async (product) => {
    const productId = product._id;
    const inWishlist = isInWishlist(productId);

    setItemLoading(productId, "wishlist", true);

    try {
      if (inWishlist) {
        await removeFromWishlist(productId);
        showNotification("success", `💔 ${product.name} removido de favoritos`);
      } else {
        await addToWishlist(productId, true, true);
        showNotification("success", `❤️ ${product.name} agregado a favoritos`);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      showNotification("error", "❌ Error al actualizar favoritos");
    } finally {
      setItemLoading(productId, "wishlist", false);
    }
  };

  const handleSubcategoryClick = (subcategorySlug) => {
    navigateToCategory(subcategorySlug);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    const [sortBy, order] = value.split("-");
    changeSort(sortBy, order);
  };

  // ============================================
  // RENDER: LOADING
  // ============================================
  if (categoryLoading) {
    return <LoadingState />;
  }

  // ============================================
  // RENDER: ERROR
  // ============================================
  if (categoryError || !currentCategory) {
    return (
      <ErrorState
        error={categoryError}
        onBack={() => navigate("/customer/categories")}
      />
    );
  }

  // ============================================
  // ✅ USAR productCount DEL BACKEND (NO de pagination)
  // ============================================
  const realProductCount = currentCategory.productCount || 0;

  // ============================================
  // RENDER: MAIN
  // ============================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Notification Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div
              className={`
              px-6 py-4 rounded-2xl shadow-2xl border-2 flex items-center gap-3 min-w-[300px]
              ${
                notification.type === "success"
                  ? "bg-green-50 border-green-500 text-green-900"
                  : notification.type === "error"
                  ? "bg-red-50 border-red-500 text-red-900"
                  : "bg-blue-50 border-blue-500 text-blue-900"
              }
            `}
            >
              {notification.type === "success" && (
                <span className="text-2xl">✅</span>
              )}
              {notification.type === "error" && (
                <span className="text-2xl">❌</span>
              )}
              {notification.type === "info" && (
                <span className="text-2xl">ℹ️</span>
              )}
              <span className="font-semibold">{notification.message}</span>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm flex-wrap">
          <button
            onClick={() => navigate("/customer/categories")}
            className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
          >
            Categorías
          </button>
          {breadcrumb.map((item, index) => (
            <React.Fragment key={item.slug}>
              <svg
                className="w-4 h-4 text-gray-400"
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
              {index === breadcrumb.length - 1 ? (
                <span className="text-purple-600 font-bold">{item.name}</span>
              ) : (
                <button
                  onClick={() => navigateToCategory(item.slug)}
                  className="text-gray-600 hover:text-purple-600 font-medium transition-colors"
                >
                  {item.name}
                </button>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Category Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8">
          <div className="absolute inset-0 bg-white/10 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          </div>

          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon */}
            {currentCategory.images?.hero ? (
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm p-4 flex items-center justify-center">
                <img
                  src={currentCategory.images.hero}
                  alt={currentCategory.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-8xl">📦</div>
            )}

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-black text-white mb-3">
                {currentCategory.name}
              </h1>
              {currentCategory.description && (
                <p className="text-white/90 text-lg mb-4 max-w-2xl">
                  {currentCategory.description}
                </p>
              )}

              {/* Stats - ✅ USAR productCount DEL BACKEND */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span className="font-bold">
                    {realProductCount} productos
                  </span>
                </div>

                {currentCategory.views && (
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                    <svg
                      className="w-5 h-5"
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
                    <span className="font-bold">
                      {currentCategory.views} vistas
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Back Button */}
            {breadcrumb.length > 1 && (
              <button
                onClick={navigateUp}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <svg
                  className="w-5 h-5"
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
                Volver
              </button>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {currentCategory.subcategories &&
          currentCategory.subcategories.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-3xl">📂</span>
                Subcategorías
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {currentCategory.subcategories.map((sub) => (
                  <SubcategoryCard
                    key={sub._id}
                    category={sub}
                    onClick={() => handleSubcategoryClick(sub.slug)}
                  />
                ))}
              </div>
            </section>
          )}

        {/* Products Section */}
        <section>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-3xl">🛍️</span>
                Productos
              </h2>
              <p className="text-gray-600 mt-1">
                {productsLoading
                  ? "Cargando..."
                  : `${products.length} de ${realProductCount} productos`}
              </p>
            </div>

            {/* Sort Dropdown */}
            <select
              onChange={handleSortChange}
              className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-medium hover:border-purple-600 focus:outline-none focus:border-purple-600 transition-colors"
              defaultValue="createdAt-desc"
            >
              <option value="createdAt-desc">Más recientes</option>
              <option value="createdAt-asc">Más antiguos</option>
              <option value="price-asc">Precio: Menor a Mayor</option>
              <option value="price-desc">Precio: Mayor a Menor</option>
              <option value="name-asc">Nombre: A-Z</option>
              <option value="name-desc">Nombre: Z-A</option>
            </select>
          </div>

          {/* Products Grid */}
          <ProductGrid
            products={products}
            isLoading={productsLoading}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleToggleWishlist}
            getIsInCart={isInCart}
            getIsInWishlist={isInWishlist}
            getIsCartLoading={(productId) => isItemLoading(productId, "cart")}
            getIsWishlistLoading={(productId) =>
              isItemLoading(productId, "wishlist")
            }
          />

          {/* Empty State */}
          {!productsLoading && products.length === 0 && (
            <div className="bg-white/60 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-xl p-12 text-center">
              <div className="text-8xl mb-6">📦</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                No hay productos en esta categoría
              </h3>
              <p className="text-gray-600 mb-6">
                Intenta explorar otras categorías o vuelve más tarde
              </p>
              <button
                onClick={() => navigate("/customer/categories")}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all"
              >
                Ver todas las categorías
              </button>
            </div>
          )}

          {/* Pagination */}
          {!productsLoading && pagination.pages > 1 && (
            <div className="mt-8 bg-white/60 backdrop-blur-lg rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 font-medium">
                  Página{" "}
                  <span className="font-bold text-gray-900">
                    {pagination.current}
                  </span>{" "}
                  de{" "}
                  <span className="font-bold text-gray-900">
                    {pagination.pages}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={pagination.current === 1}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ← Anterior
                  </button>

                  <div className="hidden sm:flex items-center gap-1">
                    {generatePageNumbers(
                      pagination.current,
                      pagination.pages
                    ).map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="px-2 text-gray-400"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-xl font-bold transition-all ${
                            pagination.current === page
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-110"
                              : "bg-white border-2 border-gray-300 text-gray-700 hover:border-purple-600 hover:text-purple-600"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={pagination.current === pagination.pages}
                    className="px-4 py-2 bg-white border-2 border-gray-300 rounded-xl font-semibold hover:border-purple-600 hover:text-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

const SubcategoryCard = ({ category, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 rounded-2xl p-4 border-2 border-gray-200 hover:border-purple-400 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
  >
    {category.images?.thumbnail ? (
      <div className="w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 p-2 group-hover:scale-110 transition-transform duration-300">
        <img
          src={category.images.thumbnail}
          alt={category.name}
          className="w-full h-full object-contain"
        />
      </div>
    ) : (
      <div className="text-5xl text-center mb-3 group-hover:scale-110 transition-transform duration-300">
        {category.icon || "📁"}
      </div>
    )}

    <h3 className="text-center font-bold text-gray-900 mb-2 line-clamp-2">
      {category.name}
    </h3>

    {category.productCount !== undefined && (
      <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
        </svg>
        <span className="font-semibold">{category.productCount}</span>
      </div>
    )}

    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg
        className="w-5 h-5 text-purple-600"
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
    </div>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl animate-bounce">📂</span>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Cargando categoría...
      </h3>
      <p className="text-gray-600">Preparando la información</p>
    </div>
  </div>
);

const ErrorState = ({ error, onBack }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
      <div className="text-8xl mb-6">😕</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">
        Categoría no encontrada
      </h2>
      <p className="text-gray-600 mb-8">
        {error || "La categoría que buscas no existe o ha sido removida."}
      </p>
      <button
        onClick={onBack}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
      >
        Volver a Categorías
      </button>
    </div>
  </div>
);

const generatePageNumbers = (current, total) => {
  const pages = [];
  const showEllipsis = total > 7;

  if (!showEllipsis) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (current > 3) pages.push("...");
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(current + 1, total - 1);
      i++
    ) {
      pages.push(i);
    }
    if (current < total - 2) pages.push("...");
    pages.push(total);
  }

  return pages;
};

export default CustomerCategoryDetailPage;
