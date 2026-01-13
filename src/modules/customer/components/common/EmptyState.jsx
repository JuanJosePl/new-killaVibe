// src/modules/customer/components/common/EmptyState.jsx

import React from 'react';

/**
 * @component EmptyState
 * @description Estado vacío reutilizable para cualquier lista
 * 
 * @props {string} icon - Emoji del icono
 * @props {string} title - Título principal
 * @props {string} message - Mensaje descriptivo
 * @props {string} actionText - Texto del botón (opcional)
 * @props {Function} onAction - Callback del botón (opcional)
 * @props {Array} suggestions - Array de sugerencias (opcional)
 */
const EmptyState = ({
  icon = '📭',
  title,
  message,
  actionText,
  onAction,
  suggestions = [],
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto">
      {/* Icon */}
      <div className="text-8xl mb-6 animate-bounce">
        {icon}
      </div>

      {/* Content */}
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        {title}
      </h2>
      <p className="text-gray-600 text-lg mb-8">
        {message}
      </p>

      {/* Action Button */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
        >
          {actionText}
        </button>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Sugerencias:
          </p>
          <div className={`grid grid-cols-${Math.min(suggestions.length, 3)} gap-6`}>
            {suggestions.map((suggestion, index) => (
              <SuggestionCard
                key={index}
                icon={suggestion.icon}
                title={suggestion.title}
                description={suggestion.description}
                onClick={suggestion.onClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Suggestion Card
 */
const SuggestionCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-gray-600">{description}</p>
    )}
  </div>
);

export default EmptyState;