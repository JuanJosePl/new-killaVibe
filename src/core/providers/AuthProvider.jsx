import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { authAPI } from '../../modules/auth/api/auth.api';

// ✅ Crear el contexto de autenticación
export const AuthContext = createContext(null);

// ✅ Clave para localStorage (según el contexto global)
const AUTH_STORAGE_KEY = 'killavibes_auth';

/**
 * AuthProvider - Proveedor de contexto de autenticación
 * Sincronizado 100% con el backend según contexto global
 * 
 * Funcionalidades:
 * - Login/Register con tokens JWT (Access 24h + Refresh 7d)
 * - Refresh automático de tokens
 * - Persistencia en localStorage
 * - Protección contra fuerza bruta (5 intentos)
 * - Roles: customer, moderator, admin
 * - Manejo completo de errores del backend
 */
export function AuthProvider({ children }) {
  // ✅ Estados principales
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ✅ Función para guardar en localStorage
  const saveToStorage = useCallback((authData) => {
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  // ✅ Función para limpiar localStorage
  const clearStorage = useCallback(() => {
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  // ✅ Función para cargar de localStorage
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
    return null;
  }, []);

  // ✅ Función para actualizar el estado de autenticación
  const updateAuthState = useCallback((authData) => {
    if (authData && authData.user && authData.token) {
      setUser(authData.user);
      setToken(authData.token);
      setRefreshToken(authData.refreshToken || null);
      setIsAuthenticated(true);
      saveToStorage(authData);
    } else {
      setUser(null);
      setToken(null);
      setRefreshToken(null);
      setIsAuthenticated(false);
      clearStorage();
    }
  }, [saveToStorage, clearStorage]);

  // ===================================================================
  // ✅ 1. REGISTER - POST /api/auth/register
  // ===================================================================
  const register = useCallback(async (userData) => {
    try {
      // Llamada al backend
      const response = await authAPI.register(userData);
      
      // ✅ Respuesta exitosa según contexto: { success: true, data: { token, refreshToken, user } }
      if (response.success && response.data) {
        const authData = {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
        
        updateAuthState(authData);
        
        return { 
          success: true, 
          message: response.message || 'Usuario registrado exitosamente',
          user: response.data.user 
        };
      }
      
      // ✅ Error del backend
      return { 
        success: false, 
        message: response.message || 'Error al registrarse',
        errors: response.errors || []
      };
    } catch (error) {
      console.error('Register error:', error);
      
      // ✅ Manejar errores específicos del backend
      const errorMessage = error.response?.data?.message || 'Error al registrarse';
      const errors = error.response?.data?.errors || [];
      
      // ✅ Error 409: Email duplicado
      if (error.response?.status === 409) {
        return {
          success: false,
          message: 'Ya existe un usuario con este email',
          errors: [{ field: 'email', message: 'Email ya registrado' }]
        };
      }
      
      return { 
        success: false, 
        message: errorMessage,
        errors 
      };
    }
  }, [updateAuthState]);

  // ===================================================================
  // ✅ 2. LOGIN - POST /api/auth/login
  // ===================================================================
  const login = useCallback(async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      
      // ✅ Respuesta exitosa: { success: true, data: { token, refreshToken, user } }
      if (response.success && response.data) {
        const authData = {
          user: response.data.user,
          token: response.data.token,
          refreshToken: response.data.refreshToken
        };
        
        updateAuthState(authData);
        
        return { 
          success: true, 
          message: response.message || 'Login exitoso',
          user: response.data.user 
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Error al iniciar sesión',
        errors: response.errors || []
      };
    } catch (error) {
      console.error('Login error:', error);
      
      const errorMessage = error.response?.data?.message || 'Error al iniciar sesión';
      const status = error.response?.status;
      
      // ✅ Error 401: Credenciales incorrectas
      if (status === 401) {
        return {
          success: false,
          message: 'Email o contraseña incorrectos',
          errors: [{ field: 'credentials', message: 'Credenciales inválidas' }]
        };
      }
      
      // ✅ Error 423: Cuenta bloqueada (5+ intentos fallidos)
      if (status === 423) {
        return {
          success: false,
          message: 'Cuenta bloqueada temporalmente. Intenta en 15 minutos.',
          errors: [{ field: 'account', message: 'Cuenta bloqueada por múltiples intentos fallidos' }]
        };
      }
      
      // ✅ Error 403: Cuenta desactivada
      if (status === 403) {
        return {
          success: false,
          message: 'Cuenta desactivada. Contacta con soporte.',
          errors: [{ field: 'account', message: 'Cuenta inactiva' }]
        };
      }
      
      return { 
        success: false, 
        message: errorMessage,
        errors: error.response?.data?.errors || []
      };
    }
  }, [updateAuthState]);

  // ===================================================================
  // ✅ 3. LOGOUT - POST /api/auth/logout
  // ===================================================================
  const logout = useCallback(async () => {
    try {
      if (token) {
        await authAPI.logout(); // ✅ SIN token - el interceptor lo envía automáticamente
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // ✅ Limpiar estado SIEMPRE, incluso si falla la llamada
      updateAuthState(null);
    }
  }, [token, updateAuthState]);

  // ===================================================================
  // ✅ 4. GET PROFILE - GET /api/auth/profile
  // ===================================================================
  const refreshUserProfile = useCallback(async () => {
    if (!token) {
      return { success: false, message: 'No hay token disponible' };
    }

    try {
      const response = await authAPI.getProfile(); // ✅ SIN token - el interceptor lo envía automáticamente
      
      // ✅ Respuesta exitosa: { success: true, data: { user } }
      if (response.success && response.data) {
        const updatedAuthData = {
          user: response.data.user,
          token,
          refreshToken
        };
        
        updateAuthState(updatedAuthData);
        
        return { 
          success: true, 
          user: response.data.user 
        };
      }
      
      return { success: false, message: 'Error al obtener perfil' };
    } catch (error) {
      console.error('Refresh profile error:', error);
      
      // ✅ Si el token expiró (401), hacer logout
      if (error.response?.status === 401) {
        await logout();
        return { 
          success: false, 
          message: 'Sesión expirada. Por favor inicia sesión nuevamente.' 
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al obtener perfil' 
      };
    }
  }, [token, refreshToken, updateAuthState, logout]);

  // ===================================================================
  // ✅ 5. UPDATE PROFILE - PUT /api/auth/profile
  // ===================================================================
  const updateProfile = useCallback(async (profileData) => {
    if (!token) {
      return { success: false, message: 'No autenticado' };
    }

    try {
      const response = await authAPI.updateProfile(profileData); // ✅ SIN token - el interceptor lo envía automáticamente
      
      // ✅ Respuesta exitosa: { success: true, data: { user } }
      if (response.success && response.data) {
        const updatedAuthData = {
          user: response.data.user,
          token,
          refreshToken
        };
        
        updateAuthState(updatedAuthData);
        
        return { 
          success: true, 
          message: response.message || 'Perfil actualizado exitosamente',
          user: response.data.user 
        };
      }
      
      return { 
        success: false, 
        message: response.message || 'Error al actualizar perfil',
        errors: response.errors || []
      };
    } catch (error) {
      console.error('Update profile error:', error);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al actualizar perfil',
        errors: error.response?.data?.errors || []
      };
    }
  }, [token, refreshToken, updateAuthState]);

  // ===================================================================
  // ✅ 6. REFRESH TOKEN - POST /api/auth/refresh-token
  // ===================================================================
  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) {
      await logout();
      return null;
    }

    try {
      const response = await authAPI.refreshToken(refreshToken);
      
      // ✅ Respuesta exitosa: { success: true, data: { token } }
      if (response.success && response.data) {
        const updatedAuthData = {
          user,
          token: response.data.token,
          refreshToken
        };
        
        updateAuthState(updatedAuthData);
        return response.data.token;
      }
      
      // ✅ Si falla, hacer logout
      await logout();
      return null;
    } catch (error) {
      console.error('Refresh token error:', error);
      
      // ✅ Error 401: Refresh token inválido o expirado
      await logout();
      return null;
    }
  }, [refreshToken, user, updateAuthState, logout]);

  // ===================================================================
  // ✅ INICIALIZACIÓN: Cargar datos de localStorage al montar
  // ===================================================================
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      const storedAuth = loadFromStorage();
      
      if (storedAuth && storedAuth.token) {
        // ✅ Verificar si el token es válido llamando a GET /profile
        try {
          const response = await authAPI.getProfile(); // ✅ SIN token - el interceptor lo envía automáticamente
          
          if (response.success && response.data) {
            // ✅ Token válido, actualizar estado
            updateAuthState({
              user: response.data.user,
              token: storedAuth.token,
              refreshToken: storedAuth.refreshToken
            });
          } else {
            // ✅ Token inválido, limpiar
            clearStorage();
          }
        } catch (error) {
          console.error('Init auth error:', error);
          
          // ✅ Si el error es 401, intentar refresh token
          if (error.response?.status === 401 && storedAuth.refreshToken) {
            try {
              const refreshResponse = await authAPI.refreshToken(storedAuth.refreshToken);
              
              if (refreshResponse.success && refreshResponse.data) {
                updateAuthState({
                  user: storedAuth.user,
                  token: refreshResponse.data.token,
                  refreshToken: storedAuth.refreshToken
                });
              } else {
                clearStorage();
              }
            } catch (refreshError) {
              console.error('Refresh on init error:', refreshError);
              clearStorage();
            }
          } else {
            clearStorage();
          }
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, [loadFromStorage, updateAuthState, clearStorage]);

  // ✅ Valor del contexto exportado
  const value = {
    // Estado
    user,                    // Usuario actual (incluye profile, role, etc.)
    token,                   // Access token (24h)
    refreshToken,            // Refresh token (7d)
    loading,                 // Cargando inicial
    isAuthenticated,         // Boolean: ¿está autenticado?
    
    // Acciones
    login,                   // Función: login(credentials)
    register,                // Función: register(userData)
    logout,                  // Función: logout()
    refreshUserProfile,      // Función: recargar perfil desde backend
    updateProfile,           // Función: updateProfile(profileData)
    refreshAccessToken,      // Función: refresh token automático (usado por axiosInstance)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  
  return context;
}