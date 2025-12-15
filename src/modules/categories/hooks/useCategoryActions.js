import { useState, useCallback } from 'react';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryBySlug,
} from '../api/categories.api';
import { createCategorySchema, updateCategorySchema } from '../schemas/category.schema';

/**
 * @hook useCategoryActions
 * @description Hook para acciones CRUD de categorías (ADMIN ONLY)
 * 
 * CARACTERÍSTICAS:
 * - Validación con Yup antes de enviar
 * - Manejo de errores 400/401/403/404/409/500
 * - Callbacks de éxito/error
 * - Loading states independientes por acción
 * 
 * @param {Function} onSuccess - Callback cuando acción exitosa
 * @param {Function} onError - Callback cuando acción falla
 * 
 * @returns {Object} Acciones y estados
 */
const useCategoryActions = (onSuccess, onError) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    create: false,
    update: false,
    delete: false,
    fetch: false,
  });

  /**
   * Manejo centralizado de errores
   */
  const handleError = useCallback((err, action) => {
    let errorMessage = 'Error desconocido';
    let errorCode = err.response?.status;

    if (err.response?.data) {
      errorMessage = err.response.data.message || errorMessage;
      
      // Si hay errores de validación múltiples
      if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = err.response.data.errors.join(', ');
      }
    } else if (err.message) {
      errorMessage = err.message;
    }

    const errorObj = {
      message: errorMessage,
      code: errorCode,
      action,
      details: err.response?.data,
    };

    setError(errorObj);
    console.error(`[useCategoryActions] ${action} error:`, err);

    if (onError) {
      onError(errorObj);
    }

    return errorObj;
  }, [onError]);

  /**
   * Crear nueva categoría
   */
  const create = useCallback(async (categoryData) => {
    setLoading(true);
    setActionLoading((prev) => ({ ...prev, create: true }));
    setError(null);

    try {
      // Validar con Yup
      await createCategorySchema.validate(categoryData, { abortEarly: false });

      // Llamar API
      const response = await createCategory(categoryData);

      if (onSuccess) {
        onSuccess(response.message, response.data);
      }

      return response.data;
    } catch (err) {
      // Si es error de validación de Yup
      if (err.name === 'ValidationError') {
        const validationErrors = err.inner.map((e) => e.message).join(', ');
        const validationError = {
          message: validationErrors,
          code: 400,
          action: 'create',
          isValidation: true,
        };
        setError(validationError);
        
        if (onError) {
          onError(validationError);
        }
        
        throw validationError;
      }

      throw handleError(err, 'create');
    } finally {
      setLoading(false);
      setActionLoading((prev) => ({ ...prev, create: false }));
    }
  }, [handleError, onSuccess, onError]);

  /**
   * Actualizar categoría existente
   */
  const update = useCallback(async (categoryId, updateData) => {
    if (!categoryId) {
      throw new Error('ID de categoría requerido');
    }

    setLoading(true);
    setActionLoading((prev) => ({ ...prev, update: true }));
    setError(null);

    try {
      // Validar con Yup
      await updateCategorySchema.validate(updateData, { abortEarly: false });

      // Llamar API
      const response = await updateCategory(categoryId, updateData);

      if (onSuccess) {
        onSuccess(response.message, response.data);
      }

      return response.data;
    } catch (err) {
      // Si es error de validación de Yup
      if (err.name === 'ValidationError') {
        const validationErrors = err.inner.map((e) => e.message).join(', ');
        const validationError = {
          message: validationErrors,
          code: 400,
          action: 'update',
          isValidation: true,
        };
        setError(validationError);
        
        if (onError) {
          onError(validationError);
        }
        
        throw validationError;
      }

      throw handleError(err, 'update');
    } finally {
      setLoading(false);
      setActionLoading((prev) => ({ ...prev, update: false }));
    }
  }, [handleError, onSuccess, onError]);

  /**
   * Eliminar categoría (soft delete)
   */
  const remove = useCallback(async (categoryId) => {
    if (!categoryId) {
      throw new Error('ID de categoría requerido');
    }

    setLoading(true);
    setActionLoading((prev) => ({ ...prev, delete: true }));
    setError(null);

    try {
      const response = await deleteCategory(categoryId);

      if (onSuccess) {
        onSuccess(response.message, { categoryId });
      }

      return response;
    } catch (err) {
      throw handleError(err, 'delete');
    } finally {
      setLoading(false);
      setActionLoading((prev) => ({ ...prev, delete: false }));
    }
  }, [handleError, onSuccess, onError]);

  /**
   * Obtener categoría por slug
   */
  const fetchBySlug = useCallback(async (slug) => {
    if (!slug) {
      throw new Error('Slug de categoría requerido');
    }

    setLoading(true);
    setActionLoading((prev) => ({ ...prev, fetch: true }));
    setError(null);

    try {
      const response = await getCategoryBySlug(slug);
      return response.data;
    } catch (err) {
      throw handleError(err, 'fetch');
    } finally {
      setLoading(false);
      setActionLoading((prev) => ({ ...prev, fetch: false }));
    }
  }, [handleError]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Verificar si una acción está en curso
   */
  const isActionLoading = useCallback((action) => {
    return actionLoading[action] || false;
  }, [actionLoading]);

  return {
    // Actions
    create,
    update,
    remove,
    fetchBySlug,
    
    // States
    loading,
    error,
    actionLoading,
    isActionLoading,
    
    // Utils
    clearError,
  };
};

export default useCategoryActions;