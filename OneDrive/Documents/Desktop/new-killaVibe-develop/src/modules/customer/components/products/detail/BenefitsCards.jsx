// src/modules/customer/components/products/detail/BenefitsCards.jsx

import React from 'react';

/**
 * @component BenefitsCards
 * @description Cards de beneficios de compra (envío, garantía, devoluciones)
 */
const BenefitsCards = () => {
  const benefits = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      title: 'Envío gratis',
      description: 'En compras mayores a $50',
      color: 'blue',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Garantía extendida',
      description: '2 años de cobertura',
      color: 'green',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      title: 'Devoluciones fáciles',
      description: 'Hasta 30 días',
      color: 'purple',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Pago seguro',
      description: 'Cifrado SSL',
      color: 'orange',
    },
  ];

  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-900',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-900',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-900',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-900',
    },
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {benefits.map((benefit, index) => {
        const colors = colorClasses[benefit.color];
        
        return (
          <div
            key={index}
            className={`${colors.bg} rounded-2xl p-4 border-2 border-transparent hover:border-${benefit.color}-200 transition-all`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl ${colors.icon} flex-shrink-0`}>
                {benefit.icon}
              </div>
              <div>
                <h4 className={`font-bold text-sm ${colors.text}`}>
                  {benefit.title}
                </h4>
                <p className="text-xs text-gray-600 mt-0.5">
                  {benefit.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BenefitsCards;