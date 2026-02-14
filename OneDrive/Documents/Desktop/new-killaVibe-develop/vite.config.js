// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // ============================================================================
  // ALIAS - Para imports más limpios
  // ============================================================================
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@app': path.resolve(__dirname, './src/app'),
      '@components': path.resolve(__dirname, './src/shared/components'),
      '@hooks': path.resolve(__dirname, './src/core/hooks'),
      '@utils': path.resolve(__dirname, './src/shared/lib'),
    }
  },

  // ============================================================================
  // SERVER DEV
  // ============================================================================
  server: {
    port: 5173,
    host: true, // Permite conexiones externas
    open: true, // Abre el navegador automáticamente
    
    // Proxy para desarrollo (opcional, si necesitas evitar CORS)
    proxy: {
      '/api': {
        target: 'https://backend-vibeskilla.onrender.com',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },

  // ============================================================================
  // BUILD OPTIMIZATION
  // ============================================================================
  build: {
    // Sourcemap solo en dev
    sourcemap: false,
    
    // Aumentar límite de advertencia de chunk
    chunkSizeWarningLimit: 1000,
    
    // Optimización de chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendors principales
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI Components
          'ui-vendor': [
            'lucide-react', 
            'framer-motion',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          
          // Charts
          'charts-vendor': ['recharts'],
          
          // Forms
          'forms-vendor': ['react-hook-form', '@hookform/resolvers', 'yup'],
          
          // HTTP
          'http-vendor': ['axios'],
          
          // Toasts
          'toast-vendor': ['react-hot-toast', 'react-toastify'],
        }
      }
    },
    
    // Minificación
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Eliminar console.log en producción
        drop_debugger: true
      }
    }
  },

  // ============================================================================
  // OPTIMIZACIONES
  // ============================================================================
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'axios',
      'lucide-react'
    ]
  },

  // ============================================================================
  // CSS
  // ============================================================================
  css: {
    devSourcemap: true,
  },

  // ============================================================================
  // PREVIEW (para probar build)
  // ============================================================================
  preview: {
    port: 4173,
    host: true,
    open: true
  }
})