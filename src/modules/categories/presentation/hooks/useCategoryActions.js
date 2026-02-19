/**
 * @hook useCategoryActions
 * @description Hook para mutaciones CRUD de categorías (ADMIN ONLY).
 *
 * Delega toda la lógica de negocio al store → service → repository.
 * El hook es sólo un bridge entre UI y el store.
 *
 * @param {Function} [onSuccess] - (message: string, entity: CategoryEntity) => void
 * @param {Function} [onError]   - (error: CategoryDomainError) => void
 */

import { useCallback } from 'react';
import {
  useCategoriesStore,
  selectActionLoading,
  selectActionError,
  selectDetailLoading,
  selectDetailError,
} from '../store/categories.store.js';

const useCategoryActions = (onSuccess = null, onError = null) => {
  // Store bindings
  const createCategory  = useCategoriesStore((s) => s.createCategory);
  const updateCategory  = useCategoriesStore((s) => s.updateCategory);
  const removeCategory  = useCategoriesStore((s) => s.removeCategory);
  const fetchBySlug     = useCategoriesStore((s) => s.fetchBySlug);
  const clearErrors     = useCategoriesStore((s) => s.clearErrors);

  const actionLoading   = useCategoriesStore(selectActionLoading);
  const actionError     = useCategoriesStore(selectActionError);
  const detailLoading   = useCategoriesStore(selectDetailLoading);
  const detailError     = useCategoriesStore(selectDetailError);

  /* ── Crear ──────────────────────────────────────────────────────── */

  const create = useCallback(async (data) => {
    try {
      const entity = await createCategory(data);
      onSuccess?.('Categoría creada exitosamente.', entity);
      return entity;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [createCategory, onSuccess, onError]);

  /* ── Actualizar ─────────────────────────────────────────────────── */

  const update = useCallback(async (categoryId, data) => {
    try {
      const entity = await updateCategory(categoryId, data);
      onSuccess?.('Categoría actualizada exitosamente.', entity);
      return entity;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [updateCategory, onSuccess, onError]);

  /* ── Eliminar ───────────────────────────────────────────────────── */

  const remove = useCallback(async (categoryId) => {
    try {
      const result = await removeCategory(categoryId);
      onSuccess?.('Categoría eliminada exitosamente.', { categoryId });
      return result;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [removeCategory, onSuccess, onError]);

  /* ── Obtener por Slug ───────────────────────────────────────────── */

  const getBySlug = useCallback(async (slug) => {
    try {
      const entity = await fetchBySlug(slug);
      return entity;
    } catch (err) {
      onError?.(err);
      throw err;
    }
  }, [fetchBySlug, onError]);

  /* ── Utilidades ─────────────────────────────────────────────────── */

  const clearError = useCallback(() => clearErrors(), [clearErrors]);

  return {
    // Mutaciones
    create,
    update,
    remove,
    getBySlug,

    // Estados de carga
    loading        : actionLoading || detailLoading,
    actionLoading,
    detailLoading,

    // Errores
    error          : actionError || detailError,
    actionError,
    detailError,

    // Utils
    clearError,
  };
};

export default useCategoryActions;