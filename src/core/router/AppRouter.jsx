// src/core/router/AppRouter.jsx

import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// ============================================================================
// GUARDS
// ============================================================================
import { PrivateRoute } from '../guards/PrivateRoute';
import { AdminRoute } from '../guards/AdminRoute';

// ============================================================================
// LAYOUTS
// ============================================================================
import Layout from '../../app/Layout'; // Layout público (Header + Footer)
import AdminLayout from '../../modules/admin/layout/AdminLayout'; // Layout admin (Sidebar)
import CustomerLayout from '../../modules/customer/layout/CustomerLayout'
import CustomerProviders  from '../../modules/customer/providers/CustomerProviders';

// ============================================================================
// HOOKS
// ============================================================================
import { useScrollToTop } from '../hooks/useScroll';
import WishlistPage from '../../modules/wishlist/pages/WishlistPage';

/**
 * @component AppRouter
 * @description Router principal de la aplicación
 * 
 * ✅ ESTRUCTURA COMPLETA:
 * - Rutas públicas con Layout (Header + Footer)
 * - Rutas de autenticación sin Layout
 * - Rutas admin con AdminLayout (Sidebar) protegidas con AdminRoute
 * - Lazy loading en todas las páginas
 * - Scroll to top automático
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
// LAZY LOADED PAGES - PÚBLICAS
// ============================================================================

const HomePage = lazy(() => import('../../app/PaginaPrincipal'));
const AboutPage = lazy(() => import('../../app/sobre-nosotros/SobreNosotros'));
const WarrantyPage = lazy(() => import('../../app/garantia/Garantia'));
const ReturnsPage = lazy(() => import('../../app/devoluciones/Devoluciones'));
const ShippingPage = lazy(() => import('../../app/envios/Envios'));
const NotFoundPage = lazy(() => import('../../app/PaginaNoEncontrada'));
const OffersPage = lazy(() => import('../../app/ofertas/Ofertas'));
const CookiesPage = lazy(() => import('../../app/cookies/Cookies'));
const FAQPage = lazy(() => import('../../app/FAQ/FAQ'));
const PrivacidadPage = lazy(() => import('../../app/privacidad/Privacidad'));
const TerminosPage = lazy(() => import('../../app/terminos/Terminos'));

// Productos
const ProductsListPage = lazy(() => import('../../modules/products/pages/ProductosLista'));
const ProductDetailPage = lazy(() => import('../../modules/products/pages/detalle/ProductoDetalle'));

// Categorías
const CategoriesPage = lazy(() => import('../../modules/categories/pages/CategoriesPage'));

const CategoryDetailPage = lazy(() => import('../../modules/categories/pages/CategoryDetailPage'));

const CartPage = lazy(() => import('../../modules/cart/pages/CartPage'))

const WishlistPage = lazy (() => import('../../modules/wishlist/pages/WishlistPage'))

// Contact (src/modules/contact/pages/)

const ContactPage  = lazy(() => import('../../modules/contact/pages/Contacto'));


// ────────────────────────────────────────────────────────────────────────────
// MÓDULO AUTH (src/modules/auth/pages/)
// ────────────────────────────────────────────────────────────────────────────

// Auth
const LoginPage = lazy(() => import('../../modules/auth/pages/Login'));
const RegisterPage = lazy(() => import('../../modules/auth/pages/Register'));



// ============================================================================
// LAZY LOADED PAGES - CUSTOMER
// ============================================================================

const CustomerDashboardPage = lazy(() => import('../../modules/customer/pages/CustomerDashboardPage'));
const CustomerCartPage = lazy(() => import('../../modules/customer/pages/CustomerCartPage'));
const CustomerCategoriesPage = lazy(() => import('../../modules/customer/pages/CustomerCategoriesPage'));
const CustomerCategoryDetailPage = lazy(() => import('../../modules/customer/pages/CustomerCategoryDetailPage'));
const CustomerContactPage = lazy(() => import('../../modules/customer/pages/CustomerContactPage'));
const CustomerOrdersPage = lazy(() => import('../../modules/customer/pages/CustomerOrdersPage'));
const CustomerOrderDetailPage = lazy(() => import('../../modules/customer/pages/CustomerOrderDetailPage'));
const CustomerProductsPage = lazy(() => import('../../modules/customer/pages/CustomerProductsPage'));
const CustomerProductDetailPage = lazy(() => import('../../modules/customer/pages/CustomerProductDetailPage'));
const CustomerProfilePage = lazy(() => import('../../modules/customer/pages/CustomerProfilePage'));
const CustomerReviewsPage = lazy(() => import('../../modules/customer/pages/CustomerReviewsPage'));
const CustomerWishlistPage = lazy(() => import('../../modules/customer/pages/CustomerWishlistPage'));





// ============================================================================
// LAZY LOADED PAGES - ADMIN
// ============================================================================

const AdminDashboard = lazy(() => import('../../modules/admin/pages/Dashboard'));
const UsersList = lazy(() => import('../../modules/admin/pages/Users/UsersList'));
const UserDetails = lazy(() => import('../../modules/admin/pages/Users/UserDetails'));
const ProductsList = lazy(() => import('../../modules/admin/pages/Products/ProductsList'));
const ProductForm = lazy(() => import('../../modules/admin/pages/Products/ProductForm'));
const CategoriesList = lazy(() => import('../../modules/admin/pages/Categories/CategoriesList'));
const OrdersList = lazy(() => import('../../modules/admin/pages/Orders/OrdersList'));
const OrderDetails = lazy(() => import('../../modules/admin/pages/Orders/OrderDetails'));
const AnalyticsDashboard = lazy(() => import('../../modules/admin/pages/Analytics/AnalyticsDashboard'));
const AdminContactPage = lazy (() => import('../../modules/admin/pages/Contact/ContactPage'))

// ============================================================================
// APP ROUTER COMPONENT
// ============================================================================

export default function AppRouter() {
  useScrollToTop();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        
        {/* ================================================================== */}
        {/* RUTAS PÚBLICAS CON LAYOUT (Header + Footer)                       */}
        {/* ================================================================== */}
        
        <Route element={<Layout />}>
          
          {/* Página principal */}
          <Route index element={<HomePage />} />
          
          {/* Páginas informativas */}
          <Route path="sobre-nosotros" element={<AboutPage />} />
          <Route path="garantia" element={<WarrantyPage />} />
          <Route path="devoluciones" element={<ReturnsPage />} />
          <Route path="envios" element={<ShippingPage />} />
          <Route path="ofertas" element={<OffersPage />} />
          <Route path="contacto" element={<ContactPage />} />
          <Route path="cookies" element={<CookiesPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacidad" element={<PrivacidadPage />} />
          <Route path="terminos" element={<TerminosPage />} />
          
          {/* Productos */}
          <Route path="productos">
            <Route index element={<ProductsListPage />} />
            <Route path=":slug" element={<ProductDetailPage />} />
            
          </Route>
          
          {/* Categorías */}
          <Route path="categorias/:categorySlug" element={<CategoryDetailPage />} />
          <Route path="categorias" element={<CategoriesPage />} />

          {/* Carrito */}
          <Route path="carrito" element={<CartPage />} />

          {/* WishList */}
          <Route path="lista-deseos" element={<WishlistPage/>} />

        </Route>
        
        {/* ================================================================== */}
        {/* RUTAS DE AUTENTICACIÓN (Sin Layout)                               */}
        {/* ================================================================== */}
        
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register" element={<RegisterPage />} />
        

{/* ================================================================== */}
{/* RUTAS CUSTOMER (Encapsuladas con Prefijo)                         */}
{/* ================================================================== */}
<Route 
  path="customer" // Prefijo base: /customer
  element={
    <PrivateRoute>
      <CustomerProviders> 
        <CustomerLayout /> 
      </CustomerProviders>
    </PrivateRoute>
  } 
>
  {/* Index: /customer */}
  <Route index element={<CustomerDashboardPage />} />
  
  {/* Perfil y Utilidades: /customer/profile, etc. */}
  <Route path="profile" element={<CustomerProfilePage />} />
  <Route path="cart" element={<CustomerCartPage />} />
  <Route path="wishlist" element={<CustomerWishlistPage />} />
  <Route path="reviews" element={<CustomerReviewsPage />} />
  <Route path="contact" element={<CustomerContactPage />} />
  
  {/* Gestión de Pedidos: /customer/orders/ */}
  <Route path="orders">
    <Route index element={<CustomerOrdersPage />} />
    <Route path=":id" element={<CustomerOrderDetailPage />} />
  </Route>

  {/* Navegación Protegida: /customer/categories/ */}
  <Route path="categories">
    <Route index element={<CustomerCategoriesPage />} />
    <Route path=":categorySlug" element={<CustomerCategoryDetailPage />} />
  </Route>

  {/* Productos: /customer/products/ */}
  <Route path="products">
    <Route index element={<CustomerProductsPage />} />
    <Route path=":slug" element={<CustomerProductDetailPage />} />
  </Route>
</Route>



        {/* ================================================================== */}
        {/* RUTAS ADMIN (Con AdminLayout + AdminRoute Guard)                  */}
        {/* ================================================================== */}
        
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          {/* Dashboard principal */}
          <Route index element={<AdminDashboard />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* USERS MANAGEMENT                                                */}
          {/* ────────────────────────────────────────────────────────────── */}
          

          <Route path="users">
            <Route index element={<UsersList />} />
            <Route path=":id" element={<UserDetails />} />
          </Route>
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* PRODUCTS MANAGEMENT                                             */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="products">
            <Route index element={<ProductsList />} />
            <Route path="new" element={<ProductForm />} />
            <Route path="edit/:id" element={<ProductForm />} />
          </Route>
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* CATEGORIES MANAGEMENT                                           */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="categories" element={<CategoriesList />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* ORDERS MANAGEMENT                                               */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="orders">
            <Route index element={<OrdersList />} />
            <Route path=":id" element={<OrderDetails />} />
          </Route>

          {/* ────────────────────────────────────────────────────────────── */}
          {/* MENSAJES                                                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="contact" element={<AdminContactPage />} />

          {/* ────────────────────────────────────────────────────────────── */}
          {/* ANALYTICS                                                       */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="analytics" element={<AnalyticsDashboard />} />
          
          {/* ────────────────────────────────────────────────────────────── */}
          {/* SETTINGS (Placeholder)                                          */}
          {/* ────────────────────────────────────────────────────────────── */}
          <Route path="settings" element={
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuración
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Página en construcción
              </p>
            </div>
          } />
        </Route>
        
        {/* ================================================================== */}
        {/* 404 - PÁGINA NO ENCONTRADA                                         */}
        {/* ================================================================== */}
        
        <Route path="*" element={<NotFoundPage />} />
        
      </Routes>
    </Suspense>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * MAPA DE RUTAS COMPLETO
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * RUTAS PÚBLICAS (con Layout):
 * ─────────────────────────────────────────────────────────────────────────
 * GET  /                                    → HomePage
 * GET  /productos                           → ProductsListPage
 * GET  /productos/:slug                     → ProductDetailPage
 * GET  /productos/categoria/:categorySlug   → CategoriesPage
 * GET  /categorias                          → CategoriesPage
 * GET  /contacto                            → ContactPage
 * GET  /sobre-nosotros                      → AboutPage
 * GET  /garantia                            → WarrantyPage
 * GET  /devoluciones                        → ReturnsPage
 * GET  /envios                              → ShippingPage
 * GET  /ofertas                             → OffersPage
 * 
 * RUTAS AUTH (sin Layout):
 * ─────────────────────────────────────────────────────────────────────────
 * GET  /auth/login                          → LoginPage
 * GET  /auth/register                       → RegisterPage
 * 
 * RUTAS ADMIN (con AdminLayout, protegidas):
 * ─────────────────────────────────────────────────────────────────────────
 * GET  /admin                               → AdminDashboard
 * GET  /admin/users                         → UsersList
 * GET  /admin/users/:id                     → UserDetails
 * GET  /admin/products                      → ProductsList
 * GET  /admin/products/new                  → ProductForm (crear)
 * GET  /admin/products/edit/:id             → ProductForm (editar)
 * GET  /admin/categories                    → CategoriesList
 * GET  /admin/orders                        → OrdersList
 * GET  /admin/orders/:id                    → OrderDetails
 * GET  /admin/analytics                     → AnalyticsDashboard
 * GET  /admin/settings                      → Settings (placeholder)
 * 
 * 404:
 * ─────────────────────────────────────────────────────────────────────────
 * GET  /*                                   → NotFoundPage
 */