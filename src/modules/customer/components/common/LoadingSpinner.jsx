// src/modules/customer/components/common/LoadingSpinner.jsx

import React from 'react';

/**
 * @component LoadingSpinner
 * @description Spinner de carga reutilizable
 * 
 * @props {string} size - Tamaño (sm, md, lg, xl)
 * @props {string} color - Color (blue, green, red, purple)
 * @props {string} text - Texto opcional
 * @props {boolean} fullScreen - Si debe ocupar toda la pantalla
 */
const LoadingSpinner = ({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false,
}) => {
  const sizes = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const colors = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    purple: 'border-purple-600',
    yellow: 'border-yellow-600',
  };

  const spinnerClass = `animate-spin rounded-full border-4 border-gray-200 ${colors[color]} ${sizes[size]}`;

  const content = (
    <div className="text-center">
      <div className={spinnerClass} style={{ borderTopColor: 'transparent' }} />
      {text && (
        <p className="text-gray-600 font-medium mt-4">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;