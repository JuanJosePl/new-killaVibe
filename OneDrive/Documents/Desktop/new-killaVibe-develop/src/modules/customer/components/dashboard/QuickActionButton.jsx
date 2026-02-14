// src/modules/customer/components/dashboard/QuickActionButton.jsx

import React from 'react';

/**
 * @component QuickActionButton
 * @description Botón de acción rápida mejorado con animaciones y efectos
 * 
 * @props {string} icon - Emoji del icono
 * @props {string} title - Título de la acción
 * @props {number|string} badge - Badge numérico (opcional)
 * @props {Function} onClick - Callback al hacer click
 * @props {boolean} disabled - Estado deshabilitado
 */
const QuickActionButton = ({ 
  icon, 
  title, 
  badge, 
  onClick,
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative w-full
        flex items-center justify-between p-4
        bg-gradient-to-br from-gray-50 to-white
        hover:from-gray-100 hover:to-gray-50
        border-2 border-gray-100 hover:border-gray-200
        rounded-xl shadow-md hover:shadow-xl
        transition-all duration-300
        overflow-hidden
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'}
      `}
    >
      {/* Background Gradient on Hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative flex items-center gap-3 flex-1">
        {/* Icon with Animation */}
        <div className="text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
          {icon}
        </div>

        {/* Title */}
        <span className="font-semibold text-gray-900 text-left group-hover:text-blue-600 transition-colors duration-300">
          {title}
        </span>
      </div>

      {/* Badge */}
      {badge && (
        <div className="relative">
          {/* Badge Glow */}
          <div className="absolute inset-0 bg-blue-600 rounded-full blur-md opacity-50 animate-pulse"></div>
          
          {/* Badge */}
          <span className="relative inline-flex items-center justify-center min-w-[32px] h-8 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
            {badge}
          </span>
        </div>
      )}

      {/* Arrow Indicator */}
      {!badge && (
        <svg 
          className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-300" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )}

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
    </button>
  );
};

export default QuickActionButton;