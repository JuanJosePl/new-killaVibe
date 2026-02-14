// src/modules/customer/layout/components/LogoutModal.jsx

import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
          <span className="text-4xl">🚪</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">
          ¿Cerrar Sesión?
        </h2>

        {/* Description */}
        <p className="text-center text-slate-600 mb-6">
          ¿Estás seguro de que deseas cerrar sesión? Tendrás que volver a iniciar sesión para acceder a tu cuenta.
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Sí, Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;