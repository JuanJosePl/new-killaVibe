// src/modules/customer/layout/components/TopNavbar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserDropdown from './UserDropdown';
import SearchInput from './SearchInput';
import CartButton from './CartButton';

const TopNavbar = ({ onToggleSidebar, profile, cartItems, wishlistItems }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* DESKTOP NAVBAR */}
      <header className="hidden lg:block sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Search Input */}
            <SearchInput onSearch={() => navigate('/customer/products')} />

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Explore Button */}
              <button
                onClick={() => navigate('/customer/products')}
                className="relative p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                title="Explorar Productos"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🛍️</span>
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center text-xs font-bold text-amber-900 shadow-sm border-2 border-white animate-pulse">
                  !
                </div>
              </button>

              {/* Cart Button */}
              <CartButton
                count={cartItems}
                onClick={() => navigate('/customer/cart')}
              />

              {/* Wishlist Button */}
              <CartButton
                icon="❤️"
                count={wishlistItems}
                onClick={() => navigate('/customer/wishlist')}
                title="Favoritos"
              />

              {/* User Dropdown */}
              <UserDropdown profile={profile} />
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAVBAR */}
      <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-3.5">
          {/* Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-slate-100 transition-colors group"
          >
            <svg className="w-6 h-6 text-slate-900 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo */}
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            KillaVibes
          </h1>

          {/* Cart */}
          <div className="flex items-center gap-1">
            <CartButton
              count={cartItems}
              onClick={() => navigate('/customer/cart')}
              variant="mobile"
            />
          </div>
        </div>
      </header>
    </>
  );
};

export default TopNavbar;