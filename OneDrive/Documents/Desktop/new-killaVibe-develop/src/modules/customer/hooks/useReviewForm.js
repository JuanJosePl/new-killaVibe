// src/modules/customer/hooks/useReviewForm.js

import { useState, useCallback } from 'react';
import { useCustomerReviews } from '../context/CustomerReviewsContext';

/**
 * @hook useReviewForm
 * @description Hook para manejar formularios de reviews (crear/editar)
 * 
 * Responsabilidades:
 * - Estado del formulario (rating, title, comment, images)
 * - Validación de campos
 * - Submit (create/update)
 * - Manejo de errores
 * - Reset del formulario
 * 
 * Validaciones:
 * - Rating: 1-5 (requerido)
 * - Title: max 100 chars (opcional)
 * - Comment: min 10, max 1000 chars (requerido)
 * - Images: max 5 (opcional)
 * 
 * @param {Object} options
 * @param {string} options.productId - ID del producto (para crear)
 * @param {Object} options.initialData - Datos iniciales (para editar)
 * @param {Function} options.onSuccess - Callback al completar exitosamente
 * @param {Function} options.onError - Callback en caso de error
 * 
 * @returns {Object} Estado y acciones del formulario
 */
const useReviewForm = (options = {}) => {
  const {
    productId,
    initialData = null,
    onSuccess,
    onError,
  } = options;

  const { createReview, updateReview } = useCustomerReviews();

  // Estado del formulario
  const [formData, setFormData] = useState({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    comment: initialData?.comment || '',
    images: initialData?.images || [],
  });

  // Estado de validación
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Estado de UI
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Modo: 'create' o 'edit'
  const isEditMode = !!initialData;

  /**
   * Actualizar un campo del formulario
   * 
   * @param {string} field - Nombre del campo
   * @param {*} value - Nuevo valor
   */
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo al escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null,
      }));
    }
  }, [errors]);

  /**
   * Marcar campo como tocado (para mostrar errores)
   * 
   * @param {string} field - Nombre del campo
   */
  const touchField = useCallback((field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  /**
   * Validar rating
   * 
   * @param {number} rating - Valor a validar
   * @returns {string|null} Mensaje de error o null
   */
  const validateRating = useCallback((rating) => {
    if (!rating || rating < 1 || rating > 5) {
      return 'Debes seleccionar una calificación entre 1 y 5';
    }
    return null;
  }, []);

  /**
   * Validar title
   * 
   * @param {string} title - Valor a validar
   * @returns {string|null} Mensaje de error o null
   */
  const validateTitle = useCallback((title) => {
    if (title && title.length > 100) {
      return 'El título no puede tener más de 100 caracteres';
    }
    return null;
  }, []);

  /**
   * Validar comment
   * 
   * @param {string} comment - Valor a validar
   * @returns {string|null} Mensaje de error o null
   */
  const validateComment = useCallback((comment) => {
    const trimmed = comment?.trim() || '';
    
    if (!trimmed) {
      return 'El comentario es requerido';
    }
    
    if (trimmed.length < 10) {
      return 'El comentario debe tener al menos 10 caracteres';
    }
    
    if (trimmed.length > 1000) {
      return 'El comentario no puede tener más de 1000 caracteres';
    }
    
    return null;
  }, []);

  /**
   * Validar images
   * 
   * @param {Array} images - Array de imágenes
   * @returns {string|null} Mensaje de error o null
   */
  const validateImages = useCallback((images) => {
    if (images && images.length > 5) {
      return 'Máximo 5 imágenes por review';
    }
    return null;
  }, []);

  /**
   * Validar todo el formulario
   * 
   * @returns {Object} Objeto con errores { field: message }
   */
  const validateForm = useCallback(() => {
    const newErrors = {};

    const ratingError = validateRating(formData.rating);
    if (ratingError) newErrors.rating = ratingError;

    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    const commentError = validateComment(formData.comment);
    if (commentError) newErrors.comment = commentError;

    const imagesError = validateImages(formData.images);
    if (imagesError) newErrors.images = imagesError;

    return newErrors;
  }, [formData, validateRating, validateTitle, validateComment, validateImages]);

  /**
   * Agregar imagen al formulario
   * 
   * @param {Object} image - { url, alt }
   */
  const addImage = useCallback((image) => {
    setFormData(prev => {
      const newImages = [...prev.images, image];
      
      // Validar max 5 imágenes
      if (newImages.length > 5) {
        setErrors(prev => ({
          ...prev,
          images: 'Máximo 5 imágenes por review',
        }));
        return prev;
      }

      return {
        ...prev,
        images: newImages,
      };
    });
  }, []);

  /**
   * Eliminar imagen del formulario
   * 
   * @param {number} index - Índice de la imagen a eliminar
   */
  const removeImage = useCallback((index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));

    // Limpiar error de imágenes si existía
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: null,
      }));
    }
  }, [errors.images]);

  /**
   * Reset del formulario a estado inicial
   */
  const resetForm = useCallback(() => {
    setFormData({
      rating: initialData?.rating || 0,
      title: initialData?.title || '',
      comment: initialData?.comment || '',
      images: initialData?.images || [],
    });
    setErrors({});
    setTouched({});
    setSubmitError(null);
  }, [initialData]);

  /**
   * Submit del formulario (create o update)
   * 
   * @returns {Promise<Object>} Review creada/actualizada
   */
  const handleSubmit = useCallback(async () => {
    // Validar formulario
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Marcar todos los campos como tocados
      setTouched({
        rating: true,
        title: true,
        comment: true,
        images: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      let result;

      if (isEditMode) {
        // Actualizar review existente
        result = await updateReview(initialData._id, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
          images: formData.images,
        });
      } else {
        // Crear nueva review
        if (!productId) {
          throw new Error('productId es requerido para crear una review');
        }

        result = await createReview(productId, {
          rating: formData.rating,
          title: formData.title,
          comment: formData.comment,
          images: formData.images,
        });
      }

      // Callback de éxito
      if (onSuccess) {
        onSuccess(result);
      }

      return result;

    } catch (error) {
      console.error('Error submitting review:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Error al guardar la review';

      setSubmitError(errorMessage);

      // Callback de error
      if (onError) {
        onError(error);
      }

      throw error;

    } finally {
      setIsSubmitting(false);
    }
  }, [
    formData,
    productId,
    isEditMode,
    initialData,
    validateForm,
    createReview,
    updateReview,
    onSuccess,
    onError,
  ]);

  // Valores computados
  const isValid = Object.keys(validateForm()).length === 0;
  const isDirty = isEditMode
    ? formData.rating !== initialData.rating ||
      formData.title !== initialData.title ||
      formData.comment !== initialData.comment ||
      JSON.stringify(formData.images) !== JSON.stringify(initialData.images)
    : formData.rating > 0 || formData.comment.trim().length > 0;

  const characterCount = formData.comment.length;
  const characterLimit = 1000;
  const characterRemaining = characterLimit - characterCount;

  return {
    // Estado del formulario
    formData,
    errors,
    touched,
    
    // Estado de UI
    isSubmitting,
    submitError,
    isValid,
    isDirty,
    isEditMode,
    
    // Contadores
    characterCount,
    characterLimit,
    characterRemaining,
    
    // Acciones de campos
    updateField,
    touchField,
    
    // Acciones de imágenes
    addImage,
    removeImage,
    
    // Acciones del formulario
    handleSubmit,
    resetForm,
    
    // Validadores individuales (por si se necesitan)
    validateRating,
    validateTitle,
    validateComment,
    validateImages,
  };
};

export default useReviewForm;