// src/core/router/AppRouter.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Guards
import { PrivateRoute } from '../../core/guards/PrivateRoute';
import { AdminRoute } from '../../core/guards/AdminRoute';

// Layout
import Layout from '../../app/Layout';

// Hooks 
import { useScrollToTop } from '../hooks/useScroll';

/**
 * @component AppRouter
 * @description Router principal de la aplicación
 * ✅ CORREGIDO: 
 * - Parámetro :slug para productos
 * - useScrollToTop dentro del componente
 * - Imports corregidos
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
// PÁGINAS PÚBLICAS (src/app/)
// ────────────────────────────────────────────────────────────────────────────

const HomePage = lazy(() => import('../../app/PaginaPrincipal'));
const AboutPage = lazy(() => import('../../app/sobre-nosotros/SobreNosotros'));
const WarrantyPage = lazy(() => import('../../app/garantia/Garantia'));
const ReturnsPage = lazy(() => import('../../app/devoluciones/Devoluciones'));
const ShippingPage = lazy(() => import('../../app/envios/Envios'));
const NotFoundPage = lazy(() => import('../../app/PaginaNoEncontrada'));
const OffersPage = lazy(() => import('../../app/ofertas/Ofertas'));

// ────────────────────────────────────────────────────────────────────────────
// MÓDULO PRODUCTS (src/modules/products/pages/)
// ────────────────────────────────────────────────────────────────────────────

const ProductsListPage = lazy(() => import('../../modules/products/pages/ProductosLista'));
const ProductDetailPage = lazy(() => import('../../modules/products/pages/detalle/ProductoDetalle'));

// ────────────────────────────────────────────────────────────────────────────
// MÓDULO CATEGORIES (src/modules/categories/pages/)
// ────────────────────────────────────────────────────────────────────────────

const CategoriesPage = lazy(() => import('../../modules/categories/pages/CategoriesPage'));

// ────────────────────────────────────────────────────────────────────────────
// MÓDULO CONTACT (src/modules/contact/pages/)
// ────────────────────────────────────────────────────────────────────────────

const ContactPage  = lazy(() => import('../../modules/contact/pages/Contacto'));


// ────────────────────────────────────────────────────────────────────────────
// MÓDULO AUTH (src/modules/auth/pages/)
// ────────────────────────────────────────────────────────────────────────────

const LoginPage = lazy(() => import('../../modules/auth/pages/Login'));
const RegisterPage = lazy(() => import('../../modules/auth/pages/Register'));

// ============================================================================
// APP ROUTER COMPONENT
// ============================================================================

export default function AppRouter() {

  useScrollToTop();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        
        {/* ================================================================== */}
        {/* RUTAS CON LAYOUT (Header + Footer)                                */}
        {/* ================================================================== */}
        
        <Route element={<Layout />}>
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* PÁGINAS PÚBLICAS                                                */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          {/* Página principal */}
          <Route index element={<HomePage />} />
          
          {/* Páginas informativas */}
          <Route path="sobre-nosotros" element={<AboutPage />} />
          <Route path="garantia" element={<WarrantyPage />} />
          <Route path="devoluciones" element={<ReturnsPage />} />
          <Route path="envios" element={<ShippingPage />} />
          <Route path="ofertas" element={<OffersPage />} />
          <Route path="contacto" element={<ContactPage />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* PRODUCTOS - ✅ CORREGIDO                                        */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          <Route path="productos">
            {/* Lista de productos */}
            <Route index element={<ProductsListPage />} />
            
            {/* ✅ Detalle por SLUG (SEO-friendly) */}
            <Route path=":slug" element={<ProductDetailPage />} />
            
            {/* Categorías */}
            <Route path="categoria/:categorySlug" element={<CategoriesPage />} />
          </Route>
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* CATEGORÍAS (Ruta directa alternativa)                          */}
          {/* ────────────────────────────────────────────────────────────── */}
          
          <Route path="categorias" element={<CategoriesPage />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* CART & WISHLIST                                                 */}
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
          {/* RUTAS PRIVADAS                                                  */}
          {/* ────────────────────────────────────────────────────────────── */}
          
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
        {/* RUTAS SIN LAYOUT                                                   */}
        {/* ================================================================== */}
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* AUTENTICACIÓN                                                   */}
        {/* ────────────────────────────────────────────────────────────── */}
        
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register" element={<RegisterPage />} />
        
        {/* ────────────────────────────────────────────────────────────── */}
        {/* ADMIN PANEL                                                     */}
        {/* ────────────────────────────────────────────────────────────── */}
        
        {/* Descomentar cuando existan:
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        */}
        
        {/* ================================================================== */}
        {/* 404 - PÁGINA NO ENCONTRADA                                         */}
        {/* ================================================================== */}
        
        <Route path="*" element={<NotFoundPage />} />
        
      </Routes>
    </Suspense>
  );
}

/**
 * RUTAS DISPONIBLES:
 * - /                                    → HomePage
 * - /productos                           → ProductsListPage
 * - /productos/:slug                     → ProductDetailPage
 * - /productos/categoria/:categorySlug   → CategoriesPage
 * - /categorias                          → CategoriesPage
 * - /contacto                            → ContactPage
 * - /auth/login                          → LoginPage
 * - /auth/register                       → RegisterPage
 * - /*                                   → NotFoundPage
 */