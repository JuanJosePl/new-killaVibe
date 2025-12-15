import React from 'react';

/**
 * @component WishlistEmptyState
 * @description Estado vacío de wishlist
 * 
 * @param {string} title - Título personalizado
 * @param {string} message - Mensaje personalizado
 * @param {string} actionText - Texto del botón
 * @param {Function} onAction - Callback del botón
 * @param {string} icon - Tipo de ícono ('heart', 'empty', 'search')
 */
const WishlistEmptyState = ({
  title = 'Tu lista de deseos está vacía',
  message = 'Explora nuestros productos y guarda tus favoritos aquí',
  actionText = 'Explorar productos',
  onAction,
  icon = 'heart'
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'heart':
        return (
          <svg
            className="w-24 h-24 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        );
      case 'empty':
        return (
          <svg
            className="w-24 h-24 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        );
      case 'search':
        return (
          <svg
            className="w-24 h-24 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        {renderIcon()}
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {title}
        </h3>
        
        <p className="text-gray-600 mb-8">
          {message}
        </p>

        {onAction && actionText && (
          <button
            onClick={onAction}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            {actionText}
            <svg
              className="ml-2 w-5 h-5"
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
          </button>
        )}

        {/* Tips adicionales */}
        <div className="mt-8 text-left bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-sm font-medium text-blue-900 mb-2">
            💡 ¿Sabías que...?
          </p>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Puedes guardar productos para comprar más tarde</li>
            <li>• Te notificaremos si baja el precio</li>
            <li>• Tu lista se sincroniza en todos tus dispositivos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WishlistEmptyState;