import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, Smartphone, Headphones, Watch, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../../core/hooks/useAuth';
import { useAuthActions } from '../hooks/useAuthActions';
import { loginSchema } from '../schemas/auth.schema';
import { useCartContext } from '../../cart/context/CartContext'; // Importa el contexto

export default function LoginPage() {
  const { syncCartAfterLogin } = useCartContext(); // Extrae la función de sincronización
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role;
      navigate(role === 'admin' || role === 'moderator' ? '/admin' : '/customer', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const { handleLogin, loading, error } = useAuthActions({
    onSuccess: async (result) => {
      if (formik.values.rememberMe) {
        localStorage.setItem('remembered_email', formik.values.email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      await syncCartAfterLogin();

      const role = result.user.role;
      navigate(role === 'admin' || role === 'moderator' ? '/admin' : '/customer', { replace: true });
    },
  });

  const formik = useFormik({
    initialValues: { 
      email: localStorage.getItem('remembered_email') || '', 
      password: '',
      rememberMe: !!localStorage.getItem('remembered_email')
    },
    validationSchema: loginSchema,
    onSubmit: async (values) => {
      await handleLogin({ email: values.email, password: values.password });
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black pointer-events-none" />
      <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
          
          <div className="text-center mb-10">
            <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-6">
              <Zap className="h-10 w-10 text-white fill-white/20" />
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight mb-3">Bienvenido</h2>
            <p className="text-white/50 text-base">Accede a la tecnología que vibra contigo</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-center gap-3">
                <ShieldCheck size={18} /> {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2 ml-1">Correo electrónico</label>
              <input
                name="email"
                type="email"
                value={formik.values.email || ''} 
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-5 py-4 rounded-2xl bg-white/[0.05] border text-white transition-all placeholder:text-white/20 focus:outline-none ${
                  formik.touched.email && formik.errors.email ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'
                }`}
                placeholder="nombre@ejemplo.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2 ml-1">
                <label className="block text-sm font-medium text-white/70">Contraseña</label>
                <Link to="/auth/forgot-password" size={14} className="text-purple-400 text-xs hover:underline">¿Olvidaste tu contraseña?</Link>
              </div>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password || ''}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-5 py-4 rounded-2xl bg-white/[0.05] border text-white transition-all focus:outline-none ${
                    formik.touched.password && formik.errors.password ? 'border-red-500/50' : 'border-white/10 focus:border-purple-500/50'
                  }`}
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formik.values.rememberMe}
                  onChange={formik.handleChange}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  formik.values.rememberMe ? 'bg-purple-600 border-purple-600 shadow-[0_0_10px_rgba(147,51,234,0.4)]' : 'border-white/20 bg-white/5'
                }`}>
                  {formik.values.rememberMe && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <span className="ml-3 text-sm text-white/50 group-hover:text-white/80 transition-colors">Recordar mis datos</span>
              </label>
            </div>

            <div className="pt-2 space-y-4">
              <button
                type="submit"
                disabled={loading || !formik.isValid}
                className="w-full py-4 text-base font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:brightness-110 shadow-lg disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? "Verificando..." : "Ingresar"}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full flex justify-center items-center gap-2 py-4 text-sm font-semibold rounded-2xl text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
              >
                <ArrowLeft size={16} /> Volver a la tienda
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}