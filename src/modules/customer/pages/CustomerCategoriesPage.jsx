import React, { useState } from "react";
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

  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFeatured = featuredCategories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30">
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-2xl animate-pulse" />
                <div className="relative bg-white/20 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-2xl">
                  <svg
                    className="w-16 h-16 sm:w-20 sm:h-20 text-white"
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
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight">
                Explora por Categorías
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                Encuentra exactamente lo que buscas navegando por nuestras
                categorías organizadas
              </p>
            </div>

            <div className="max-w-2xl mx-auto pt-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
                <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl overflow-hidden">
                  <div className="pl-6 text-white/60">
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-white/60 px-4 py-4 text-lg focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="pr-6 text-white/60 hover:text-white transition-colors"
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 pt-4">
              <StatPill
                icon="📂"
                value={categoryTree.length}
                label="Categorías Principales"
              />
              <StatPill
                icon="⭐"
                value={featuredCategories.length}
                label="Destacadas"
              />
              <StatPill icon="🎯" value="100%" label="Organizadas" />
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        {filteredFeatured.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
                <span className="text-4xl">⭐</span>
                Categorías Destacadas
              </h2>
              <span className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow">
                {filteredFeatured.length} categorías
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFeatured.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigateToCategory(category.slug)}
                  featured
                  size="lg"
                />
              ))}
            </div>
          </section>
        )}

        <section className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-4xl">📑</span>
            Todas las Categorías
          </h2>

          <div className="bg-white rounded-xl p-2 shadow-lg inline-flex gap-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`
                px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2
                ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Cuadrícula
            </button>
            <button
              onClick={() => setViewMode("tree")}
              className={`
                px-4 py-2 rounded-lg font-bold transition-all duration-300 flex items-center gap-2
                ${
                  viewMode === "tree"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }
              `}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              Árbol
            </button>
          </div>
        </section>

        <section>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryTree.map((category) => (
                <CategoryCard
                  key={category._id}
                  category={category}
                  onClick={() => navigateToCategory(category.slug)}
                  size="md"
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl border-2 border-white shadow-2xl p-8">
              <CategoryTree
                tree={categoryTree}
                onSelectCategory={navigateToCategory}
              />
            </div>
          )}
        </section>

        <section className="space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            Accesos Rápidos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <QuickActionCard
              icon="🔥"
              title="Más Vendidos"
              description="Productos más populares de la tienda"
              gradient="from-orange-500 to-red-600"
              onClick={() =>
                navigate("/customer/products?sort=salesCount&order=desc")
              }
            />
            <QuickActionCard
              icon="🆕"
              title="Recién Llegados"
              description="Últimas novedades añadidas"
              gradient="from-blue-500 to-indigo-600"
              onClick={() =>
                navigate("/customer/products?sort=createdAt&order=desc")
              }
            />
            <QuickActionCard
              icon="💰"
              title="Ofertas"
              description="Productos con descuento especial"
              gradient="from-green-500 to-emerald-600"
              onClick={() => navigate("/customer/products?featured=true")}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <InfoBanner
            icon="🎯"
            title="¿No encuentras lo que buscas?"
            description="Usa nuestro buscador avanzado para encontrar productos específicos"
            buttonText="Ir a Búsqueda"
            gradient="from-purple-500 to-pink-600"
            onClick={() => navigate("/customer/products")}
          />
          <InfoBanner
            icon="💬"
            title="¿Necesitas ayuda?"
            description="Nuestro equipo está listo para asistirte en lo que necesites"
            buttonText="Contactar Soporte"
            gradient="from-cyan-500 to-blue-600"
            onClick={() => navigate("/customer/contact")}
          />
        </section>
      </div>
    </div>
  );
};

const StatPill = ({ icon, value, label }) => (
  <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-full px-6 py-3 border border-white/30 shadow-lg">
    <span className="text-2xl">{icon}</span>
    <div className="text-white">
      <div className="text-2xl font-black">{value}</div>
      <div className="text-sm text-white/80">{label}</div>
    </div>
  </div>
);

const QuickActionCard = ({ icon, title, description, gradient, onClick }) => (
  <div
    onClick={onClick}
    className="group relative overflow-hidden bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-transparent cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
    />

    <div className="relative z-10">
      <div className="text-6xl mb-4 transform group-hover:scale-125 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 group-hover:text-white/90 transition-colors duration-300">
        {description}
      </p>
    </div>

    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      <svg
        className="w-8 h-8 text-white"
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

const InfoBanner = ({
  icon,
  title,
  description,
  buttonText,
  gradient,
  onClick,
}) => (
  <div
    className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-3xl p-8 text-white shadow-2xl`}
  >
    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

    <div className="relative z-10 space-y-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-white/90">{description}</p>
      <button
        onClick={onClick}
        className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform duration-300"
      >
        {buttonText}
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
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
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
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl animate-bounce">📂</span>
          </div>
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
        Cargando categorías...
      </h3>
      <p className="text-gray-600">Organizando todo para ti</p>
    </div>
  </div>
);

const ErrorState = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 p-6">
    <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-red-400/20 rounded-full blur-3xl" />
        <div className="relative text-8xl">⚠️</div>
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Error al Cargar</h2>
      <p className="text-gray-600 mb-8 text-lg">
        {error || "Hubo un problema al cargar las categorías"}
      </p>
      <button
        onClick={() => window.location.reload()}
        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
      >
        Reintentar
      </button>
    </div>
  </div>
);

export default CustomerCategoriesPage;
