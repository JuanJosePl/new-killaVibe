"use client"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"


/**
 * @component AdminRoute
 * @description Protege rutas que requieren rol de admin o moderator
 *
 * Comportamiento:
 * - Si usuario es admin/moderator → renderiza children
 * - Si usuario es customer → redirige a /
 * - Si no autenticado → redirige a /auth/login
 * - Si loading → muestra spinner
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a proteger
 * @param {string[]} [props.allowedRoles=['admin', 'moderator']] - Roles permitidos
 *
 * @example
 * <AdminRoute>
 *   <AdminDashboard />
 * </AdminRoute>
 *
 * <AdminRoute allowedRoles={['admin']}>
 *   <SuperAdminPanel />
 * </AdminRoute>
 */
export const AdminRoute = ({ children, allowedRoles = ["admin", "moderator"] }) => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-lg">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Verificar si el usuario tiene un rol permitido
  const userRole = user?.role || "customer"
  const hasPermission = allowedRoles.includes(userRole)

  // Si no tiene permisos, redirigir a home con mensaje
  if (!hasPermission) {
    return (
      <Navigate
        to="/"
        state={{
          error: "No tienes permisos para acceder a esta sección",
          from: location,
        }}
        replace
      />
    )
  }

  // Si tiene permisos, renderizar children
  return <>{children}</>
}
