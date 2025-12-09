// src/modules/auth/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, UserPlus, CheckCircle, Smartphone, Headphones, Watch, Zap } from 'lucide-react';
import { useAuthActions } from '../hooks/useAuthActions';
import { registerSchema, validatePasswordStrength, getPasswordStrengthColor } from '../schemas/auth.schema';

/**
 * @component RegisterPage
 * @description Página de registro con:
 * - Validación frontend (Yup) que coincide exactamente con backend (Joi)
 * - Indicador de fortaleza de contraseña en tiempo real
 * - Redirección automática después de registro exitoso
 * - Manejo de errores del backend
 */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  const navigate = useNavigate();

  const { handleRegister, loading, error } = useAuthActions({
    onSuccess: () => {
      console.log('[REGISTER] Registro exitoso');
    },
    onError: (errorMsg) => {
      console.error('[REGISTER] Error:', errorMsg);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      await handleRegister(values);
    },
  });

  // Actualizar fortaleza de contraseña en tiempo real
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    formik.handleChange(e);
    
    const strength = validatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden py-8">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-8 text-white/15">
          <Smartphone size={24} />
        </div>
        <div className="absolute top-12 right-12 text-white/15">
          <Headphones size={20} />
        </div>
        <div className="absolute bottom-12 left-12 text-white/15">
          <Watch size={18} />
        </div>
        <div className="absolute bottom-8 right-8 text-white/15">
          <Zap size={22} />
        </div>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-lg mx-4 p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Únete a KillaVibes
          </h2>
          <p className="text-white/60 text-sm">
            Crea tu cuenta en segundos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Error general del backend */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-xs font-medium text-white/80 mb-1">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                {...formik.getFieldProps('firstName')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="Juan"
                disabled={loading}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-xs font-medium text-white/80 mb-1">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                {...formik.getFieldProps('lastName')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="Pérez"
                disabled={loading}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...formik.getFieldProps('email')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.email && formik.errors.email
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-xs font-medium text-white/80 mb-1">
                Teléfono <span className="text-white/50">(opcional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                {...formik.getFieldProps('phone')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.phone && formik.errors.phone
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="+57 300 123 4567"
                disabled={loading}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-white/80">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white transition-colors text-xs"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...formik.getFieldProps('password')}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.password && formik.errors.password
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.password}</p>
              )}

              {/* Password Strength Meter */}
              {formik.values.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Seguridad</span>
                    <span>{passwordStrength.score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {passwordStrength.feedback.filter(f => f.startsWith('✓')).map((item, i) => (
                      <div key={i} className="flex items-center text-[10px] text-green-400">
                        <CheckCircle size={10} className="mr-1" />
                        <span>{item.replace('✓ ', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-4"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando cuenta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus size={16} />
                <span>Crear mi cuenta</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-white/50">¿Ya tienes cuenta?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-white/70 hover:text-white transition-all duration-300 group text-sm"
            >
              Iniciar sesión
              <svg
                className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform"
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

        {/* Benefits */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-white font-semibold mb-3 text-center text-sm">
            Beneficios incluidos
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="text-white/60">
              <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <p className="text-xs">Ofertas</p>
            </div>
            <div className="text-white/60">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-400" />
              <p className="text-xs">Rápido</p>
            </div>
            <div className="text-white/60">
              <Watch className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <p className="text-xs">Seguimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}// src/modules/auth/pages/Register.jsx

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, UserPlus, CheckCircle, Smartphone, Headphones, Watch, Zap } from 'lucide-react';
import { useAuthActions } from '../hooks/useAuthActions';
import { registerSchema, validatePasswordStrength, getPasswordStrengthColor } from '../schemas/auth.schema';

/**
 * @component RegisterPage
 * @description Página de registro con:
 * - Validación frontend (Yup) que coincide exactamente con backend (Joi)
 * - Indicador de fortaleza de contraseña en tiempo real
 * - Redirección automática después de registro exitoso
 * - Manejo de errores del backend
 */
export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  
  const navigate = useNavigate();

  const { handleRegister, loading, error } = useAuthActions({
    onSuccess: () => {
      console.log('[REGISTER] Registro exitoso');
    },
    onError: (errorMsg) => {
      console.error('[REGISTER] Error:', errorMsg);
    },
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      await handleRegister(values);
    },
  });

  // Actualizar fortaleza de contraseña en tiempo real
  const handlePasswordChange = (e) => {
    const password = e.target.value;
    formik.handleChange(e);
    
    const strength = validatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-black relative overflow-hidden py-8">
      {/* Partículas flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-8 left-8 text-white/15">
          <Smartphone size={24} />
        </div>
        <div className="absolute top-12 right-12 text-white/15">
          <Headphones size={20} />
        </div>
        <div className="absolute bottom-12 left-12 text-white/15">
          <Watch size={18} />
        </div>
        <div className="absolute bottom-8 right-8 text-white/15">
          <Zap size={22} />
        </div>
      </div>

      {/* Card principal */}
      <div className="w-full max-w-lg mx-4 p-8 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Únete a KillaVibes
          </h2>
          <p className="text-white/60 text-sm">
            Crea tu cuenta en segundos
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Error general del backend */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-white text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-xs font-medium text-white/80 mb-1">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                {...formik.getFieldProps('firstName')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.firstName && formik.errors.firstName
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="Juan"
                disabled={loading}
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-xs font-medium text-white/80 mb-1">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                {...formik.getFieldProps('lastName')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.lastName && formik.errors.lastName
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="Pérez"
                disabled={loading}
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.lastName}</p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-1">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                {...formik.getFieldProps('email')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.email && formik.errors.email
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="tu@email.com"
                disabled={loading}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="md:col-span-2">
              <label htmlFor="phone" className="block text-xs font-medium text-white/80 mb-1">
                Teléfono <span className="text-white/50">(opcional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                {...formik.getFieldProps('phone')}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.phone && formik.errors.phone
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="+57 300 123 4567"
                disabled={loading}
              />
              {formik.touched.phone && formik.errors.phone && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-white/80">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white transition-colors text-xs"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                {...formik.getFieldProps('password')}
                onChange={handlePasswordChange}
                className={`w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 transition-all duration-300 text-sm ${
                  formik.touched.password && formik.errors.password
                    ? 'ring-1 ring-red-500'
                    : 'focus:ring-white/30'
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-red-400">{formik.errors.password}</p>
              )}

              {/* Password Strength Meter */}
              {formik.values.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Seguridad</span>
                    <span>{passwordStrength.score}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${getPasswordStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {passwordStrength.feedback.filter(f => f.startsWith('✓')).map((item, i) => (
                      <div key={i} className="flex items-center text-[10px] text-green-400">
                        <CheckCircle size={10} className="mr-1" />
                        <span>{item.replace('✓ ', '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formik.isValid}
            className="w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-4"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando cuenta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus size={16} />
                <span>Crear mi cuenta</span>
              </div>
            )}
          </button>

          {/* Divider */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-white/50">¿Ya tienes cuenta?</span>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-white/70 hover:text-white transition-all duration-300 group text-sm"
            >
              Iniciar sesión
              <svg
                className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform"
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

        {/* Benefits */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-white font-semibold mb-3 text-center text-sm">
            Beneficios incluidos
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="text-white/60">
              <Zap className="h-4 w-4 mx-auto mb-1 text-yellow-400" />
              <p className="text-xs">Ofertas</p>
            </div>
            <div className="text-white/60">
              <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-400" />
              <p className="text-xs">Rápido</p>
            </div>
            <div className="text-white/60">
              <Watch className="h-4 w-4 mx-auto mb-1 text-blue-400" />
              <p className="text-xs">Seguimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efectos de brillo */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}