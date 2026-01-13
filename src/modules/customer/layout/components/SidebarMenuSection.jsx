// src/modules/customer/layout/components/SidebarMenuSection.jsx

import React from 'react';
import SidebarMenuItem from './SidebarMenuItem';

const SidebarMenuSection = ({ section, onNavigate, variant = 'desktop' }) => {
  return (
    <div className="mb-6 animate-fade-in-up">
      <h4 className="px-5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        {section.title}
      </h4>
      <div className="space-y-0.5 px-3">
        {section.items.map((item) => (
          <SidebarMenuItem
            key={item.path}
            item={item}
            onNavigate={onNavigate}
            variant={variant}
          />
        ))}
      </div>
    </div>
  );
};

export default SidebarMenuSection;