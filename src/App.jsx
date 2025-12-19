// src/App.jsx
import { Suspense } from 'react';
import AppRouter from './core/router/AppRouter';

// ============================================================================
// PROVIDERS GLOBALES
// ============================================================================
import { ThemeProvider } from './core/providers/ThemeProvider';
import { CartProvider } from './modules/cart/context/CartContext';
import { WishlistProvider } from './modules/wishlist/context/WishlistContext';
import { SearchProvider } from './modules/search/context/SearchContext';
import { ProductsProvider } from './modules/products/contexts/ProductsContext'; 
import { CategoriesProvider } from './modules/categories/context/CategoriesContext';

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

/**
 * @component App
 * @description Componente raíz de la aplicación
 * 
 * ESTRUCTURA DE PROVIDERS:
 * ThemeProvider        → Dark/Light mode
 *   └─> CartProvider   → Estado global del carrito
 *       └─> WishlistProvider → Estado global de wishlist
 *           └─> SearchProvider → Estado global de búsquedas
 *               └─> AppRouter → Sistema de rutas
 * 
 * IMPORTANTE:
 * - BrowserRouter está en main.jsx (no duplicar)
 * - AuthProvider está en main.jsx (envuelve todo)
 * - Providers en orden específico (ver documentación)
 * - ToastContainer para notificaciones globales
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
        ══════════════════════════════════════════════════════════════════
        CAPA 1: THEME PROVIDER
        ══════════════════════════════════════════════════════════════════
        Maneja dark/light mode
        Debe estar arriba para aplicar tema antes que cualquier UI
      */}
      <ThemeProvider>
        
        {/* 
          ══════════════════════════════════════════════════════════════════
          CAPA 2: CART PROVIDER
          ══════════════════════════════════════════════════════════════════
          Estado global del carrito
          API: /api/cart/*
        */}

        <ProductsProvider>
          <CategoriesProvider>
        <CartProvider>
          
          {/* 
            ══════════════════════════════════════════════════════════════════
            CAPA 3: WISHLIST PROVIDER
            ══════════════════════════════════════════════════════════════════
            Estado global de lista de deseos
            API: /api/wishlist/*
          */}
          <WishlistProvider>
            
            {/* 
              ══════════════════════════════════════════════════════════════════
              CAPA 4: SEARCH PROVIDER
              ══════════════════════════════════════════════════════════════════
              Estado global de búsquedas
              API: /api/search/*
            */}
            <SearchProvider>
              
              {/* 
                ══════════════════════════════════════════════════════════════════
                ROUTER PRINCIPAL
                ══════════════════════════════════════════════════════════════════
                Todas las rutas de la aplicación
              */}
              <AppRouter />
              
              {/* 
                ══════════════════════════════════════════════════════════════════
                TOAST NOTIFICATIONS
                ══════════════════════════════════════════════════════════════════
                Sistema de notificaciones global
              */}
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
              />
              
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
        </CategoriesProvider>
        </ProductsProvider>
      </ThemeProvider>
    </Suspense>
  );
}

export default App;