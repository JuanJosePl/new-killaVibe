// src/core/router/AppRouter.jsx

import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import { PrivateRoute } from "../guards/PrivateRoute";
import { AdminRoute } from "../guards/AdminRoute";

import Layout from "../../pages/Layout";
import AdminLayout from "../../modules/admin/layout/AdminLayout";
import CustomerLayout from "../../modules/panel/layout/CustomerLayout";
//import CustomerProviders from "../../modules/panel/providers/CustomerProviders";

import { useScrollToTop } from "../hooks/useScroll";

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

const HomePage = lazy(() => import("../../pages/PaginaPrincipal"));
const AboutPage = lazy(() => import("../../pages/sobre-nosotros/SobreNosotros"));
const WarrantyPage = lazy(() => import("../../pages/legal/Garantia"));
const ReturnsPage = lazy(() => import("../../pages/legal/Devoluciones"));
const ShippingPage = lazy(() => import("../../pages/legal/Envios"));
const NotFoundPage = lazy(() => import("../../pages/PaginaNoEncontrada"));
const OffersPage = lazy(() => import("../../modules/products/pages/ofertas/Ofertas"));
const CookiesPage = lazy(() => import("../../pages/legal/Cookies"));
const FAQPage = lazy(() => import("../../pages/FAQ/FAQ"));
const PrivacidadPage = lazy(() => import("../../pages/legal/Privacidad"));
const TerminosPage = lazy(() => import("../../pages/legal/Terminos"));

const ProductsListPage = lazy(() =>
  import("../../modules/products/pages/ProductosLista")
);
const ProductDetailPage = lazy(() =>
  import("../../modules/products/pages/detalle/ProductoDetalle")
);

const CheckoutPage = lazy(() => import('../../modules//checkout/Checkout'));

const CategoriesPage = lazy(() =>
  import("../../modules/categories/pages/CategoriesPage")
);
const CategoryDetailPage = lazy(() =>
  import("../../modules/categories/pages/CategoryDetailPage")
);

const CartPage = lazy(() => import("../../modules/cart/pages/CartPage"));

const PublicWishlistPage = lazy(() =>
  import("../../modules/wishlist/pages/WishlistPage")
);

const ContactPage = lazy(() => import("../../modules/contact/pages/Contacto"));

const LoginPage = lazy(() => import("../../modules/auth/pages/Login"));
const RegisterPage = lazy(() => import("../../modules/auth/pages/Register"));

// const CustomerDashboardPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerDashboardPage")
// );
// const CustomerCartPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerCartPage")
// );
// const CustomerCategoriesPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerCategoriesPage")
// );
// const CustomerCategoryDetailPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerCategoryDetailPage")
// );
// const CustomerContactPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerContactPage")
// );
// const CustomerOrdersPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerOrdersPage")
// );
// const CustomerOrderDetailPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerOrderDetailPage")
// );
// const CustomerProductsPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerProductsPage")
// );
// const CustomerProductDetailPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerProductDetailPage")
// );
// const CustomerProfilePage = lazy(() =>
//   import("../../modules/customer/pages/CustomerProfilePage")
// );
// const CustomerReviewsPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerReviewsPage")
// );
// const CustomerWishlistPage = lazy(() =>
//   import("../../modules/customer/pages/CustomerWishlistPage")
// );

const AdminDashboard = lazy(() =>
  import("../../modules/admin/pages/Dashboard")
);
const UsersList = lazy(() =>
  import("../../modules/admin/pages/Users/UsersList")
);
const UserDetails = lazy(() =>
  import("../../modules/admin/pages/Users/UserDetails")
);
const ProductsList = lazy(() =>
  import("../../modules/admin/pages/Products/ProductsList")
);
const ProductForm = lazy(() =>
  import("../../modules/admin/pages/Products/ProductForm")
);
const CategoriesList = lazy(() =>
  import("../../modules/admin/pages/Categories/CategoriesList")
);
const OrdersList = lazy(() =>
  import("../../modules/admin/pages/Orders/OrdersList")
);
const OrderDetails = lazy(() =>
  import("../../modules/admin/pages/Orders/OrderDetails")
);
const AnalyticsDashboard = lazy(() =>
  import("../../modules/admin/pages/Analytics/AnalyticsDashboard")
);
const AdminContactPage = lazy(() =>
  import("../../modules/admin/pages/Contact/ContactPage")
);

export default function AppRouter() {
  useScrollToTop();

  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />

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

          <Route path="productos">
            <Route index element={<ProductsListPage />} />
            <Route path=":slug" element={<ProductDetailPage />} />
          </Route>

          <Route path="/categorias" element={<CategoriesPage />} />
          <Route
            path="/categorias/:categorySlug"
            element={<CategoryDetailPage />}
          />

          <Route path="carrito" element={<CartPage />} />

          <Route path="lista-deseos" element={<PublicWishlistPage />} />

          {/* Checkout - NUEVA RUTA */}
          <Route path="checkout" element={<CheckoutPage />} />


        </Route>

        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register" element={<RegisterPage />} />

        {/* <Route
          path="customer"
          element={
            <PrivateRoute>
              <CustomerProviders>
                <CustomerLayout />
              </CustomerProviders>
            </PrivateRoute>
          }
        >
          <Route index element={<CustomerDashboardPage />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="cart" element={<CustomerCartPage />} />
          <Route path="wishlist" element={<CustomerWishlistPage />} />
          <Route path="reviews" element={<CustomerReviewsPage />} />
          <Route path="contact" element={<CustomerContactPage />} />

          <Route path="orders">
            <Route index element={<CustomerOrdersPage />} />
            <Route path=":id" element={<CustomerOrderDetailPage />} />
          </Route>

          <Route path="categories">
            <Route index element={<CustomerCategoriesPage />} />
            <Route path=":slug" element={<CustomerCategoryDetailPage />} />
          </Route>

          <Route path="products">
            <Route index element={<CustomerProductsPage />} />
            <Route path=":slug" element={<CustomerProductDetailPage />} />
          </Route>
        </Route> */}

        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />

          <Route path="users">
            <Route index element={<UsersList />} />
            <Route path=":id" element={<UserDetails />} />
          </Route>

          <Route path="products">
            <Route index element={<ProductsList />} />
            <Route path="new" element={<ProductForm />} />
            <Route path="edit/:id" element={<ProductForm />} />
          </Route>

          <Route path="categories" element={<CategoriesList />} />

          <Route path="orders">
            <Route index element={<OrdersList />} />
            <Route path=":id" element={<OrderDetails />} />
          </Route>

          <Route path="contact" element={<AdminContactPage />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
