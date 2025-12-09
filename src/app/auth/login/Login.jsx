import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../src/contexts/AuthContext";
import { useToast } from "../../../hooks/use-toast";
import { FloatingParticles } from "../../../components/floating-particles";
import {
  Smartphone,
  Headphones,
  Watch,
  Zap,
  Eye,
  EyeOff,
  LogIn,
} from "lucide-react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Efecto para redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("🔄 Usuario ya autenticado, redirigiendo...", user);
      redirectUser(user);
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const redirectUser = (userData) => {
    const userRole = userData?.role || "customer";
    console.log("🎯 Redirigiendo usuario con rol:", userRole);

    // Pequeña pausa para mejor UX
    setTimeout(() => {
      if (userRole === "admin" || userRole === "moderator") {
        console.log("🚀 Redirigiendo al panel de administración");
        navigate("/admin", { replace: true });
      } else {
        console.log("🏠 Redirigiendo a página principal");
        navigate("/", { replace: true });
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validación básica
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }

    setLoading(true);

    console.log("🔐 Iniciando proceso de login...", formData);

    try {
      const result = await login(formData);
      console.log("📨 Resultado del login:", result);

      if (result.success) {
        console.log("✅ Login exitoso, usuario:", result.user);

        toast({
          title: "¡Bienvenido de vuelta! 🎉",
          description: "Has iniciado sesión correctamente.",
          type: "success",
        });

        // Redirigir según el rol del usuario
        if (result.user) {
          redirectUser(result.user);
        } else {
          console.warn("⚠️ Usuario no recibido en la respuesta");
          navigate("/");
        }
      } else {
        console.error("❌ Error en login:", result.error);
        toast({
          title: "Error",
          description: result.error,
          type: "error",
        });
      }
    } catch (error) {
      console.error("💥 Error inesperado:", error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error inesperado.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden">
      <FloatingParticles count={20} />

      {/* Iconos flotantes de productos */}
      <div className="absolute top-10 left-10 text-white/20 animate-bounce">
        <Smartphone size={32} />
      </div>
      <div className="absolute top-20 right-20 text-white/20 animate-pulse">
        <Headphones size={28} />
      </div>
      <div className="absolute bottom-20 left-20 text-white/20 animate-bounce delay-75">
        <Watch size={24} />
      </div>
      <div className="absolute bottom-10 right-10 text-white/20 animate-pulse delay-150">
        <Zap size={30} />
      </div>

      <div className="max-w-md w-full space-y-8 glass-effect p-10 rounded-3xl relative z-10 border border-white/20 shadow-2xl">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Zap className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold font-heading text-white mb-2">
            Bienvenido de vuelta
          </h2>
          <p className="text-white/70 text-lg">
            Ingresa a tu cuenta KillaVibes
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Email Input */}
            <div className="group">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white/80 mb-2"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="floating-input w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-white/80"
                >
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="floating-input w-full px-4 py-4 rounded-xl bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300"
                  placeholder="••••••••"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full flex justify-center items-center py-4 px-4 text-lg font-semibold rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
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
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-white/50 text-sm">
            Al ingresar, aceptas nuestros{" "}
            <a
              href="/terminos"
              className="text-white/70 hover:text-white underline transition-colors"
            >
              Términos de servicio
            </a>
          </p>
        </div>
      </div>

      {/* Efecto de brillo en esquinas */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  );
}
