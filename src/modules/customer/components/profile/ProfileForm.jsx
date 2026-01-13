// src/modules/customer/components/profile/ProfileForm.jsx

import React from 'react';

/**
 * @component ProfileForm
 * @description Formulario de edición de perfil
 * 
 * @props {Object} formData - Datos del formulario
 * @props {Function} onInputChange - Handler de cambios
 * @props {Function} onSave - Handler de guardado
 * @props {Function} onCancel - Handler de cancelación
 * @props {boolean} isEditing - Modo edición activo
 * @props {boolean} isSaving - Estado de guardado
 * @props {string} error - Mensaje de error
 * @props {Function} onStartEdit - Iniciar edición
 */
const ProfileForm = ({
  formData,
  onInputChange,
  onSave,
  onCancel,
  isEditing,
  isSaving,
  error,
  onStartEdit,
}) => {
  return (
    <div className="p-8">
      {/* Header con botón de editar */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Información Personal</h3>
        {!isEditing && (
          <button
            onClick={onStartEdit}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Editar Perfil
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => onInputChange('firstName', e.target.value)}
              disabled={!isEditing || isSaving}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="Juan"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => onInputChange('lastName', e.target.value)}
              disabled={!isEditing || isSaving}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              placeholder="Pérez"
            />
          </div>
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={formData.email || ''}
            disabled
            className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            El email no puede ser modificado. Contacta soporte si necesitas cambiarlo.
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            disabled={!isEditing || isSaving}
            placeholder="+57 300 123 4567"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
        </div>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-4 mt-6">
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSaving}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 font-semibold disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;