// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './shared/styles/index.css';

// ============================================================================
// AUTH PROVIDER
// ============================================================================
import { AuthProvider } from './core/providers/AuthProvider';

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
  }}>
      
      {/* 
        ══════════════════════════════════════════════════════════════════════
        AUTH PROVIDER
        ══════════════════════════════════════════════════════════════════════
        Proporciona contexto de autenticación a toda la app
        Debe estar aquí para envolver TODO (incluyendo router)
      */}
      <AuthProvider>
        
        {/* 
          ══════════════════════════════════════════════════════════════════════
          APP COMPONENT
          ══════════════════════════════════════════════════════════════════════
          Contiene todos los demás providers y el router
        */}
        <App />
        
      </AuthProvider>
      
    </BrowserRouter>
  </StrictMode>
);