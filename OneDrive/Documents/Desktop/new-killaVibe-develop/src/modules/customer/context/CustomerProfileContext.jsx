// src/modules/customer/context/CustomerProfileContext.jsx

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as customerAuthApi from '../api/customerAuth.api'; // ✅ Usar API layer

/**
 * @context CustomerProfileContext
 * @description Estado global del perfil del usuario
 * 
 * ✅ ACTUALIZADO: Ahora usa API layer en lugar de customerApiClient directo
 * 
 * Responsabilidades:
 * - Gestión de perfil del usuario
 * - Actualización de datos personales
 * - Cambio de contraseña
 * - Información de sesión
 * - Logout
 * 
 * Contrato Backend:
 * - GET /api/auth/profile (obtener perfil)
 * - PUT /api/auth/profile (actualizar perfil)
 * - POST /api/auth/change-password (cambiar contraseña)
 * - POST /api/auth/logout (cerrar sesión)
 * 
 * Estructura User (backend):
 * {
 *   _id,
 *   email,
 *   profile: { firstName, lastName, phone, avatar },
 *   role,
 *   isActive,
 *   emailVerified,
 *   lastLogin,
 *   createdAt
 * }
 */

const CustomerProfileContext = createContext(null);

export const CustomerProfileProvider = ({ children }) => {
  // Estado principal
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Inicializar perfil al montar
  useEffect(() => {
    if (!initialized) {
      loadProfile();
      setInitialized(true);
    }
  }, [initialized]);

  /**
   * Cargar perfil del usuario autenticado
   * 
   * ✅ ACTUALIZADO: Usa customerAuthApi.getProfile()
   * 
   * @returns {Promise<Object>} Profile
   * @throws {401} No autenticado
   * @throws {404} Usuario no encontrado
   */
  const loadProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Usar API layer
      const user = await customerAuthApi.getProfile();
      
      setProfile(user);
      
      // Guardar userId en localStorage para otros contextos
      if (user._id) {
        localStorage.setItem('userId', user._id);
      }
      
      return user;
    } catch (err) {
      setError(err);
      console.error('[CustomerProfile] Error loading profile:', err);
      
      // Si es 401, limpiar sesión
      if (err.statusCode === 401) {
        handleUnauthorized();
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Actualizar perfil del usuario
   * 
   * ✅ ACTUALIZADO: Usa customerAuthApi.updateProfile()
   * 
   * Campos actualizables:
   * - firstName
   * - lastName
   * - phone
   * 
   * @param {Object} data
   * @param {string} data.firstName - Nombre (opcional)
   * @param {string} data.lastName - Apellido (opcional)
   * @param {string} data.phone - Teléfono (opcional)
   * @returns {Promise<Object>} Profile actualizado
   * @throws {400} Validación fallida
   * @throws {401} No autenticado
   */
  const updateProfile = useCallback(async (data) => {
    // Validaciones cliente
    if (data.firstName && data.firstName.trim().length < 2) {
      throw new Error('El nombre debe tener al menos 2 caracteres');
    }

    if (data.lastName && data.lastName.trim().length < 2) {
      throw new Error('El apellido debe tener al menos 2 caracteres');
    }

    if (data.phone && !/^[0-9\s\-\+()]*$/.test(data.phone)) {
      throw new Error('Teléfono inválido');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Usar API layer
      const user = await customerAuthApi.updateProfile(data);
      
      setProfile(user);
      
      console.log('[CustomerProfile] Profile updated successfully');
      
      return user;
    } catch (err) {
      setError(err);
      console.error('[CustomerProfile] Error updating profile:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ NUEVO: Cambiar contraseña del usuario
   * 
   * Validaciones:
   * - Contraseña actual requerida
   * - Nueva contraseña mínimo 6 caracteres
   * - Confirmación debe coincidir
   * 
   * @param {string} currentPassword - Contraseña actual
   * @param {string} newPassword - Nueva contraseña
   * @param {string} confirmPassword - Confirmación
   * @returns {Promise<Object>} Success result
   * @throws {401} Contraseña actual incorrecta
   * @throws {400} Validación fallida
   */
  const changePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
    // Validaciones cliente
    if (!currentPassword || currentPassword.trim().length === 0) {
      throw new Error('La contraseña actual es requerida');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('La nueva contraseña debe tener al menos 6 caracteres');
    }

    if (newPassword !== confirmPassword) {
      throw new Error('Las contraseñas no coinciden');
    }

    if (currentPassword === newPassword) {
      throw new Error('La nueva contraseña debe ser diferente a la actual');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Usar API layer
      await customerAuthApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword
      });
      
      console.log('[CustomerProfile] Password changed successfully');
      
      return { success: true };
    } catch (err) {
      setError(err);
      console.error('[CustomerProfile] Error changing password:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Cerrar sesión
   * 
   * ✅ ACTUALIZADO: Usa customerAuthApi.logout()
   * 
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // ✅ Llamar al endpoint de logout
      await customerAuthApi.logout();
      
      console.log('[CustomerProfile] Logout successful');
      
      // Limpiar estado local
      handleUnauthorized();
    } catch (err) {
      console.error('[CustomerProfile] Error during logout:', err);
      
      // Incluso si el backend falla, limpiar sesión local
      handleUnauthorized();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ NUEVO: Eliminar cuenta del usuario (soft delete)
   * 
   * ⚠️ REQUIERE IMPLEMENTACIÓN EN BACKEND
   * 
   * @returns {Promise<void>}
   * @throws {401} No autenticado
   */
  const deleteAccount = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Usar API layer
      await customerAuthApi.deleteAccount();
      
      console.log('[CustomerProfile] Account deleted successfully');
      
      // Limpiar sesión después de eliminar
      handleUnauthorized();
    } catch (err) {
      setError(err);
      console.error('[CustomerProfile] Error deleting account:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Manejar sesión no autorizada (401)
   * 
   * ✅ ACTUALIZADO: Limpia la estructura correcta de localStorage
   */
  const handleUnauthorized = useCallback(() => {
    // Limpiar tokens (estructura correcta)
    localStorage.removeItem('killavibes_auth');
    localStorage.removeItem('userId');
    
    // Limpiar estado
    setProfile(null);
    setInitialized(false);
    
    // Redirigir a login
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }, []);

  /**
   * Recargar perfil (útil después de cambios externos)
   */
  const refreshProfile = useCallback(() => {
    return loadProfile();
  }, [loadProfile]);

  /**
   * Verificar si el perfil está completo
   */
  const isProfileComplete = useCallback(() => {
    if (!profile) return false;
    
    return !!(
      profile.profile?.firstName &&
      profile.profile?.lastName &&
      profile.email
    );
  }, [profile]);

  /**
   * Obtener nombre completo
   */
  const getFullName = useCallback(() => {
    if (!profile || !profile.profile) return '';
    
    const { firstName, lastName } = profile.profile;
    return `${firstName || ''} ${lastName || ''}`.trim();
  }, [profile]);

  /**
   * Obtener iniciales
   */
  const getInitials = useCallback(() => {
    if (!profile || !profile.profile) return '?';
    
    const { firstName, lastName } = profile.profile;
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    
    return `${first}${last}` || '?';
  }, [profile]);

  /**
   * Verificar si el usuario es customer
   */
  const isCustomer = useCallback(() => {
    return profile?.role === 'customer';
  }, [profile]);

  /**
   * Obtener días desde registro
   */
  const getDaysSinceRegistration = useCallback(() => {
    if (!profile || !profile.createdAt) return 0;
    
    const registered = new Date(profile.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - registered);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, [profile]);

  /**
   * Verificar si el email está verificado
   */
  const isEmailVerified = useCallback(() => {
    return profile?.emailVerified === true;
  }, [profile]);

  // Valores computados
  const isAuthenticated = !!profile;
  const fullName = getFullName();
  const initials = getInitials();
  const email = profile?.email || '';
  const phone = profile?.profile?.phone || '';
  const avatar = profile?.profile?.avatar || null;
  const userId = profile?._id || null;

  const value = {
    // Estado
    profile,
    isLoading,
    error,
    initialized,
    
    // Valores computados
    isAuthenticated,
    fullName,
    initials,
    email,
    phone,
    avatar,
    userId,
    
    // Métodos
    loadProfile,
    updateProfile,
    changePassword, // ✅ Nuevo
    logout,
    deleteAccount, // ✅ Nuevo
    refreshProfile,
    isProfileComplete,
    getFullName,
    getInitials,
    isCustomer,
    getDaysSinceRegistration,
    isEmailVerified,
  };

  return (
    <CustomerProfileContext.Provider value={value}>
      {children}
    </CustomerProfileContext.Provider>
  );
};

/**
 * Hook para consumir el contexto
 */
export const useCustomerProfile = () => {
  const context = useContext(CustomerProfileContext);
  if (!context) {
    throw new Error('useCustomerProfile must be used within CustomerProfileProvider');
  }
  return context;
};

export default CustomerProfileContext;