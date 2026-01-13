// src/modules/customer/components/dashboard/StatCard.jsx

import React from 'react';

/**
 * @component StatCard
 * @description Card de estadística mejorado con animaciones y efectos visuales
 * 
 * @props {string} title - Título de la estadística
 * @props {number|string} value - Valor principal
 * @props {string} subtitle - Subtítulo descriptivo
 * @props {string} icon - Emoji del icono
 * @props {string} color - Color del tema
 * @props {Function} onClick - Callback al hacer click
 * @props {boolean} isLoading - Estado de carga
 */
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color = 'blue', 
  onClick,
  isLoading = false 
}) => {
  const colorConfig = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-600',
      glow: 'shadow-blue-200',
    },
    red: {
      bg: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconText: 'text-red-600',
      glow: 'shadow-red-200',
    },
    green: {
      bg: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconText: 'text-green-600',
      glow: 'shadow-green-200',
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-100',
      iconText: 'text-purple-600',
      glow: 'shadow-purple-200',
    },
    yellow: {
      bg: 'from-yellow-500 to-yellow-600',
      iconBg: 'bg-yellow-100',
      iconText: 'text-yellow-600',
      glow: 'shadow-yellow-200',
    },
    indigo: {
      bg: 'from-indigo-500 to-indigo-600',
      iconBg: 'bg-indigo-100',
      iconText: 'text-indigo-600',
      glow: 'shadow-indigo-200',
    },
    pink: {
      bg: 'from-pink-500 to-pink-600',
      iconBg: 'bg-pink-100',
      iconText: 'text-pink-600',
      glow: 'shadow-pink-200',
    },
  };

  const config = colorConfig[color] || colorConfig.blue;

  return (
    <div
      onClick={onClick}
      className={`
        group relative bg-white rounded-2xl shadow-lg p-6 
        transition-all duration-300 overflow-hidden
        ${onClick ? 'cursor-pointer hover:shadow-2xl hover:-translate-y-1' : ''}
        ${isLoading ? 'opacity-70 pointer-events-none' : ''}
      `}
    >
      {/* Gradient Background on Hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bg} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

      {/* Glow Effect */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.bg} rounded-2xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${config.glow}`}></div>

      {/* Content */}
      <div className="relative">
        {/* Header: Icon + Value */}
        <div className="flex items-start justify-between mb-4">
          {/* Icon */}
          <div className={`
            ${config.iconBg} ${config.iconText}
            w-14 h-14 rounded-xl flex items-center justify-center
            text-3xl shadow-md
            transform group-hover:scale-110 group-hover:rotate-6
            transition-transform duration-300
          `}>
            {isLoading ? (
              <div className="animate-spin">⏳</div>
            ) : (
              icon
            )}
          </div>

          {/* Value */}
          <div className={`
            text-4xl font-black text-gray-900
            transform group-hover:scale-110 origin-right
            transition-transform duration-300
          `}>
            {isLoading ? (
              <div className="flex gap-1">
                <span className="animate-pulse">.</span>
                <span className="animate-pulse" style={{ animationDelay: '200ms' }}>.</span>
                <span className="animate-pulse" style={{ animationDelay: '400ms' }}>.</span>
              </div>
            ) : (
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {value}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-bold mb-1 text-sm">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-gray-500 text-xs font-medium">
          {subtitle}
        </p>

        {/* Hover Indicator */}
        {onClick && (
          <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-gray-600 transition-colors">
            <span>Ver más</span>
            <svg 
              className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>

      {/* Corner Decoration */}
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${config.bg} opacity-5 rounded-bl-full transform group-hover:scale-150 transition-transform duration-500`}></div>
    </div>
  );
};

export default StatCard;