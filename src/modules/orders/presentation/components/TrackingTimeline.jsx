// modules/orders/presentation/components/TrackingTimeline.jsx

import React from 'react';

/**
 * @component TrackingTimeline
 * @description Timeline de seguimiento de envío.
 * Los datos vienen ya construidos por el backend (order.service.js#getOrderTracking).
 *
 * @param {Object}  props
 * @param {Array}   props.timeline        - Pasos del timeline
 * @param {string}  [props.trackingNumber] - Número de tracking (si existe)
 * @param {boolean} [props.compact=false]
 */
export function TrackingTimeline({ timeline, trackingNumber, compact = false }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No hay información de seguimiento disponible</p>
      </div>
    );
  }

  const circleSize = compact ? 'w-8 h-8 text-sm'   : 'w-10 h-10 text-base';
  const lineHeight  = compact ? 'h-8'               : 'h-12';
  const textSize    = compact ? 'text-sm'           : 'text-base';
  const subTextSize = compact ? 'text-xs'           : 'text-sm';

  return (
    <div>
      {/* Número de tracking */}
      {trackingNumber && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 inline-block">
          <p className="text-xs text-gray-500">Número de Seguimiento</p>
          <p className="font-mono font-bold text-blue-700">{trackingNumber}</p>
        </div>
      )}

      <div className={`space-y-${compact ? '2' : '3'}`}>
        {timeline.map((step, index) => {
          const isLast = index === timeline.length - 1;

          return (
            <div key={step.status ?? index} className="flex gap-4">
              {/* Columna de icono */}
              <div className="flex flex-col items-center">
                <div
                  className={`${circleSize} rounded-full flex items-center justify-center font-bold flex-shrink-0 transition-all ${
                    step.completed
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {step.completed ? '✓' : index + 1}
                </div>
                {!isLast && (
                  <div className={`w-0.5 ${lineHeight} mt-1 ${step.completed ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>

              {/* Contenido */}
              <div className={`flex-1 ${isLast ? '' : 'pb-1'}`}>
                <p className={`font-semibold ${textSize} ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </p>

                {step.date && (
                  <p className={`${subTextSize} text-gray-500 mt-0.5`}>
                    {new Date(step.date).toLocaleDateString('es-ES', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                )}

                {step.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default TrackingTimeline;
