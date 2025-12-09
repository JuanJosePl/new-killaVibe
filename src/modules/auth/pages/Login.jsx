// src/modules/auth/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, LogIn, Smartphone, Headphones, Watch, Zap } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import { useAuthActions } from '../hooks/useAuthActions';
import { loginSchema } from '../schemas/auth.schema';

/**
 * @component LoginPage
 * @description Página de inicio de sesión con:
 * - Validación frontend (Yup) que coincide con backend (Joi)
 * - Redirección automática según rol (admin/moderator → /admin, customer → /)
 * - Manejo de errores del backend
 * - UI moderna con glassmorphism
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/';
      const role = user.role || 'customer';
      
      if (role === 'admin' || role === 'moderator') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Hook de acciones con toast manual (puedes agregar tu toast aquí)
  const { handleLogin, loading, error } = useAuthActions({
    onSuccess: (result) => {
      console.log('[LOGIN] Login exitoso:', result.user.email);
      // Aquí puedes agregar toast de éxito si tienes
    },
    onError: (errorMsg) => {
      console.error('[LOGIN] Error:', errorMsg);
      // Aquí puedes agregar toast de error si tienes
    },
  });

  // Formik con validación Yup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      await handleLogin(values);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-white/20 animate-bounce">
          <Smartphone size={32} />
        </div>
        <div className="absolute top-20 right-20 text-white/20 animate-pulse">
          <Headphones size={28} />
        </div>
        <div className="absolute bottom-20 left-20 text-white/20 animate-bounce">
          <Watch size={24} />
        </div>
        <div className="absolute bottom-10 right-10 text-white/20 animate-pulse">
          <Zap size={30} />
        </div>
      </div>

      {/* Card principal */}
      <div className="max-w-md w-full mx-4 p-10 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-white/70 text-lg">
            Ingresa a tu cuenta KillaVibes
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Error general del backend */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps('email')}
              className={`w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                formik.touched.email && formik.errors.email
                  ? 'ring-2 ring-red-500'
                  : 'focus:ring-white/30'
              }`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/60 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...formik.getFieldProps('password')}
              className={`w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                formik.touched.password && formik.errors.password
                  ? 'ring-2 ring-red-500'
                  : 'focus:ring-white/30'
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full flex justify-center items-center py-4 px-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn size={20} />
                <span>Ingresar a mi cuenta</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center text-white/80 hover:text-white transition-all duration-300 group"
            >
              Crear una cuenta nueva
              <svg
                className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/10 mt-6">
          <p className="text-white/50 text-sm">
            Al ingresar, aceptas nuestros{' '}
            <a href="/terminos" className="text-white/70 hover:text-white underline transition-colors">
              Términos de servicio
            </a>
          </p>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}// src/modules/auth/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, LogIn, Smartphone, Headphones, Watch, Zap } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import { useAuthActions } from '../hooks/useAuthActions';
import { loginSchema } from '../schemas/auth.schema';

/**
 * @component LoginPage
 * @description Página de inicio de sesión con:
 * - Validación frontend (Yup) que coincide con backend (Joi)
 * - Redirección automática según rol (admin/moderator → /admin, customer → /)
 * - Manejo de errores del backend
 * - UI moderna con glassmorphism
 */
export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || '/';
      const role = user.role || 'customer';
      
      if (role === 'admin' || role === 'moderator') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  // Hook de acciones con toast manual (puedes agregar tu toast aquí)
  const { handleLogin, loading, error } = useAuthActions({
    onSuccess: (result) => {
      console.log('[LOGIN] Login exitoso:', result.user.email);
      // Aquí puedes agregar toast de éxito si tienes
    },
    onError: (errorMsg) => {
      console.error('[LOGIN] Error:', errorMsg);
      // Aquí puedes agregar toast de error si tienes
    },
  });

  // Formik con validación Yup
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      await handleLogin(values);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-white/20 animate-bounce">
          <Smartphone size={32} />
        </div>
        <div className="absolute top-20 right-20 text-white/20 animate-pulse">
          <Headphones size={28} />
        </div>
        <div className="absolute bottom-20 left-20 text-white/20 animate-bounce">
          <Watch size={24} />
        </div>
        <div className="absolute bottom-10 right-10 text-white/20 animate-pulse">
          <Zap size={30} />
        </div>
      </div>

      {/* Card principal */}
      <div className="max-w-md w-full mx-4 p-10 rounded-3xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-white/70 text-lg">
            Ingresa a tu cuenta KillaVibes
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Error general del backend */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              {...formik.getFieldProps('email')}
              className={`w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                formik.touched.email && formik.errors.email
                  ? 'ring-2 ring-red-500'
                  : 'focus:ring-white/30'
              }`}
              placeholder="tu@email.com"
              disabled={loading}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium text-white/80">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-white/60 hover:text-white transition-colors"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              {...formik.getFieldProps('password')}
              className={`w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 transition-all duration-300 ${
                formik.touched.password && formik.errors.password
                  ? 'ring-2 ring-red-500'
                  : 'focus:ring-white/30'
              }`}
              placeholder="••••••••"
              disabled={loading}
            />
            {formik.touched.password && formik.errors.password && (
              <p className="mt-2 text-sm text-red-400">{formik.errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full flex justify-center items-center py-4 px-4 text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Iniciando sesión...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <LogIn size={20} />
                <span>Ingresar a mi cuenta</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-white/60">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <Link
              to="/auth/register"
              className="inline-flex items-center text-white/80 hover:text-white transition-all duration-300 group"
            >
              Crear una cuenta nueva
              <svg
                className="ml-1 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center pt-6 border-t border-white/10 mt-6">
          <p className="text-white/50 text-sm">
            Al ingresar, aceptas nuestros{' '}
            <a href="/terminos" className="text-white/70 hover:text-white underline transition-colors">
              Términos de servicio
            </a>
          </p>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}