// src/modules/customer/components/reviews/ReviewModal.jsx

import React, { useState, useEffect } from 'react';

/**
 * @component ReviewModal
 * @description Modal para crear/editar reseña
 * 
 * @props {Object} review - Reseña existente (null si es nueva)
 * @props {Array} products - Lista de productos disponibles
 * @props {Function} onClose - Cerrar modal
 * @props {Function} onSubmit - Enviar reseña
 */
const ReviewModal = ({ review, products = [], onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    productId: review?.product || '',
    rating: review?.rating || 5,
    title: review?.title || '',
    comment: review?.comment || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isValid = formData.comment.trim().length >= 10 && formData.comment.length <= 1000;
  const isEdit = !!review;

  const handleSubmit = async () => {
    // Validaciones
    if (!isEdit && !formData.productId) {
      setError('Selecciona un producto');
      return;
    }

    if (!isValid) {
      setError('El comentario debe tener entre 10 y 1000 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar reseña');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <h3 className="text-2xl font-bold mb-4">
          {isEdit ? 'Editar Reseña' : 'Escribir Reseña'}
        </h3>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Product Selection */}
        {!isEdit && products.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Producto <span className="text-red-600">*</span>
            </label>
            <select
              value={formData.productId}
              onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
              disabled={isSubmitting}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            >
              <option value="">Selecciona un producto</option>
              {products.map((product) => (
                <option key={product.productId} value={product.productId}>
                  {product.productName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Rating */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Calificación <span className="text-red-600">*</span>
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setFormData({ ...formData, rating: star })}
                disabled={isSubmitting}
                className="text-4xl hover:scale-110 transition-transform disabled:opacity-50"
              >
                {star <= formData.rating ? '★' : '☆'}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {formData.rating} de 5 estrellas
          </p>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título (opcional)
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Resumen de tu experiencia"
            maxLength={100}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.title.length} / 100 caracteres
          </p>
        </div>

        {/* Comment */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comentario <span className="text-red-600">*</span>
          </label>
          <textarea
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            placeholder="Cuéntanos tu experiencia con este producto..."
            maxLength={1000}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-sm ${isValid ? 'text-green-600' : 'text-gray-500'}`}>
              {isValid ? '✓ Comentario válido' : 'Mínimo 10 caracteres'}
            </p>
            <p className="text-sm text-gray-500">
              {formData.comment.length} / 1000
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isValid || (!isEdit && !formData.productId)}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar Reseña' : 'Publicar Reseña'}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 font-semibold disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;