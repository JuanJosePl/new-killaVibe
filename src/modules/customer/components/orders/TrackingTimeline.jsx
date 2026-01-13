// src/modules/customer/components/orders/TrackingTimeline.jsx

import React from 'react';

/**
 * @component TrackingTimeline
 * @description Timeline de seguimiento de envío
 * 
 * @props {Array} timeline - Array de pasos del tracking
 * @props {boolean} compact - Versión compacta
 */
const TrackingTimeline = ({ timeline, compact = false }) => {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay información de seguimiento disponible</p>
      </div>
    );
  }

  return (
    <div className={`space-y-${compact ? '3' : '4'}`}>
      {timeline.map((step, index) => (
        <div key={index} className="flex gap-4">
          {/* Icon Column */}
          <div className="flex flex-col items-center">
            {/* Circle */}
            <div
              className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} rounded-full flex items-center justify-center font-bold transition-all ${
                step.completed
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              {step.completed ? '✓' : index + 1}
            </div>

            {/* Line */}
            {index < timeline.length - 1 && (
              <div
                className={`w-1 ${compact ? 'h-8' : 'h-12'} transition-all ${
                  step.completed ? 'bg-green-600' : 'bg-gray-200'
                }`}
              />
            )}
          </div>

          {/* Content Column */}
          <div className={`flex-1 ${compact ? 'pb-2' : 'pb-4'}`}>
            <p
              className={`font-semibold ${
                step.completed ? 'text-gray-900' : 'text-gray-400'
              } ${compact ? 'text-sm' : 'text-base'}`}
            >
              {step.label}
            </p>

            {step.date && (
              <p className={`text-gray-500 mt-1 ${compact ? 'text-xs' : 'text-sm'}`}>
                {new Date(step.date).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}

            {/* Description (if exists) */}
            {step.description && (
              <p className="text-gray-600 text-xs mt-1">{step.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingTimeline;