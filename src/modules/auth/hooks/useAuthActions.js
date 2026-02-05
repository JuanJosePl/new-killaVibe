// src/modules/auth/hooks/useAuthActions.js

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/hooks/useAuth";
import { syncGuestDataToUser } from "@/core/utils/syncManager";

import { useWishlistContext } from "../../wishlist/context/WishlistContext";
import { syncGuestWishlistToUser } from "../../wishlist/utils/syncGuestWishlistToUser";

/**
 * @hook useAuthActions
 * @description Hook para manejar acciones de autenticación con:
 * - Estados de loading
 * - Manejo de errores
 * - Redirección automática
 * - Callbacks de éxito/error
 *
 * @param {Object} options
 * @param {Function} [options.onSuccess] - Callback ejecutado en éxito
 * @param {Function} [options.onError] - Callback ejecutado en error
 * @param {string} [options.redirectTo] - Ruta de redirección después de éxito
 *
 * @returns {Object} { handleRegister, handleLogin, handleLogout, handleUpdateProfile, loading, error }
 *
 * @example
 * const { handleLogin, loading, error } = useAuthActions({
 *   onSuccess: () => toast.success('Login exitoso'),
 *   redirectTo: '/'
 * });
 */
export const useAuthActions = (options = {}) => {
  const { clearWishlist } = useWishlistContext();

  const { onSuccess, onError, redirectTo } = options;

  const { register, login, logout, updateProfile, user } = useAuth();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * @function handleRegister
   * @description Maneja el proceso de registro
   *
   * @param {Object} userData - { email, password, firstName, lastName, phone? }
   * @returns {Promise<Object>} { success, user?, error? }
   */
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await register(userData);

      if (result.success) {
        // 🆕 Sincronizar datos guest → user (post register)
        try {
          await syncGuestDataToUser({
            syncWishlist: syncGuestWishlistToUser,
            clearWishlist,
            silent: false,
            force: true,
          });
        } catch (error) {
          console.error(
            "[Auth] Error en sincronización post-register (no bloquea registro):",
            error
          );
        }

        // Callback de éxito
        if (onSuccess) {
          onSuccess(result);
        }

        // Redirección
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          // Redirección por defecto según rol
          redirectByRole(result.user);
        }

        return result;
      } else {
        setError(result.error);

        if (onError) {
          onError(result.error);
        }

        return result;
      }
    } catch (err) {
      const errorMessage = err.message || "Error inesperado al registrar";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function handleLogin
   * @description Maneja el proceso de login
   *
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { success, user?, error? }
   */
  const handleLogin = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const result = await login(credentials);

      if (result.success) {
        window.dispatchEvent(new Event("auth-change"));

        // 🆕 Sincronizar datos guest → user (orquestado)
        try {
          await syncGuestDataToUser({
            syncWishlist: syncGuestWishlistToUser,
            clearWishlist,
            silent: false,
            force: true,
          });
        } catch (error) {
          console.error(
            "[Auth] Error en sincronización (no bloquea login):",
            error
          );
        }

        // Callback de éxito
        if (onSuccess) {
          onSuccess(result);
        }

        // Redirección
        if (redirectTo) {
          navigate(redirectTo);
        } else {
          redirectByRole(result.user);
        }

        return result;
      } else {
        setError(result.error);

        if (onError) {
          onError(result.error);
        }

        return result;
      }
    } catch (err) {
      const errorMessage = err.message || "Error inesperado al iniciar sesión";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function handleLogout
   * @description Maneja el proceso de logout
   *
   * @param {string} [redirectPath='/auth/login'] - Ruta de redirección después de logout
   * @returns {Promise<void>}
   */
  const handleLogout = async (redirectPath = "/auth/login") => {
    setLoading(true);
    setError(null);

    try {
      await logout();

      // Callback de éxito
      if (onSuccess) {
        onSuccess({ message: "Sesión cerrada exitosamente" });
      }

      // Redirección
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const errorMessage = err.message || "Error al cerrar sesión";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      // Redirigir de todas formas
      navigate(redirectPath, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function handleUpdateProfile
   * @description Maneja la actualización de perfil
   *
   * @param {Object} profileData - { firstName?, lastName?, phone? }
   * @returns {Promise<Object>} { success, user?, error? }
   */
  const handleUpdateProfile = async (profileData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await updateProfile(profileData);

      if (result.success) {
        // Callback de éxito
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } else {
        setError(result.error);

        if (onError) {
          onError(result.error);
        }

        return result;
      }
    } catch (err) {
      const errorMessage = err.message || "Error al actualizar perfil";
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      }

      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * @function redirectByRole
   * @description Redirige al usuario según su rol
   *
   * @param {Object} userData - Usuario con rol
   */
  // ✅ SIN setTimeout
  const redirectByRole = (userData) => {
    const userRole = userData?.role || "customer";

    if (userRole === "admin" || userRole === "moderator") {
      navigate("/admin", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  };

  return {
    handleRegister,
    handleLogin,
    handleLogout,
    handleUpdateProfile,
    loading,
    error,
    clearError: () => setError(null),
  };
};
