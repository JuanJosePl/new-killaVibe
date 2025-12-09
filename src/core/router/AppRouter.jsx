import { Routes, Route } from "react-router-dom"
import ScrollToTop from "./components/ScrollToTop"
import { PrivateRoute } from "./components/guards/PrivateRoute"
import { AdminRoute } from "./components/guards/AdminRoute"

// Páginas públicas


import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Hooks
import { useAuth } from "../hooks/useAuth";

// Layout
import Header from "../components/header";
import Footer from "../components/footer";

// Rutas protegidas
import { AdminRoute } from "./AdminRoute";

// Loader para lazy loading
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-black">
    <div className="w-12 h-12 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Páginas públicas
const Pagina = lazy(() => import(""));
const ProductosLista  = lazy(() => import("../../../src/modules/products/pages/ProductosLista"));
const ProductoDetalle = lazy(() => import("../../../src/modules/products/pages/detalle/ProductoDetalle"));
const ContactPage = lazy(() => import("../../"));
const AboutPage = lazy(() => import("../../../src/modules/products/pages/AboutPage"));
const OffersPage = lazy(() => import("../../../src/modules/products/pages/OffersPage"));
const WarrantyPage = lazy(() => import("../../../src/modules/products/pages/WarrantyPage"));
const ReturnsPage = lazy(() => import("../pages/devoluciones/ReturnsPage"));
const ShippingPage = lazy(() => import("../pages/envios/ShippingPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

// Páginas ADMIN
const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/admin/products/AdminProducts"));
const AdminUsers = lazy(() => import("../pages/admin/users/AdminUsers"));

/**
 * PrivateRoute — protege rutas que requieren login
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />

      <Suspense fallback={<LoadingScreen />}>
        <Routes>

          {/* Página principal */}
          <Route path="/" element={<HomePage />} />

          {/* Productos */}
          <Route path="/productos" element={<ProductosLista />} />
          <Route path="/productos/:id" element={<ProductoDetalle />} />

          {/* Páginas informativas */}
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="/ofertas" element={<OffersPage />} />
          <Route path="/garantia" element={<WarrantyPage />} />
          <Route path="/devoluciones" element={<ReturnsPage />} />
          <Route path="/envios" element={<ShippingPage />} />

          {/* Auth */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />

          {/* Panel administrativo */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/productos"
            element={
              <AdminRoute>
                <AdminProducts />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/usuarios"
            element={
              <AdminRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </AdminRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Footer />
    </BrowserRouter>
  );
}


