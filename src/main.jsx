import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

// Estilos globales
import './shared/styles/index.css';

// Componente Principal
import App from './App.jsx';

// Proveedores de Contexto
import { AuthProvider } from './core/providers/AuthProvider';
import { CartProvider } from './modules/cart/context/CartContext.jsx';
import { ProductsProvider } from './modules/products/contexts/ProductsContext.jsx';
import { WishlistProvider } from './modules/wishlist/context/WishlistContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 
      ══════════════════════════════════════════════════════════════════════
      BROWSER ROUTER
      ══════════════════════════════════════════════════════════════════════
      Habilita React Router DOM
      ⚠️ Solo debe existir UNA instancia en toda la app
    */}
    <BrowserRouter future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  }}>
      
      {/* 
        ══════════════════════════════════════════════════════════════════════
        AUTH PROVIDER
        ══════════════════════════════════════════════════════════════════════
        Proporciona contexto de autenticación a toda la app
        Debe estar aquí para envolver TODO (incluyendo router)
      */}
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