// src/modules/reviews/components/ReviewForm.jsx

import React, { useState, useEffect } from 'react';
import { createReviewSchema, updateReviewSchema } from '../schemas/review.schema';
import { TEXT_LIMITS, PLACEHOLDERS } from '../types/review.types';

/**
 * @component ReviewForm
 * @description Formulario para crear/editar reviews
 * Validaciones 100% sincronizadas con review.validation.js del backend
 */
const ReviewForm = ({ 
  productId,
  initialData = null,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const isEditMode = !!initialData;

  // Estado del formulario
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 5,
    title: initialData?.title || '',
    comment: initialData?.comment || '',
    images: initialData?.images || []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validar formulario con Yup
  const validateForm = async () => {
    try {
      const schema = isEditMode ? updateReviewSchema : createReviewSchema;
      await schema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      const validationErrors = {};
      err.inner.forEach((error) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  // Manejar cambios en inputs
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Manejar submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Contador de caracteres
  const commentLength = formData.comment.length;
  const commentRemaining = TEXT_LIMITS.COMMENT_MAX - commentLength;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Calificación <span className="text-red-500">*</span>
        </label>
        
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleChange('rating', star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <svg
                className={`w-10 h-10 ${
                  star <= formData.rating 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="ml-3 text-lg font-semibold text-gray-700">
            {formData.rating}.0
          </span>
        </div>
        
        {errors.rating && (
          <p className="mt-2 text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Título (opcional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título (opcional)
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder={PLACEHOLDERS.TITLE}
          maxLength={TEXT_LIMITS.TITLE_MAX}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500">
            {formData.title.length}/{TEXT_LIMITS.TITLE_MAX}
          </span>
          {errors.title && (
            <p className="text-xs text-red-600">{errors.title}</p>
          )}
        </div>
      </div>

      {/* Comentario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tu opinión <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.comment}
          onChange={(e) => handleChange('comment', e.target.value)}
          placeholder={PLACEHOLDERS.COMMENT}
          rows={6}
          maxLength={TEXT_LIMITS.COMMENT_MAX}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            errors.comment ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        
        <div className="flex justify-between mt-1">
          <div className="flex items-center gap-4">
            <span className={`text-xs ${
              commentLength < TEXT_LIMITS.COMMENT_MIN 
                ? 'text-red-500' 
                : commentRemaining < 100 
                  ? 'text-orange-500' 
                  : 'text-gray-500'
            }`}>
              {commentLength < TEXT_LIMITS.COMMENT_MIN 
                ? `Faltan ${TEXT_LIMITS.COMMENT_MIN - commentLength} caracteres`
                : `${commentLength}/${TEXT_LIMITS.COMMENT_MAX}`
              }
            </span>
          </div>
          
          {errors.comment && (
            <p className="text-xs text-red-600">{errors.comment}</p>
          )}
        </div>
      </div>

      {/* Imágenes (simplificado - solo URLs) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes (opcional)
        </label>
        <p className="text-sm text-gray-500 mb-3">
          Agrega hasta 5 imágenes para tu review
        </p>
        
        {formData.images.length < 5 && (
          <button
            type="button"
            onClick={() => {
              const url = prompt('Ingresa la URL de la imagen:');
              if (url) {
                handleChange('images', [...formData.images, { url, alt: '' }]);
              }
            }}
            className="px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
          >
            + Agregar imagen
          </button>
        )}

        {formData.images.length > 0 && (
          <div className="mt-3 grid grid-cols-5 gap-3">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newImages = formData.images.filter((_, i) => i !== index);
                    handleChange('images', newImages);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {errors.images && (
          <p className="mt-2 text-sm text-red-600">{errors.images}</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancelar
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSubmitting || isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Guardando...</span>
            </>
          ) : (
            <span>{isEditMode ? 'Actualizar review' : 'Publicar review'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;