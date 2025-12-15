import React, { useState } from 'react';
import { SHIPPING_METHODS, SHIPPING_METHOD_LABELS, SHIPPING_COSTS } from '../types/cart.types';

/**
 * @component ShippingForm
 * @description Formulario para seleccionar método de envío y dirección
 * 
 * PROPS:
 * @param {Object} currentShipping - Método de envío actual
 * @param {Object} currentAddress - Dirección actual
 * @param {Function} onMethodChange - Callback al cambiar método
 * @param {Function} onAddressChange - Callback al cambiar dirección
 * @param {boolean} loading - Estado de carga
 */
const ShippingForm = ({
  currentShipping,
  currentAddress,
  onMethodChange,
  onAddressChange,
  loading = false
}) => {
  const [selectedMethod, setSelectedMethod] = useState(currentShipping?.method || SHIPPING_METHODS.STANDARD);
  const [showAddressForm, setShowAddressForm] = useState(!currentAddress);
  
  const [addressData, setAddressData] = useState({
    firstName: currentAddress?.firstName || '',
    lastName: currentAddress?.lastName || '',
    email: currentAddress?.email || '',
    phone: currentAddress?.phone || '',
    street: currentAddress?.street || '',
    city: currentAddress?.city || '',
    state: currentAddress?.state || '',
    zipCode: currentAddress?.zipCode || '',
    country: currentAddress?.country || 'Colombia',
    isDefault: currentAddress?.isDefault || false
  });

  // ============================================================================
  // HANDLERS - MÉTODO DE ENVÍO
  // ============================================================================

  const handleMethodSelect = async (method) => {
    setSelectedMethod(method);
    const cost = SHIPPING_COSTS[method];
    await onMethodChange({ method, cost });
  };

  // ============================================================================
  // HANDLERS - DIRECCIÓN
  // ============================================================================

  const handleAddressFieldChange = (field, value) => {
    setAddressData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveAddress = async () => {
    await onAddressChange(addressData);
    setShowAddressForm(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveAddress();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* SECCIÓN: MÉTODO DE ENVÍO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Método de Envío
        </h3>

        <div className="space-y-3">
          {Object.values(SHIPPING_METHODS).map((method) => {
            const isSelected = selectedMethod === method;
            const cost = SHIPPING_COSTS[method];

            return (
              <button
                key={method}
                onClick={() => handleMethodSelect(method)}
                disabled={loading}
                className={`w-full flex items-center justify-between p-4 border-2 rounded-lg transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {SHIPPING_METHOD_LABELS[method]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {cost === 0 ? 'Gratis' : `$${cost.toFixed(2)}`}
                    </p>
                  </div>
                </div>

                {cost === 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    GRATIS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN: DIRECCIÓN DE ENVÍO */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Dirección de Envío
          </h3>
          {currentAddress && !showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Editar
            </button>
          )}
        </div>

        {/* Dirección Guardada */}
        {currentAddress && !showAddressForm && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">
              {currentAddress.firstName} {currentAddress.lastName}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {currentAddress.street}
            </p>
            <p className="text-sm text-gray-600">
              {currentAddress.city}, {currentAddress.state} {currentAddress.zipCode}
            </p>
            <p className="text-sm text-gray-600">
              {currentAddress.country}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              {currentAddress.phone}
            </p>
            <p className="text-sm text-gray-600">
              {currentAddress.email}
            </p>
          </div>
        )}

        {/* Formulario de Dirección */}
        {showAddressForm && (
          <div className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={addressData.firstName}
                  onChange={(e) => handleAddressFieldChange('firstName', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido *
                </label>
                <input
                  type="text"
                  value={addressData.lastName}
                  onChange={(e) => handleAddressFieldChange('lastName', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Pérez"
                />
              </div>
            </div>

            {/* Email y Teléfono */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={addressData.email}
                  onChange={(e) => handleAddressFieldChange('email', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="juan@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={addressData.phone}
                  onChange={(e) => handleAddressFieldChange('phone', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+57 300 1234567"
                />
              </div>
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección *
              </label>
              <input
                type="text"
                value={addressData.street}
                onChange={(e) => handleAddressFieldChange('street', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Calle 123 #45-67"
              />
            </div>

            {/* Ciudad, Estado, CP */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad *
                </label>
                <input
                  type="text"
                  value={addressData.city}
                  onChange={(e) => handleAddressFieldChange('city', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Barranquilla"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <input
                  type="text"
                  value={addressData.state}
                  onChange={(e) => handleAddressFieldChange('state', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Atlántico"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal *
                </label>
                <input
                  type="text"
                  value={addressData.zipCode}
                  onChange={(e) => handleAddressFieldChange('zipCode', e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="080001"
                />
              </div>
            </div>

            {/* País */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                País *
              </label>
              <input
                type="text"
                value={addressData.country}
                onChange={(e) => handleAddressFieldChange('country', e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Colombia"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveAddress}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Guardando...' : 'Guardar Dirección'}
              </button>
              {currentAddress && (
                <button
                  onClick={() => setShowAddressForm(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShippingForm;