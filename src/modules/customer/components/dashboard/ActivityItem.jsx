// src/modules/customer/components/dashboard/ActivityItem.jsx

import React from 'react';

/**
 * @component ActivityItem
 * @description Item de actividad reciente mejorado con diseño moderno
 * 
 * @props {Object} activity - Actividad
 * @props {boolean} compact - Versión compacta
 */
const ActivityItem = ({ activity, compact = false }) => {
  const activityConfig = {
    page_view: { 
      icon: '👁️', 
      label: 'Viste una página',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    product_view: { 
      icon: '🔍', 
      label: 'Viste un producto',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    category_view: { 
      icon: '📂', 
      label: 'Exploraste una categoría',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
    search: { 
      icon: '🔎', 
      label: 'Realizaste una búsqueda',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    add_to_cart: { 
      icon: '🛒', 
      label: 'Agregaste al carrito',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    remove_from_cart: { 
      icon: '🗑️', 
      label: 'Quitaste del carrito',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    add_to_wishlist: { 
      icon: '❤️', 
      label: 'Agregaste a wishlist',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    remove_from_wishlist: { 
      icon: '💔', 
      label: 'Quitaste de wishlist',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    checkout_started: { 
      icon: '💳', 
      label: 'Iniciaste checkout',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    order_completed: { 
      icon: '✅', 
      label: 'Completaste una orden',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    review_created: { 
      icon: '⭐', 
      label: 'Dejaste una reseña',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    login: { 
      icon: '🔐', 
      label: 'Iniciaste sesión',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    logout: { 
      icon: '🚪', 
      label: 'Cerraste sesión',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
    register: { 
      icon: '🎉', 
      label: 'Te registraste',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
  };

  const config = activityConfig[activity.activityType] || {
    icon: '📌',
    label: activity.activityType,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} h`;
    
    return date.toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`
      group relative flex items-center gap-3 
      ${compact ? 'p-2' : 'p-3'} 
      bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-white
      border border-transparent hover:border-gray-200
      rounded-lg cursor-pointer transition-all duration-300
      hover:shadow-md
    `}>
      {/* Icon with Badge */}
      <div className={`
        relative flex-shrink-0
        ${compact ? 'w-10 h-10' : 'w-12 h-12'}
        ${config.bgColor} rounded-xl
        flex items-center justify-center
        ${compact ? 'text-xl' : 'text-2xl'}
        shadow-sm
        transform group-hover:scale-110 group-hover:rotate-6
        transition-transform duration-300
      `}>
        {config.icon}
        
        {/* Activity Pulse */}
        <div className="absolute inset-0 rounded-xl bg-current opacity-20 animate-ping"></div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Label */}
        <p className={`
          font-semibold ${config.color}
          ${compact ? 'text-xs' : 'text-sm'}
          group-hover:underline transition-all
        `}>
          {config.label}
        </p>

        {/* Resource Name */}
        {activity.resource?.resourceName && (
          <p className={`
            text-gray-600 truncate font-medium
            ${compact ? 'text-xs' : 'text-sm'}
          `}>
            "{activity.resource.resourceName}"
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-0.5">
          {/* Timestamp */}
          <span className="text-xs text-gray-500 flex items-center gap-1">
            🕐 {formatTimestamp(activity.timestamp)}
          </span>

          {/* Quantity */}
          {activity.metadata?.quantity && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500 font-semibold">
                x{activity.metadata.quantity}
              </span>
            </>
          )}

          {/* Results Count */}
          {activity.metadata?.resultsCount !== undefined && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs text-gray-500">
                {activity.metadata.resultsCount} resultados
              </span>
            </>
          )}

          {/* Price */}
          {activity.metadata?.price && (
            <>
              <span className="text-gray-300">•</span>
              <span className="text-xs font-bold text-green-600">
                ${activity.metadata.price.toFixed(2)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Hover Indicator */}
      <svg 
        className="w-4 h-4 text-gray-300 group-hover:text-gray-600 transform group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>

      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg"></div>
    </div>
  );
};

export default ActivityItem;