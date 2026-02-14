// src/modules/customer/layout/components/SidebarProfile.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

const SidebarProfile = ({ profile, variant = 'desktop' }) => {
  const navigate = useNavigate();

  const getUserData = () => {
    if (!profile) return null;
    if (profile.user) {
      return {
        email: profile.user.email,
        firstName: profile.user.profile?.firstName,
        lastName: profile.user.profile?.lastName,
        avatar: profile.user.profile?.avatar,
      };
    }
    return {
      email: profile.email,
      firstName: profile.profile?.firstName,
      lastName: profile.profile?.lastName,
      avatar: profile.profile?.avatar,
    };
  };

  const userData = getUserData();

  const getInitials = () => {
    if (!userData) return '?';
    const first = userData.firstName?.[0] || '';
    const last = userData.lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const getFullName = () => {
    if (!userData) return 'Usuario';
    return `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Usuario';
  };

  const isDesktop = variant === 'desktop';
  const isMobile = variant === 'mobile';

  return (
    <div className={`
      ${isDesktop ? 'p-5 border-b border-slate-200 bg-white' : 'p-4 bg-gradient-to-br from-indigo-500 to-purple-600'}
    `}>
      {isMobile && (
        <h2 className="text-white font-bold text-lg mb-4">Mi Cuenta</h2>
      )}

      <div className="flex items-start gap-3">
        {/* Avatar Container */}
        <div className="relative flex-shrink-0 group">
          <div className={`
            rounded-2xl shadow-lg flex items-center justify-center font-bold overflow-hidden
            transition-all duration-500 hover:scale-110 hover:rotate-6
            ${isDesktop 
              ? 'w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl ring-4 ring-indigo-100' 
              : 'w-12 h-12 bg-white text-indigo-600 text-base ring-4 ring-white/30'}
          `}>
            {userData?.avatar ? (
              <img
                src={userData.avatar}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials()
            )}
          </div>

          {/* Status Indicator */}
          <div className={`
            absolute -bottom-1 -right-1 rounded-full border-2 shadow-md
            ${isDesktop ? 'w-4 h-4 bg-emerald-500 border-white' : 'w-3.5 h-3.5 bg-emerald-400 border-white'}
          `}>
            <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0 mt-0.5">
          <h3 className={`
            font-bold truncate leading-snug
            ${isDesktop ? 'text-slate-900 text-base' : 'text-white text-sm'}
          `}>
            {getFullName()}
          </h3>
          <p className={`
            text-xs truncate mt-0.5 leading-tight
            ${isDesktop ? 'text-slate-500' : 'text-indigo-100'}
          `}>
            {userData?.email || 'usuario@email.com'}
          </p>

          {/* Badges & Actions */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`
              inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border
              ${isDesktop 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-white/20 backdrop-blur-sm text-white border-white/30'}
            `}>
              <span>👑</span>
              <span>Silver</span>
            </span>

            {isDesktop && (
              <button
                onClick={() => navigate('/customer/profile')}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-colors"
              >
                Ver perfil
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarProfile;