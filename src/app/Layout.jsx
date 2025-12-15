// src/app/Layout.jsx
import { Outlet } from 'react-router-dom';
import Header from '../shared/components/layout/header';
import Footer from '../shared/components/layout/footer';

/**
 * @component Layout
 * @description Layout principal de la aplicación
 * 
 * ESTRUCTURA:
 * - Header (navegación superior)
 * - Outlet (donde se renderizan las páginas)
 * - Footer (pie de página)
 * 
 * IMPORTANTE:
 * - Este componente se usa en AppRouter como Route element
 * - Todas las rutas hijas se renderizan en <Outlet />
 * - Header y Footer son compartidos por todas las páginas
 * 
 * USO EN AppRouter:
 * <Route element={<Layout />}>
 *   <Route path="/" element={<HomePage />} />
 *   <Route path="contacto" element={<ContactPage />} />
 *   ...
 * </Route>
 */
export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* ================================================================ */}
      {/* HEADER - Navegación Superior                                    */}
      {/* ================================================================ */}
      <Header />
      
      {/* ================================================================ */}
      {/* MAIN CONTENT - Outlet para páginas                              */}
      {/* ================================================================ */}
      <main className="flex-1">
        {/* 
          <Outlet /> renderiza la página correspondiente a la ruta actual
          Ejemplo:
          - Si estamos en "/" → renderiza <HomePage />
          - Si estamos en "/contacto" → renderiza <ContactPage />
          - Si estamos en "/productos" → renderiza <ProductsListPage />
        */}
        <Outlet />
      </main>
      
      {/* ================================================================ */}
      {/* FOOTER - Pie de Página                                          */}
      {/* ================================================================ */}
      <Footer />
    </div>
  );
}