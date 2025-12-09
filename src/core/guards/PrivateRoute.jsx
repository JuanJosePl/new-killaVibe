"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"

/**
 * @component PrivateRoute
 * @description Protege rutas que requieren autenticación
 *
 * Comportamiento:
 * - Si usuario autenticado → renderiza children
 * - Si no autenticado → redirige a /auth/login
 * - Si loading → muestra spinner
 * - Preserva la ruta original en state para redirección post-login
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a proteger
 *
 * @example
 * <PrivateRoute>
 *   <ProfilePage />
 * </PrivateRoute>
 */
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir a login con la ruta original
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Si está autenticado, renderizar children
  return <>{children}</>
}
