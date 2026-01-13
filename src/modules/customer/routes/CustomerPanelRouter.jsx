// src/modules/customer/routes/CustomerPanelRouter.jsx - VERSIÓN FINAL

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import CustomerLayout from "../layout/CustomerLayout";

// Lazy load pages
const CustomerDashboardPage = lazy(() =>
  import("../pages/CustomerDashboardPage")
);
const Cart = lazy(() => import("../pages/CustomerCartPage"));
const Wishlist = lazy(() => import("../pages/CustomerWishlistPage"));
const Orders = lazy(() => import("../pages/CustomerOrdersPage"));
const OrderDetail = lazy(() => import("../pages/CustomerOrderDetailPage"));
const Profile = lazy(() => import("../pages/CustomerProfilePage"));
const Reviews = lazy(() => import("../pages/CustomerReviewsPage"));
const Contact = lazy(() => import("../pages/CustomerContactPage"));

// ✅ PRODUCTS
const Products = lazy(() => import("../pages/CustomerProductsPage"));
const ProductDetail = lazy(() => import("../pages/CustomerProductDetailPage"));

// ✅ CATEGORIES
const Categories = lazy(() => import("../pages/CustomerCategoriesPage"));
const CategoryDetail = lazy(() =>
  import("../pages/CustomerCategoryDetailPage")
);

/**
 * @component RouteGuard
 * @description Intercepta navegaciones fuera de /customer/*
 */
const RouteGuard = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    const handlePopState = (e) => {
      const path = window.location.pathname;

      if (!path.startsWith("/customer")) {
        e.preventDefault();
        window.history.pushState(null, "", "/customer");
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  if (!location.pathname.startsWith("/customer")) {
    return <Navigate to="/customer" replace />;
  }

  return children;
};

/**
 * @component LoadingFallback
 */
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-blue-400 rounded-full blur-2xl opacity-30 animate-pulse" />
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 border-4 border-blue-200 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
          <div className="absolute inset-2 border-4 border-indigo-200 rounded-full" />
          <div
            className="absolute inset-2 border-4 border-t-transparent border-r-indigo-600 border-b-transparent border-l-transparent rounded-full animate-spin"
            style={{ animationDirection: "reverse", animationDuration: "1s" }}
          />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Cargando...</h3>
      <p className="text-sm text-gray-600">Preparando tu experiencia</p>
    </div>
  </div>
);

/**
 * @component CustomerPanelRouter
 * ✅ COMPLETO CON PRODUCTS Y CATEGORIES
 */
const CustomerPanelRouter = () => {
  return (
    <RouteGuard>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route element={<CustomerLayout />}>
            {/* DASHBOARD */}
            <Route index element={<CustomerDashboardPage />} />
            <Route
              path="dashboard"
              element={<Navigate to="/customer/" replace />}
            />

            {/* ✅ PRODUCTS */}
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetail />} />

            {/* ✅ CATEGORIES */}
            <Route path="categories" element={<Categories />} />
            <Route path="categories/:slug" element={<CategoryDetail />} />

            {/* CORE */}
            <Route path="cart" element={<Cart />} />
            <Route path="wishlist" element={<Wishlist />} />

            {/* ORDERS */}
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:orderId" element={<OrderDetail />} />

            {/* USER */}
            <Route path="profile" element={<Profile />} />
            <Route path="reviews" element={<Reviews />} />

            {/* SUPPORT */}
            <Route path="contact" element={<Contact />} />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/customer" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </RouteGuard>
  );
};

export default CustomerPanelRouter;
