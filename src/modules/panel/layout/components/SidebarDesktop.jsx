// src/modules/customer/layout/components/SidebarDesktop.jsx

import React from 'react';
import SidebarProfile from './SidebarProfile';
import SidebarMenuSection from './SidebarMenuSection';

const SidebarDesktop = ({ menuSections, profile }) => {
  return (
    <aside className="hidden lg:block w-72 relative">
      <div className="fixed top-0 left-0 w-72 h-screen bg-white border-r border-slate-200 shadow-lg flex flex-col overflow-hidden">
        {/* Profile Header */}
        <SidebarProfile profile={profile} variant="desktop" />

        {/* Navigation Sections */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar py-4">
          {menuSections.map((section, idx) => (
            <SidebarMenuSection
              key={idx}
              section={section}
              variant="desktop"
            />
          ))}
        </nav>

        {/* Premium Badge Footer */}
        <div className="p-4 border-t border-slate-200 bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-indigo-100">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-xl shadow-lg animate-float">
              👑
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-900">Miembro Silver</p>
              <p className="text-xs text-slate-500">+250 puntos acumulados</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarDesktop;