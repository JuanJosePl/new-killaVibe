// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './shared/styles/index.css';

// IMPORTACIONES NECESARIAS
import { AuthProvider } from './core/providers/AuthProvider';
import { CartProvider } from './modules/cart/context/CartContext.jsx';
import { ProductsProvider } from './modules/products/contexts/ProductsContext.jsx'; // 
import { WishlistProvider } from './modules/wishlist/context/WishlistContext.jsx'; //

/**
 * @file main.jsx
 * @description Entry point de la aplicación
 * 
 * ESTRUCTURA DE JERARQUÃA:
 * 
 * StrictMode
 *   └─> BrowserRouter (⚠️ ÃNICO - no duplicar)
 *       └─> AuthProvider (autenticación global)
 *           └─> App
 *               └─> ThemeProvider
 *                   └─> CartProvider
 *                       └─> WishlistProvider
 *                           └─> SearchProvider
 *                               └─> AppRouter
 *                                   └─> Routes
 * 
 * IMPORTANTE:
 * - BrowserRouter SOLO aquí (no en App.jsx ni AppRouter.jsx)
 * - AuthProvider debe envolver App para que todas las rutas tengan acceso
 * - Otros providers están en App.jsx
 */

// src/main.jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ProductsProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </ProductsProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);