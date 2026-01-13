// src/modules/customer/components/orders/OrderTracking.jsx

import React from 'react';

/**
 * @component OrderTracking
 * @description Timeline de tracking de orden
 * 
 * @props {Array} timeline - Estados de la orden
 * @props {string} currentStatus - Estado actual
 * @props {string} trackingNumber - Número de seguimiento (opcional)
 */
const OrderTracking = ({ timeline, currentStatus, trackingNumber }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">
          📦 Seguimiento de Orden
        </h3>
        {trackingNumber && (
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <p className="text-xs text-gray-600">Número de Seguimiento</p>
            <p className="font-mono font-bold text-blue-700">{trackingNumber}</p>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {timeline.map((step, index) => {
          const isCompleted = step.completed;
          const isLast = index === timeline.length - 1;

          return (
            <div key={index} className="relative">
              {/* Connector Line */}
              {!isLast && (
                <div
                  className={`absolute left-4 top-10 w-0.5 h-full ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}

              {/* Step */}
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {isCompleted ? '✓' : '○'}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4
                      className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </h4>
                    {step.date && (
                      <span className="text-sm text-gray-500">
                        {new Date(step.date).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className="text-sm text-gray-600">{step.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Estimated Delivery */}
      {currentStatus !== 'delivered' && currentStatus !== 'cancelled' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            🚚 <strong>Entrega estimada:</strong> 3-5 días hábiles
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;