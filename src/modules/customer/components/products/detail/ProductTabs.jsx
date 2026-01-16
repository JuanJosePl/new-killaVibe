// src/modules/customer/components/products/detail/ProductTabs.jsx

import React from 'react';

/**
 * @component ProductTabs
 * @description Tabs con información detallada del producto
 * 
 * Props:
 * - product: Objeto producto completo
 * - activeTab: Tab activo actual
 * - setActiveTab: Función para cambiar tab
 */
const ProductTabs = ({ product, activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: 'description',
      label: 'Descripción',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      ),
    },
    {
      id: 'specifications',
      label: 'Especificaciones',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'shipping',
      label: 'Envío y entrega',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white/60 backdrop-blur-lg rounded-3xl border-2 border-white/20 shadow-xl overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200 bg-white/40">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all
              ${activeTab === tab.id
                ? 'text-blue-600 border-b-4 border-blue-600 bg-blue-50/50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }
            `}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {/* DESCRIPCIÓN */}
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            <div className="text-gray-800 leading-relaxed space-y-4">
              {product.description ? (
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              ) : (
                <p className="text-gray-600 italic">No hay descripción disponible para este producto.</p>
              )}
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xl font-black text-gray-900 mb-4">Características destacadas</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ESPECIFICACIONES */}
        {activeTab === 'specifications' && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900 mb-4">Detalles técnicos</h3>
            
            {product.specifications && Object.keys(product.specifications).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <dt className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-1">
                      {key}
                    </dt>
                    <dd className="text-base font-semibold text-gray-900">
                      {value}
                    </dd>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600">No hay especificaciones disponibles</p>
              </div>
            )}

            {/* Información adicional */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                <p className="text-xs font-bold text-blue-600 uppercase mb-1">SKU</p>
                <p className="font-mono font-semibold text-gray-900">{product.sku || 'N/A'}</p>
              </div>
              
              {product.weight && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-xs font-bold text-green-600 uppercase mb-1">Peso</p>
                  <p className="font-semibold text-gray-900">{product.weight}</p>
                </div>
              )}
              
              {product.dimensions && (
                <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-xs font-bold text-purple-600 uppercase mb-1">Dimensiones</p>
                  <p className="font-semibold text-gray-900">{product.dimensions}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ENVÍO */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-gray-900 mb-4">Opciones de envío</h3>
            
            {/* Métodos de envío */}
            <div className="space-y-3">
              <ShippingOption
                icon="🚚"
                name="Envío estándar"
                time="5-7 días hábiles"
                price="Gratis en compras mayores a $50"
                color="blue"
              />
              <ShippingOption
                icon="⚡"
                name="Envío express"
                time="2-3 días hábiles"
                price="$15.00"
                color="orange"
              />
              <ShippingOption
                icon="🏪"
                name="Retiro en tienda"
                time="Disponible en 24 horas"
                price="Gratis"
                color="green"
              />
            </div>

            {/* Información adicional */}
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <div className="text-2xl">ℹ️</div>
                <div>
                  <h4 className="font-bold text-yellow-900 mb-2">Información importante</h4>
                  <ul className="text-sm text-yellow-800 space-y-1">
                    <li>• Los tiempos de envío son estimados y pueden variar</li>
                    <li>• Recibirás un número de seguimiento por email</li>
                    <li>• Aceptamos devoluciones dentro de 30 días</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component
const ShippingOption = ({ icon, name, time, price, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200',
    orange: 'bg-orange-50 border-orange-200',
    green: 'bg-green-50 border-green-200',
  };

  return (
    <div className={`${colorClasses[color]} border-2 rounded-2xl p-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <h4 className="font-bold text-gray-900">{name}</h4>
            <p className="text-sm text-gray-600">{time}</p>
          </div>
        </div>
        <span className="font-bold text-gray-900">{price}</span>
      </div>
    </div>
  );
};

export default ProductTabs;