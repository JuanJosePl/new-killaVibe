// src/modules/customer/layout/components/SidebarMenuItem.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const SidebarMenuItem = ({ item, onNavigate, variant = 'desktop' }) => {
  const location = useLocation();

  const isActive = item.end
    ? location.pathname === item.path
    : location.pathname.startsWith(item.path);

  const isDesktop = variant === 'desktop';

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={`
        group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
        font-medium text-sm transition-all duration-200
        ${isActive
          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }
      `}
    >
      {/* Active Indicator */}
      {isActive && isDesktop && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-r-full shadow-lg animate-slide-in" />
      )}

      {/* Icon */}
      <span className={`
        text-xl leading-none transition-transform duration-200
        ${isActive ? 'scale-110 animate-bounce-subtle' : 'group-hover:scale-110'}
      `}>
        {item.icon}
      </span>

      {/* Label */}
      <span className="flex-1 leading-tight">{item.label}</span>

      {/* Badge - Numeric */}
      {item.badge && typeof item.badge === 'number' && item.badge > 0 && (
        <span className={`
          min-w-[1.375rem] h-5.5 px-1.5 rounded-full text-xs font-bold
          flex items-center justify-center shadow-sm animate-pulse-glow
          ${item.badgeType === 'danger'
            ? 'bg-red-500 text-white'
            : 'bg-indigo-500 text-white'
          }
        `}>
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}

      {/* Badge - String (Nuevo) */}
      {item.badge && typeof item.badge === 'string' && (
        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-bold border border-amber-200 animate-wiggle">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

export default SidebarMenuItem;