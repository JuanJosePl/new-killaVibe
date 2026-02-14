// src/App.jsx
import { Suspense } from "react";
import AppRouter from "./core/router/AppRouter";

import { useEffect } from 'react';
import { useAuth } from './core/hooks/useAuth';

// ============================================================================
// PROVIDERS GLOBALES - ✅ ORDEN CORRECTO
// ============================================================================
import { ThemeProvider } from "./core/providers/ThemeProvider";
import { SearchProvider } from "./modules/search/context/SearchContext";

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from 'react-hot-toast';

/**
 * @component App
 * @description Componente raíz de la aplicación
 *
 * ✅ JERARQUÍA ÓPTIMA DE PROVIDERS
 *
 * main.jsx:
 *   BrowserRouter → AuthProvider → App
 *
 * App.jsx (este archivo):
 *   ThemeProvider → CartProvider → WishlistProvider → ProductsProvider → SearchProvider → AppRouter
 *
 * PRINCIPIOS:
 * - Providers con side effects (fetch) primero
 * - Providers con dependencias externas después
 * - Providers de solo estado al final
 * - AppRouter siempre al final
 * 
 * ✅ MÓDULO ADMIN INTEGRADO:
 * - Rutas admin en AppRouter
 * - AdminLayout con sidebar
 * - Guards AdminRoute protegiendo rutas
 */

// ============================================================================
// LOADING FALLBACK
// ============================================================================
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-lg font-medium animate-pulse">
          Cargando KillaVibes...
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// APP COMPONENT
// ============================================================================
function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      {/* 
        ══════════════════════════════════════════════════════════════════════
        CAPA 1: THEME PROVIDER
        ══════════════════════════════════════════════════════════════════════
        - No tiene side effects
        - Solo maneja estado local (dark/light)
      */}
      <ThemeProvider>
        {/* 
          ══════════════════════════════════════════════════════════════════════
          CAPA 2: CART PROVIDER
          ══════════════════════════════════════════════════════════════════════
          ✅ PRIORIDAD ALTA: Fetch inicial si usuario autenticado
          - API: /api/cart
          - Inicializa una sola vez al montar
        */}
          {/* 
            ══════════════════════════════════════════════════════════════════════
            CAPA 3: WISHLIST PROVIDER
            ══════════════════════════════════════════════════════════════════════
            ✅ PRIORIDAD ALTA: Fetch inicial si usuario autenticado
            - API: /api/wishlist
            - Inicializa una sola vez al montar
          */}
            {/* 
              ══════════════════════════════════════════════════════════════════════
              CAPA 4: PRODUCTS PROVIDER
              ══════════════════════════════════════════════════════════════════════
              ✅ PRIORIDAD MEDIA: Cache de productos
              - No fetch inicial
              - Solo caché y helpers
            */}
              {/* 
                ══════════════════════════════════════════════════════════════════════
                CAPA 5: SEARCH PROVIDER
                ══════════════════════════════════════════════════════════════════════
                ✅ PRIORIDAD BAJA: Solo estado local
                - No fetch inicial
                - Solo maneja queries y resultados temporales
              */}
              <SearchProvider>
                {/* 
                  ══════════════════════════════════════════════════════════════════════
                  ROUTER PRINCIPAL
                  ══════════════════════════════════════════════════════════════════════
                  Todas las rutas de la aplicación (públicas + admin)
                  
                  RUTAS PÚBLICAS:
                  - / → Home
                  - /productos → Lista productos
                  - /productos/:slug → Detalle producto
                  - /auth/login → Login
                  - /auth/register → Register
                  
                  RUTAS ADMIN (protegidas con AdminRoute):
                  - /admin → Dashboard
                  - /admin/users → Gestión usuarios
                  - /admin/products → Gestión productos
                  - /admin/orders → Gestión órdenes
                  - /admin/categories → Gestión categorías
                  - /admin/analytics → Analytics con gráficos
                */}
                <AppRouter />

                {/* 
                  ══════════════════════════════════════════════════════════════════════
                  TOAST NOTIFICATIONS
                  ══════════════════════════════════════════════════════════════════════
                  Sistema de notificaciones global
                */}
                <Toaster position="bottom-right" />
                <ToastContainer
                  position="bottom-right"
                  autoClose={3000}
                  hideProgressBar={false}
                  newestOnTop
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="colored"
                  className="z-[9999]"
                  limit={3}
                />
              </SearchProvider>
      </ThemeProvider>
    </Suspense>
  );

}

export default App;