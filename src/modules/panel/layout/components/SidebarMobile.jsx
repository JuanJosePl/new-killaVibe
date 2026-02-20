// src/modules/customer/layout/components/SidebarMobile.jsx

import React from 'react';
import SidebarProfile from './SidebarProfile';
import SidebarMenuSection from './SidebarMenuSection';

const SidebarMobile = ({ isOpen, onClose, menuSections, profile }) => {
  return (
    <aside className={`
      lg:hidden fixed inset-y-0 left-0 w-80 bg-white z-50
      transform transition-transform duration-300 ease-out shadow-2xl flex flex-col
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Header Mobile */}
      <div className="relative">
        <SidebarProfile profile={profile} variant="mobile" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Navigation Mobile */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menuSections.map((section, idx) => (
          <SidebarMenuSection
            key={idx}
            section={section}
            onNavigate={onClose}
            variant="mobile"
          />
        ))}
      </nav>

      {/* Footer Mobile */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
          <span className="text-2xl animate-bounce-subtle">👑</span>
          <div className="flex-1">
            <p className="text-xs font-bold text-slate-900">Nivel Silver</p>
            <p className="text-xs text-slate-600">250 puntos</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarMobile;