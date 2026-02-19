/**
 * @module CategoriesRepository
 * @description Repositorio de categorías.
 *
 * ÚNICA capa que conecta la API (infraestructura) con el Dominio.
 *
 * RESPONSABILIDADES:
 * - Llamar a categoriesAPI
 * - Mapear respuestas crudas a CategoryEntity / modelos de dominio
 * - Normalizar paginación
 * - Convertir errores de red en errores de dominio tipados
 *
 * No conoce React, Zustand ni el store.
 * No contiene lógica de negocio (eso es responsabilidad del Service).
 */

import categoriesAPI from '../api/categories.api.js';
import { CategoryEntity }      from '../domain/category.entity.js';
import { CategoryTreeNode, CategoryPagination, CategorySEOContext } from '../domain/category.model.js';
import { normalizeCategoryError } from '../domain/category.errors.js';

/* ─── Helpers de mapeo ───────────────────────────────────────────── */

const toEntity = (raw) => CategoryEntity.fromRaw(raw);
const toTree   = (raw) => CategoryTreeNode.fromRaw(raw);

const mapList = (response, queryParams = {}) => {
  const rawArray = Array.isArray(response)
    ? response
    : Array.isArray(response?.data)
      ? response.data
      : [];

  const entities = rawArray.map(toEntity);

  const pagination = CategoryPagination.fromRaw(response?.pagination, {
    page  : queryParams.page  ?? 1,
    limit : queryParams.limit ?? 50,
    total : entities.length,
    pages : Math.ceil(entities.length / (queryParams.limit ?? 50)) || 1,
  });

  return { entities, pagination };
};

/* ─── Repositorio ────────────────────────────────────────────────── */

const categoriesRepository = {
  /**
   * Obtener listado paginado de categorías.
   * @returns {{ entities: CategoryEntity[], pagination: CategoryPagination }}
   */
  async getAll(params = {}) {
    try {
      const response = await categoriesAPI.getAll(params);
      return mapList(response, params);
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Obtener árbol jerárquico.
   * @returns {CategoryTreeNode[]}
   */
  async getTree() {
    try {
      const response = await categoriesAPI.getTree();
      const rawArray = Array.isArray(response?.data) ? response.data : [];
      return rawArray.map(toTree);
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Obtener categorías destacadas.
   * @returns {CategoryEntity[]}
   */
  async getFeatured(limit = 6) {
    try {
      const response = await categoriesAPI.getFeatured(limit);
      const raw = Array.isArray(response?.data) ? response.data : [];
      return raw.map(toEntity);
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Obtener categorías populares.
   * @returns {CategoryEntity[]}
   */
  async getPopular(limit = 10) {
    try {
      const response = await categoriesAPI.getPopular(limit);
      const raw = Array.isArray(response?.data) ? response.data : [];
      return raw.map(toEntity);
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Buscar categorías.
   * @returns {CategoryEntity[]}
   */
  async search(query) {
    try {
      const response = await categoriesAPI.search(query);
      const raw = Array.isArray(response?.data) ? response.data : [];
      return raw.map(toEntity);
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Obtener categoría por slug con detalle completo.
   * @returns {CategoryEntity}
   */
  async getBySlug(slug) {
    try {
      const response = await categoriesAPI.getBySlug(slug);

      // La API retorna { success, data: CategoryDetailDTO }
      const raw = response?.data ?? (response?._id ? response : null);

      if (!raw?._id) {
        const { CategoryNotFoundError } = await import('../domain/category.errors.js');
        throw new CategoryNotFoundError(slug);
      }

      return toEntity(raw);
    } catch (err) {
      if (err?.name?.includes('CategoryDomainError') || err?.name?.includes('CategoryNotFoundError')) {
        throw err;
      }
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Obtener contexto SEO de una categoría.
   * @returns {CategorySEOContext}
   */
  async getSEOContext(categoryId) {
    try {
      const response = await categoriesAPI.getSEOContext(categoryId);
      return CategorySEOContext.fromRaw(response?.data ?? {});
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Crear categoría (admin).
   * @returns {CategoryEntity}
   */
  async create(payload) {
    try {
      const response = await categoriesAPI.create(payload);
      return toEntity(response?.data ?? {});
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Actualizar categoría (admin).
   * @returns {CategoryEntity}
   */
  async update(categoryId, payload) {
    try {
      const response = await categoriesAPI.update(categoryId, payload);
      return toEntity(response?.data ?? {});
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },

  /**
   * Eliminar categoría (admin, soft delete).
   * @returns {{ success: boolean, message: string }}
   */
  async remove(categoryId) {
    try {
      const response = await categoriesAPI.remove(categoryId);
      return { success: response?.success ?? true, message: response?.message ?? 'Eliminada' };
    } catch (err) {
      throw normalizeCategoryError(err);
    }
  },
};

export default categoriesRepository;