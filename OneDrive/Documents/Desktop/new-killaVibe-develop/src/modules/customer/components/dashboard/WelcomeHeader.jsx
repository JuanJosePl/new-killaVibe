// src/modules/customer/components/dashboard/WelcomeHeader.jsx

import React from 'react';

/**
 * @component WelcomeHeader
 * @description Header de bienvenida mejorado con animaciones y diseño moderno
 * 
 * @props {string} userName - Nombre del usuario
 * @props {number} daysSinceRegistration - Días desde registro
 * @props {string} avatar - URL del avatar (opcional)
 * @props {string} initials - Iniciales del usuario (fallback)
 */
const WelcomeHeader = ({ 
  userName, 
  daysSinceRegistration, 
  avatar,
  initials = '?' 
}) => {
  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '¡Buenos días';
    if (hour < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const getMembershipBadge = () => {
    if (daysSinceRegistration >= 365) {
      return { text: 'Miembro VIP', color: 'bg-yellow-400', icon: '👑' };
    }
    if (daysSinceRegistration >= 180) {
      return { text: 'Miembro Gold', color: 'bg-yellow-300', icon: '⭐' };
    }
    if (daysSinceRegistration >= 90) {
      return { text: 'Miembro Silver', color: 'bg-gray-300', icon: '🌟' };
    }
    return { text: 'Nuevo Miembro', color: 'bg-blue-300', icon: '🎉' };
  };

  const badge = getMembershipBadge();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          {/* Avatar with Ring */}
          <div className="relative group">
            <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl ring-4 ring-white/30 flex items-center justify-center text-blue-600 text-2xl sm:text-3xl font-bold overflow-hidden transition-transform group-hover:scale-110 duration-300">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="animate-bounce">{initials}</span>
              )}
            </div>
            {/* Status Indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          </div>

          {/* Welcome Text */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white animate-slide-in">
                {getCurrentGreeting()}, {userName}! 👋
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Membership Badge */}
              <span className={`inline-flex items-center gap-1.5 ${badge.color} text-gray-900 px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-md animate-slide-in`} style={{ animationDelay: '200ms' }}>
                <span>{badge.icon}</span>
                <span>{badge.text}</span>
              </span>

              {/* Days Badge */}
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold animate-slide-in" style={{ animationDelay: '300ms' }}>
                <span>📅</span>
                <span>Miembro desde hace {daysSinceRegistration} día{daysSinceRegistration !== 1 ? 's' : ''}</span>
              </span>
            </div>

            {/* Motivational Text */}
            <p className="text-blue-100 text-sm mt-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
              ¡Qué bueno tenerte de vuelta! Descubre las novedades de hoy 🎁
            </p>
          </div>

          {/* Quick Stats (Desktop Only) */}
          <div className="hidden lg:flex gap-4 animate-slide-in" style={{ animationDelay: '500ms' }}>
            <QuickStat icon="⚡" value="Activo" label="Estado" />
            <QuickStat icon="🔥" value={Math.floor(daysSinceRegistration / 7)} label="Semanas" />
          </div>
        </div>
      </div>

      {/* Bottom Gradient Bar */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 animate-gradient"></div>
    </div>
  );
};

/**
 * QuickStat Component
 */
const QuickStat = ({ icon, value, label }) => (
  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[80px] hover:bg-white/20 transition-colors">
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-white font-bold text-lg">{value}</div>
    <div className="text-blue-100 text-xs">{label}</div>
  </div>
);

export default WelcomeHeader;