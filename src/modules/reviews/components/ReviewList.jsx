// src/modules/reviews/components/ReviewList.jsx

import React from 'react';
import ReviewCard from './ReviewCard';
import { PLACEHOLDERS } from '../types/review.types';

/**
 * @component ReviewList
 * @description Lista paginada de reviews con manejo de estados
 * Sincronizado con paginación del backend (review.service.js)
 */
const ReviewList = ({
  reviews = [],
  pagination = {},
  loading = false,
  error = null,
  onEdit,
  onDelete,
  onMarkHelpful,
  onReport,
  onPageChange,
  showActions = true
}) => {
  
  // Estado de carga
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/4" />
                <div className="h-3 bg-gray-300 rounded w-1/6" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-full" />
              <div className="h-4 bg-gray-300 rounded w-5/6" />
              <div className="h-4 bg-gray-300 rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Sin reviews
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {PLACEHOLDERS.NO_REVIEWS}
        </h3>
        <p className="text-gray-600">
          Sé el primero en compartir tu opinión sobre este producto
        </p>
      </div>
    );
  }

  // Renderizar paginación
  const renderPagination = () => {
    const { current, pages } = pagination;
    
    if (!pages || pages <= 1) return null;

    const pageNumbers = [];
    const maxVisible = 5;
    
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(pages, startPage + maxVisible - 1);
    
    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        {/* Botón anterior */}
        <button
          onClick={() => onPageChange(current - 1)}
          disabled={current === 1}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Anterior
        </button>

        {/* Primera página */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="text-gray-500">...</span>}
          </>
        )}

        {/* Páginas */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 border rounded-lg ${
              page === current
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}

        {/* Última página */}
        {endPage < pages && (
          <>
            {endPage < pages - 1 && <span className="text-gray-500">...</span>}
            <button
              onClick={() => onPageChange(pages)}
              className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {pages}
            </button>
          </>
        )}

        {/* Botón siguiente */}
        <button
          onClick={() => onPageChange(current + 1)}
          disabled={current === pages}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente →
        </button>
      </div>
    );
  };

  return (
    <div>
      {/* Información de resultados */}
      {pagination.total > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          Mostrando {((pagination.current - 1) * pagination.limit) + 1} - {Math.min(pagination.current * pagination.limit, pagination.total)} de {pagination.total} reviews
        </div>
      )}

      {/* Lista de reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            onEdit={onEdit}
            onDelete={onDelete}
            onMarkHelpful={onMarkHelpful}
            onReport={onReport}
            showActions={showActions}
          />
        ))}
      </div>

      {/* Paginación */}
      {renderPagination()}
    </div>
  );
};

export default ReviewList;