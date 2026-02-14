// src/modules/customer/components/common/AnimatedIcon.jsx

import React from 'react';

/**
 * @component AnimatedIcon
 * @description Icono animado reutilizable con diferentes efectos
 * 
 * @props {string} icon - Emoji o contenido del icono
 * @props {string} animation - Tipo de animación ('bounce', 'rotate', 'pulse', 'float', 'wiggle', 'swing')
 * @props {string} size - Tamaño ('sm', 'md', 'lg', 'xl', '2xl')
 * @props {string} color - Color de fondo (opcional)
 * @props {boolean} withBackground - Mostrar fondo circular
 * @props {string} className - Clases adicionales
 */
const AnimatedIcon = ({ 
  icon, 
  animation = 'float',
  size = 'md',
  color,
  withBackground = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'text-2xl w-10 h-10',
    md: 'text-3xl w-12 h-12',
    lg: 'text-4xl w-16 h-16',
    xl: 'text-5xl w-20 h-20',
    '2xl': 'text-6xl w-24 h-24',
  };

  const animations = {
    bounce: 'animate-bounce-subtle',
    rotate: 'animate-rotate',
    pulse: 'animate-pulse-slow',
    float: 'animate-float',
    wiggle: 'hover:animate-wiggle',
    swing: 'hover:animate-swing',
    scale: 'hover:animate-scale-up',
  };

  const backgroundColors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  const baseClasses = `
    inline-flex items-center justify-center
    ${sizeClasses[size]}
    ${animations[animation]}
    ${withBackground ? (backgroundColors[color] || 'bg-gray-100 text-gray-600') + ' rounded-full shadow-md' : ''}
    ${className}
  `.trim();

  return (
    <div className={baseClasses}>
      <span>{icon}</span>
    </div>
  );
};

export default AnimatedIcon;