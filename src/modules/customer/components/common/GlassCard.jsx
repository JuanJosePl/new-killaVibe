// src/modules/customer/components/common/GlassCard.jsx

import React from 'react';

/**
 * @component GlassCard
 * @description Card con efecto glassmorphism
 * 
 * @props {string} title - Título del card
 * @props {Object} action - Acción opcional { label, onClick }
 * @props {ReactNode} children - Contenido
 * @props {string} className - Clases adicionales
 * @props {boolean} noPadding - Sin padding interno
 */
const GlassCard = ({ 
  title, 
  action, 
  children, 
  className = '',
  noPadding = false 
}) => {
  return (
    <div className={`bg-white/60 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 hover:shadow-2xl transition-shadow duration-300 ${className}`}>
      {title && (
        <div className={`flex items-center justify-between ${noPadding ? 'p-6 pb-4' : 'px-6 pt-6 pb-4'} border-b border-gray-100`}>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            {title}
          </h2>
          {action && (
            <button
              onClick={action.onClick}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 group transition-colors"
            >
              {action.label}
              <svg 
                className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default GlassCard;