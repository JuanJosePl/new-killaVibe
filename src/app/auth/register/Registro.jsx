import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../src/contexts/AuthContext'
import { useToast } from '../../../hooks/use-toast'
import { FloatingParticles } from '../../../components/floating-particles'
import { Smartphone, Headphones, Watch, Zap, Eye, EyeOff, UserPlus, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  
  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Calcular fuerza de contraseña
    if (name === 'password') {
      let strength = 0
      if (value.length >= 6) strength += 25
      if (value.match(/[a-z]/) && value.match(/[A-Z]/)) strength += 25
      if (value.match(/\d/)) strength += 25
      if (value.match(/[^a-zA-Z\d]/)) strength += 25
      setPasswordStrength(strength)
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500'
    if (passwordStrength < 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await register(formData)
      
      if (result.success) {
        toast({
          title: '¡Cuenta creada con éxito! 🎉',
          description: 'Bienvenido a la familia KillaVibes',
          type: 'success'
        })
        navigate('/')
      } else {
        toast({
          title: 'Error',
          description: result.error,
          type: 'error'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Ha ocurrido un error inesperado.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center gradient-bg relative overflow-hidden py-8">
      <FloatingParticles count={15} />
      
      {/* Iconos flotantes de productos (menos y más pequeños) */}
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

      {/* Card principal más compacta */}
      <div className="w-full max-w-lg glass-effect p-8 rounded-2xl relative z-10 border border-white/20 shadow-2xl mx-4">
        
        {/* Header más compacto */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold font-heading text-white mb-1">
            Únete a KillaVibes
          </h2>
          <p className="text-white/60 text-sm">
            Crea tu cuenta en segundos
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Grid de inputs más compacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="group">
              <label htmlFor="firstName" className="block text-xs font-medium text-white/80 mb-1">
                Nombre
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="floating-input w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 text-sm"
                placeholder="Juan"
              />
            </div>

            {/* Last Name */}
            <div className="group">
              <label htmlFor="lastName" className="block text-xs font-medium text-white/80 mb-1">
                Apellido
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="floating-input w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 text-sm"
                placeholder="Pérez"
              />
            </div>

            {/* Email - Full width */}
            <div className="md:col-span-2 group">
              <label htmlFor="email" className="block text-xs font-medium text-white/80 mb-1">
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
                  className="floating-input w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 text-sm"
                  placeholder="tu@email.com"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            </div>

            {/* Phone - Full width */}
            <div className="md:col-span-2 group">
              <label htmlFor="phone" className="block text-xs font-medium text-white/80 mb-1">
                Teléfono <span className="text-white/50">(opcional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="floating-input w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 text-sm"
                placeholder="+57 300 123 4567"
              />
            </div>

            {/* Password - Full width */}
            <div className="md:col-span-2 group">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="block text-xs font-medium text-white/80">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-white/50 hover:text-white transition-colors text-xs"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="floating-input w-full px-3 py-3 rounded-lg bg-white/5 text-white placeholder-white/50 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all duration-300 text-sm"
                  placeholder="••••••••"
                />
              </div>
              
              {/* Password Strength Meter - Más compacto */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-white/60 mb-1">
                    <span>Seguridad</span>
                    <span className="text-xs">{passwordStrength}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.password.length >= 6 && (
                      <div className="flex items-center text-[10px] text-green-400">
                        <CheckCircle size={10} className="mr-1" />
                        <span>6+ chars</span>
                      </div>
                    )}
                    {formData.password.match(/[a-z]/) && formData.password.match(/[A-Z]/) && (
                      <div className="flex items-center text-[10px] text-green-400">
                        <CheckCircle size={10} className="mr-1" />
                        <span>A-a</span>
                      </div>
                    )}
                    {formData.password.match(/\d/) && (
                      <div className="flex items-center text-[10px] text-green-400">
                        <CheckCircle size={10} className="mr-1" />
                        <span>123</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button más compacto */}
          <button
            type="submit"
            disabled={loading}
            className="neon-button w-full flex justify-center items-center py-3 px-4 text-sm font-semibold rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 mt-4"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Creando cuenta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus size={16} />
                <span>Crear mi cuenta</span>
              </div>
            )}
          </button>

          {/* Divider más compacto */}
          <div className="relative mt-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-transparent text-white/50">¿Ya tienes cuenta?</span>
            </div>
          </div>

          {/* Login Link más compacto */}
          <div className="text-center">
            <Link
              to="/auth/login"
              className="inline-flex items-center text-white/70 hover:text-white transition-all duration-300 group text-sm"
            >
              Iniciar sesión
              <svg className="ml-1 w-3 h-3 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </form>

        {/* Benefits más compacto */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-white font-semibold mb-3 text-center text-sm">Beneficios incluidos</h3>
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

      {/* Efectos de brillo más sutiles */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl translate-x-1/2 translate-y-1/2"></div>
    </div>
  )
}