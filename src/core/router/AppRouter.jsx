// src/core/router/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// useScroll Hook

import { useScrollToTop } from '../hooks/useScroll';

// Guards
import { PrivateRoute } from '../../core/guards/PrivateRoute';
import { AdminRoute } from '../../core/guards/AdminRoute';

// Layout
import Layout from '../../app/Layout';

/**
 * @component AppRouter
 * @description Router principal de la aplicación
 * 
 * ESTRUCTURA:
 * - Rutas públicas (sin auth)
 * - Rutas de autenticación
 * - Rutas privadas (requieren auth)
 * - Rutas de administrador
 * - 404
 * 
 * ARQUITECTURA:
 * BrowserRouter (en main.jsx)
 *   → App.jsx
 *     → AppRouter
 *       → Layout (Header + Outlet + Footer)
 *         → Páginas
 */

// ============================================================================
// LOADING SCREEN
// ============================================================================

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
    <div className="text-center">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 text-lg font-medium">
        Cargando...
      </p>
    </div>
  </div>
);

// ============================================================================
// LAZY LOADED PAGES
// ============================================================================

// ────────────────────────────────────────────────────────────────────────────
// PÃGINAS PÃBLICAS (src/app/)
// ────────────────────────────────────────────────────────────────────────────

const HomePage = lazy(() => import('../../app/PaginaPrincipal'));
const ContactPage  = lazy(() => import('../../modules/contact/pages/Contacto'));
const AboutPage = lazy(() => import('../../app/sobre-nosotros/SobreNosotros'));
const OffersPage = lazy(() => import('../../app/ofertas/Ofertas'));
const WarrantyPage = lazy(() => import('../../app/garantia/Garantia'));
const ReturnsPage = lazy(() => import('../../app/devoluciones/Devoluciones'));
const ShippingPage = lazy(() => import('../../app/envios/Envios'));
const NotFoundPage = lazy(() => import('../../app/PaginaNoEncontrada'));
// const CategoriesPage = lazy(() => import('../../app/categorias/Categorias'));

// ────────────────────────────────────────────────────────────────────────────
// MÃDULO PRODUCTS (src/modules/products/pages/)
// ────────────────────────────────────────────────────────────────────────────

const ProductsListPage = lazy(() => import('../../modules/products/pages/ProductosLista'));
const ProductDetailPage = lazy(() => import('../../modules/products/pages/detalle/ProductoDetalle'));

// ────────────────────────────────────────────────────────────────────────────
// MÃDULO AUTH (src/modules/auth/pages/)
// ────────────────────────────────────────────────────────────────────────────

const LoginPage = lazy(() => import('../../modules/auth/pages/Login'));
const RegisterPage = lazy(() => import('../../modules/auth/pages/Register'));

// ────────────────────────────────────────────────────────────────────────────
// MÃDULO CART & WISHLIST (src/modules/cart/pages/ y src/modules/wishlist/pages/)
// ────────────────────────────────────────────────────────────────────────────

// Descomentar cuando existan estas páginas:
// const CartPage = lazy(() => import('../../modules/cart/pages/CartPage'));
// const WishlistPage = lazy(() => import('../../modules/wishlist/pages/WishlistPage'));
// const CheckoutPage = lazy(() => import('../../modules/checkout/pages/CheckoutPage'));

// ────────────────────────────────────────────────────────────────────────────
// MÃDULO ADMIN (src/modules/admin/pages/)
// ────────────────────────────────────────────────────────────────────────────

// Descomentar cuando existan estas páginas:
// const AdminDashboard = lazy(() => import('../../modules/admin/pages/AdminDashboard'));
// const AdminProducts = lazy(() => import('../../modules/admin/pages/products/AdminProducts'));
// const AdminUsers = lazy(() => import('../../modules/admin/pages/users/AdminUsers'));

// ============================================================================
// APP ROUTER COMPONENT
// ============================================================================

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      useScrollToTop()
      <Routes>
        
        {/* ================================================================== */}
        {/* RUTAS CON LAYOUT (Header + Footer)                                */}
        {/* ================================================================== */}
        
        <Route element={<Layout />}>
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* PÃGINAS PÃBLICAS                                                */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          {/* Página principal */}
          <Route index element={<HomePage />} />
          
          {/* Páginas informativas */}
          <Route path="contacto" element={<ContactPage />} />
          <Route path="sobre-nosotros" element={<AboutPage />} />
          <Route path="ofertas" element={<OffersPage />} />
          <Route path="garantia" element={<WarrantyPage />} />
          <Route path="devoluciones" element={<ReturnsPage />} />
          <Route path="envios" element={<ShippingPage />} />
          {/* <Route path='categorias' element={<CategoriesPage/>}/>/ */}
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* PRODUCTOS                                                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          <Route path="productos" element={<ProductsListPage />} />
          <Route path="productos/:id" element={<ProductDetailPage />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* CART & WISHLIST (Rutas públicas pero mejores con auth)         */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          {/* Descomentar cuando existan las páginas:
          <Route path="carrito" element={<CartPage />} />
          <Route path="lista-deseos" element={<WishlistPage />} />
          <Route path="checkout" element={
            <PrivateRoute>
              <CheckoutPage />
            </PrivateRoute>
          } />
          */}
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* RUTAS PRIVADAS (Requieren autenticación)                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          {/* Perfil de usuario */}
          {/* Descomentar cuando existan:
          <Route path="perfil" element={
            <PrivateRoute>
              <ProfilePage />
            </PrivateRoute>
          } />
          
          <Route path="mis-pedidos" element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } />
          */}
          
        </Route>
        
        {/* ================================================================== */}
        {/* RUTAS SIN LAYOUT (Sin Header/Footer)                              */}
        {/* ================================================================== */}
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* AUTENTICACIÃN                                                   */}
        {/* ────────────────────────────────────────────────────────────── */}
        
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register" element={<RegisterPage />} />
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* ADMIN PANEL (Sin layout público)                               */}
        {/* ────────────────────────────────────────────────────────────── */}
        
        {/* Descomentar cuando existan las páginas:
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        
        <Route path="admin/productos" element={
          <AdminRoute>
            <AdminProducts />
          </AdminRoute>
        } />
        
        <Route path="admin/usuarios" element={
          <AdminRoute allowedRoles={['admin']}>
            <AdminUsers />
          </AdminRoute>
        } />
        */}
        
        {/* ================================================================== */}
        {/* 404 - PÃGINA NO ENCONTRADA                                        */}
        {/* ================================================================== */}
        
        <Route path="*" element={<NotFoundPage />} />
        
      </Routes>
    </Suspense>
  );
}