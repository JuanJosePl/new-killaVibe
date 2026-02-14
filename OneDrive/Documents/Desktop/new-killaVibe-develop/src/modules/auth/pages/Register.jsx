import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { Eye, EyeOff, UserPlus, CheckCircle, Smartphone, Headphones, Watch, Zap, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useAuthActions } from '../hooks/useAuthActions';
import { registerSchema, validatePasswordStrength, getPasswordStrengthColor } from '../schemas/auth.schema';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] });
  const navigate = useNavigate();

  const { handleRegister, loading, error } = useAuthActions({
    onSuccess: () => navigate('/customer', { replace: true }),
  });

  const formik = useFormik({
    initialValues: { email: '', password: '', firstName: '', lastName: '', phone: '' },
    validationSchema: registerSchema,
    onSubmit: async (values) => await handleRegister(values),
  });

  const handlePasswordChange = (e) => {
    formik.handleChange(e);
    setPasswordStrength(validatePasswordStrength(e.target.value));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] relative overflow-hidden py-12">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-black pointer-events-none" />
      <div className="absolute -top-[10%] -right-[10%] w-[45%] h-[45%] bg-purple-600/15 blur-[120px] rounded-full" />
      <div className="absolute -bottom-[10%] -left-[10%] w-[45%] h-[45%] bg-blue-600/15 blur-[120px] rounded-full" />

      <div className="max-w-xl w-full mx-4 relative z-10">
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 mb-4">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Únete a KillaVibes</h2>
            <p className="text-white/50 text-sm">Crea tu cuenta y empieza a vibrar con lo mejor</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex items-center gap-3">
                <ShieldCheck size={18} /> {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1 uppercase">Nombre</label>
                <input
                  name="firstName"
                  value={formik.values.firstName || ''}
                  onChange={formik.handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1 uppercase">Apellido</label>
                <input
                  name="lastName"
                  value={formik.values.lastName || ''}
                  onChange={formik.handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                  placeholder="Pérez"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-semibold text-white/70 ml-1 uppercase">Email</label>
                <input
                  name="email"
                  type="email"
                  value={formik.values.email || ''}
                  onChange={formik.handleChange}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                  placeholder="nombre@ejemplo.com"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-xs font-semibold text-white/70 ml-1 uppercase">Contraseña</label>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-white/40 hover:text-white mb-1 transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formik.values.password || ''}
                  onChange={handlePasswordChange}
                  className="w-full px-5 py-3.5 rounded-2xl bg-white/[0.05] border border-white/10 text-white focus:border-purple-500/50 focus:outline-none"
                  placeholder="••••••••"
                />
                {formik.values.password && (
                  <div className="px-1 pt-1">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 ${getPasswordStrengthColor(passwordStrength.score)}`} style={{ width: `${passwordStrength.score}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 space-y-4">
              <button
                type="submit"
                disabled={loading || !formik.isValid}
                className="w-full py-4 px-6 font-bold rounded-2xl text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? "Creando perfil..." : "Crear mi cuenta"}
              </button>

              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full py-4 text-sm font-semibold rounded-2xl text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Volver al Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}