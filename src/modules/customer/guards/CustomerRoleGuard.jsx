// src/modules/customer/guards/CustomerRoleGuard.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "@/core/hooks/useAuth";

/**
 * @component CustomerRoleGuard
 * @description Guard de ROL específico para Customer Panel
 * 
 * ✅ CORRECCIONES:
 * - NO verifica autenticación (eso lo hace PrivateRoute)
 * - SOLO verifica que el rol sea "customer"
 * - Si es admin/moderator → redirige a /admin
 * - Si es otro rol → redirige a /
 * - Elimina loading redundante
 * 
 * IMPORTANTE: Este guard SIEMPRE debe estar dentro de <PrivateRoute>
 */
export default function CustomerRoleGuard({ children }) {
  const { user, loading } = useAuth();

  // ✅ Esperar a que termine de cargar
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // ✅ Obtener rol del usuario (fallback a 'customer' para compatibilidad)
  const role = user?.role || 'customer';

  // 🚫 Si es admin o moderator → redirigir a panel de admin
  if (role === "admin" || role === "moderator") {
    console.log('[CustomerRoleGuard] Usuario admin/moderator detectado, redirigiendo a /admin');
    return <Navigate to="/admin" replace />;
  }

  // ✅ Si es customer → permitir acceso
  if (role === "customer") {
    return children;
  }

  // ❌ Cualquier otro rol inválido → redirigir a home
  console.warn('[CustomerRoleGuard] Rol inválido:', role);
  return <Navigate to="/" replace />;
}