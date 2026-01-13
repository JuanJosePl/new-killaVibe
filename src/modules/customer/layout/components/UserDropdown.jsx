// src/modules/customer/layout/components/UserDropdown.jsx

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '../../context/CustomerProfileContext';
import LogoutModal from './LogoutModal';

const UserDropdown = ({ profile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useCustomerProfile();

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 transition-all duration-200 group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm overflow-hidden ring-2 ring-slate-100 group-hover:ring-indigo-200 transition-all">
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
          
          {/* Dropdown Arrow */}
          <svg
            className={`w-4 h-4 text-slate-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-scale-in z-50">
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-b border-slate-200">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg overflow-hidden ring-4 ring-white shadow-lg">
                  {userData?.avatar ? (
                    <img src={userData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{getFullName()}</h3>
                  <p className="text-sm text-slate-600 truncate">{userData?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md text-xs font-medium border border-amber-200">
                    <span>👑</span>
                    <span>Silver</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => {
                  navigate('/customer/profile');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">👤</span>
                <span className="text-sm font-medium text-slate-700">Mi Perfil</span>
              </button>

              <button
                onClick={() => {
                  navigate('/customer/orders');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📦</span>
                <span className="text-sm font-medium text-slate-700">Mis Órdenes</span>
              </button>

              <button
                onClick={() => {
                  navigate('/customer/contact');
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">📧</span>
                <span className="text-sm font-medium text-slate-700">Soporte</span>
              </button>

              <div className="my-2 border-t border-slate-200" />

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors text-left group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
                <span className="text-sm font-medium text-red-600">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
};

export default UserDropdown;