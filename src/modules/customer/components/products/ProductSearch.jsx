// src/modules/customer/components/products/ProductSearch.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * @component ProductSearch
 * @description Barra de búsqueda con autocompletado y sugerencias
 * 
 * Features:
 * - Búsqueda en tiempo real
 * - Debounce automático
 * - Sugerencias populares
 * - Historial de búsquedas
 * - Keyboard navigation
 */
const ProductSearch = ({ 
  onSearch, 
  onClear,
  initialQuery = '',
  placeholder = 'Buscar productos...',
  showSuggestions = true 
}) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  // Cargar historial del localStorage (en memoria para artifacts)
  useEffect(() => {
    // En artifacts, usamos estado en memoria
    const mockHistory = [
      'iPhone 14',
      'Samsung Galaxy',
      'MacBook Pro',
      'AirPods',
      'PlayStation 5'
    ];
    setHistory(mockHistory.slice(0, 5));
  }, []);

  // Sugerencias populares
  const popularSuggestions = [
    { query: 'Electrónica', icon: '📱' },
    { query: 'Ropa deportiva', icon: '👕' },
    { query: 'Hogar', icon: '🏠' },
    { query: 'Libros', icon: '📚' },
    { query: 'Juguetes', icon: '🎮' },
    { query: 'Belleza', icon: '💄' },
  ];

  // ============================================
  // HANDLERS
  // ============================================

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (value.trim().length >= 2) {
        onSearch?.(value);
        // Simular sugerencias
        setSuggestions(
          popularSuggestions
            .filter(s => s.query.toLowerCase().includes(value.toLowerCase()))
            .slice(0, 5)
        );
      } else {
        setSuggestions([]);
      }
    }, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      performSearch(query);
    }
  };

  const performSearch = (searchQuery) => {
    onSearch?.(searchQuery);
    setIsFocused(false);
    setSuggestions([]);
    
    // Agregar al historial
    if (searchQuery && !history.includes(searchQuery)) {
      setHistory(prev => [searchQuery, ...prev.slice(0, 4)]);
    }

    // Focus out
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setSelectedIndex(-1);
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.query || suggestion);
    performSearch(suggestion.query || suggestion);
  };

  // ============================================
  // KEYBOARD NAVIGATION
  // ============================================

  const handleKeyDown = (e) => {
    const items = [...(suggestions.length > 0 ? suggestions : history)];
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < items.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      const selected = items[selectedIndex];
      handleSuggestionClick(selected);
    } else if (e.key === 'Escape') {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="relative w-full">
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative flex items-center bg-white rounded-2xl border-2 transition-all duration-300
          ${isFocused 
            ? 'border-blue-600 ring-4 ring-blue-600/20 shadow-xl' 
            : 'border-gray-300 hover:border-gray-400'
          }
        `}>
          {/* Search Icon */}
          <div className="absolute left-4 flex items-center pointer-events-none">
            <svg 
              className={`w-5 h-5 transition-colors ${isFocused ? 'text-blue-600' : 'text-gray-400'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 bg-transparent outline-none text-gray-900 font-medium placeholder-gray-400"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors group"
            >
              <svg 
                className="w-4 h-4 text-gray-400 group-hover:text-gray-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-gray-200 shadow-2xl overflow-hidden z-50 animate-scale-in">
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Sugerencias
              </p>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${selectedIndex === index 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <span className="text-xl">{suggestion.icon}</span>
                  <span className="font-medium">{suggestion.query}</span>
                </button>
              ))}
            </div>
          )}

          {/* History */}
          {suggestions.length === 0 && history.length > 0 && (
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Búsquedas recientes
              </p>
              {history.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(item)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors
                    ${selectedIndex === index 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{item}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {suggestions.length === 0 && history.length === 0 && (
            <div className="p-2">
              <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Búsquedas populares
              </p>
              {popularSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <span className="text-xl">{suggestion.icon}</span>
                  <span className="font-medium">{suggestion.query}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSearch;