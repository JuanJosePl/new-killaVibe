// modules/search/presentation/components/SearchSuggestions.jsx
//
// Despliega lista de sugerencias de búsqueda.
// Recibe datos ya validados — sin lógica de dominio.

import React from 'react';

/**
 * @component SearchSuggestions
 * @description Lista de sugerencias de autocompletado.
 *
 * @param {Object}   props
 * @param {SuggestionEntity[]} props.suggestions
 * @param {string}   props.query          - Query actual (para highlight)
 * @param {Function} props.onSelect       - (suggestion: string) => void
 * @param {boolean}  [props.isLoading=false]
 */
export function SearchSuggestions({ suggestions, query, onSelect, isLoading = false }) {
  if (isLoading) {
    return (
      <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 overflow-hidden">
        {[1, 2, 3].map(i => (
          <li key={i} className="px-4 py-3 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </li>
        ))}
      </ul>
    );
  }

  if (!suggestions.length) return null;

  return (
    <ul
      role="listbox"
      aria-label="Sugerencias de búsqueda"
      className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1 overflow-hidden max-h-64 overflow-y-auto"
    >
      {suggestions.map((item, idx) => (
        <li
          key={idx}
          role="option"
          onClick={() => onSelect(item.suggestion)}
          className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors group"
        >
          {/* Icono de búsqueda */}
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Texto con highlight del prefijo */}
          <span className="flex-1 text-sm text-gray-700">
            <HighlightedText text={item.suggestion} highlight={query} />
          </span>

          {/* Popularidad (solo si hay valor) */}
          {item.popularity > 0 && (
            <span className="text-xs text-gray-400 flex-shrink-0">
              {item.popularity.toLocaleString('es-ES')}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Resalta la porción de texto que coincide con el query.
 * No usa innerHTML para prevenir XSS.
 */
function HighlightedText({ text, highlight }) {
  if (!highlight || !text) return <>{text}</>;

  const lowerText  = text.toLowerCase();
  const lowerQuery = highlight.toLowerCase().trim();
  const idx        = lowerText.indexOf(lowerQuery);

  if (idx === -1) return <>{text}</>;

  return (
    <>
      {text.slice(0, idx)}
      <strong className="font-semibold text-gray-900">
        {text.slice(idx, idx + lowerQuery.length)}
      </strong>
      {text.slice(idx + lowerQuery.length)}
    </>
  );
}

export default SearchSuggestions;