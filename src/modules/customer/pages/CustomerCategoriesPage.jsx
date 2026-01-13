// src/modules/customer/pages/CustomerCategoriesPage.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import useCategories from "../hooks/useCategories";
import CategoryCard from "../components/categories/CategoryCard";
import CategoryTree from "../components/categories/CategoryTree";

const CustomerCategoriesPage = () => {
  const navigate = useNavigate();
  const {
    categoryTree,
    featuredCategories,
    isLoading,
    error,
    navigateToCategory,
  } = useCategories();

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-6">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-black text-gray-900 mb-4">
            Explora por Categorías
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra exactamente lo que buscas navegando por nuestras
            categorías organizadas
          </p>
        </div>

        {/* Featured Categories */}
        {featuredCategories.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <span className="text-4xl">⭐</span>
              Categorías Destacadas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCategories.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigateToCategory(category.slug)}
                  featured
                />
              ))}
            </div>
          </section>
        )}

        {/* All Categories Tree */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="text-4xl">📁</span>
            Todas las Categorías
          </h2>
          <div className="bg-white/60 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-2xl p-8">
            <CategoryTree
              tree={categoryTree}
              onSelectCategory={navigateToCategory}
            />
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon="🔥"
            title="Más Vendidos"
            description="Productos populares"
            onClick={() =>
              navigate("/customer/products?sort=salesCount&order=desc")
            }
          />
          <QuickActionCard
            icon="🆕"
            title="Recién Llegados"
            description="Últimos productos"
            onClick={() =>
              navigate("/customer/products?sort=createdAt&order=desc")
            }
          />
          <QuickActionCard
            icon="💰"
            title="Ofertas"
            description="Productos en descuento"
            onClick={() => navigate("/customer/products?featured=true")}
          />
        </section>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS
// ============================================

const QuickActionCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="group relative bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
  >
    <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
      {title}
    </h3>
    <p className="text-sm text-gray-600">{description}</p>

    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <svg
        className="w-6 h-6 text-blue-600"
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
        Cargando categorías...
      </h3>
      <p className="text-gray-600">Organizando todo para ti</p>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
      <div className="text-8xl mb-6">⚠️</div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al cargar</h2>
      <p className="text-gray-600 mb-8">
        {error || "Hubo un problema al cargar las categorías"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all duration-300"
      >
        Reintentar
      </button>
    </div>
  </div>
);

export default CustomerCategoriesPage;
