// src/modules/customer/layout/components/SearchInput.jsx

import React, { useState } from 'react';

const SearchInput = ({ onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="flex-1 max-w-xl relative">
      <div className={`
        relative transition-all duration-300
        ${isFocused ? 'scale-[1.02]' : 'scale-100'}
      `}>
        {/* Search Icon */}
        <div className={`
          absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300
          ${isFocused ? 'text-indigo-600 scale-110' : 'text-slate-400'}
        `}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder="Buscar productos, categorías..."
          onClick={onSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full pl-11 pr-4 py-2.5 bg-slate-50 border-2 rounded-xl
            outline-none transition-all duration-300 font-medium text-sm
            placeholder:text-slate-400
            ${isFocused 
              ? 'border-indigo-500 ring-4 ring-indigo-500/20 bg-white shadow-lg' 
              : 'border-slate-200 hover:border-slate-300'}
          `}
        />

        {/* Shortcut Badge */}
        {!isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <kbd className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded font-mono">⌘K</kbd>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;