/**
 * @module CategoriesService
 * @description Capa de aplicación del dominio Category.
 *
 * RESPONSABILIDADES:
 * - Orquestar operaciones de dominio complejas
 * - Aplicar reglas de negocio antes de delegar al repositorio
 * - Construir árbol jerárquico y breadcrumbs
 * - Filtrar categorías activas
 * - Nunca conoce React, Zustand, hooks ni el store
 *
 * Es la única puerta de entrada al dominio desde la capa de presentación.
 */

import categoriesRepository from '../infrastructure/categories.repository.js';
import { CategoryEntity }   from '../domain/category.entity.js';
import { FlatCategory }     from '../domain/category.model.js';
import {
  canDelete,
  getDeleteBlockReason,
  wouldCreateCycle,
  isDepthAllowed,
  isNameTaken,
} from '../domain/category.rules.js';
import {
  validateCreatePayload,
  validateUpdatePayload,
  validateSearchQuery,
} from '../domain/category.validators.js';
import {
  CategoryValidationError,
  CategoryCycleError,
  CategoryDepthError,
  CategoryDeleteBlockedError,
  CategoryNameConflictError,
} from '../domain/category.errors.js';

/* ─── Servicio ───────────────────────────────────────────────────── */

const categoriesService = {
  /* ── Consultas ──────────────────────────────────────────────────── */

  /**
   * Obtener listado paginado de categorías.
   */
  async getAll(params = {}) {
    return categoriesRepository.getAll({
      withProductCount: true, // siempre solicitamos conteo al backend
      ...params,
    });
  },

  /**
   * Obtener árbol jerárquico de categorías.
   */
  async getTree() {
    return categoriesRepository.getTree();
  },

  /**
   * Obtener categorías destacadas.
   */
  async getFeatured(limit = 6) {
    return categoriesRepository.getFeatured(limit);
  },

  /**
   * Obtener categorías populares.
   */
  async getPopular(limit = 10) {
    return categoriesRepository.getPopular(limit);
  },

  /**
   * Buscar categorías con validación previa.
   */
  async search(query) {
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      throw new CategoryValidationError({ q: validation.error });
    }
    return categoriesRepository.search(query);
  },

  /**
   * Obtener categoría por slug (con SEO y breadcrumb pre-calculados).
   */
  async getBySlug(slug) {
    return categoriesRepository.getBySlug(slug);
  },

  /**
   * Obtener contexto SEO de una categoría.
   */
  async getSEOContext(categoryId) {
    return categoriesRepository.getSEOContext(categoryId);
  },

  /* ── Mutaciones (Admin) ─────────────────────────────────────────── */

  /**
   * Crear nueva categoría con validación de dominio completa.
   *
   * @param {Object} data - Datos del formulario
   * @param {CategoryEntity[]} [allCategories=[]] - Lista actual (para reglas de unicidad y jerarquía)
   */
  async create(data, allCategories = []) {
    // 1. Validación de estructura
    const validation = validateCreatePayload(data);
    if (!validation.valid) {
      throw new CategoryValidationError(validation.errors);
    }

    // 2. Unicidad de nombre (cliente)
    if (isNameTaken(data.name, allCategories)) {
      throw new CategoryNameConflictError(data.name);
    }

    // 3. Reglas de jerarquía
    if (data.parentCategory) {
      if (!isDepthAllowed(data.parentCategory, allCategories)) {
        throw new CategoryDepthError(3);
      }
    }

    return categoriesRepository.create(data);
  },

  /**
   * Actualizar categoría con validación de dominio completa.
   *
   * @param {string} categoryId
   * @param {Object} data - Campos a actualizar
   * @param {CategoryEntity[]} [allCategories=[]]
   */
  async update(categoryId, data, allCategories = []) {
    if (!categoryId) {
      throw new CategoryValidationError({ _root: 'ID de categoría requerido.' });
    }

    // 1. Validación de estructura
    const validation = validateUpdatePayload(data);
    if (!validation.valid) {
      throw new CategoryValidationError(validation.errors);
    }

    // 2. Unicidad de nombre (excluye el propio ID)
    if (data.name && isNameTaken(data.name, allCategories, categoryId)) {
      throw new CategoryNameConflictError(data.name);
    }

    // 3. Reglas de jerarquía
    if (data.parentCategory) {
      if (wouldCreateCycle(categoryId, data.parentCategory, allCategories)) {
        throw new CategoryCycleError(categoryId, data.parentCategory);
      }
      if (!isDepthAllowed(data.parentCategory, allCategories)) {
        throw new CategoryDepthError(3);
      }
    }

    return categoriesRepository.update(categoryId, data);
  },

  /**
   * Eliminar categoría con validación de regla de negocio.
   *
   * @param {string} categoryId
   * @param {CategoryEntity} category - Entidad para evaluar si puede eliminarse
   */
  async remove(categoryId, category) {
    if (!categoryId) {
      throw new CategoryValidationError({ _root: 'ID de categoría requerido.' });
    }

    if (category instanceof CategoryEntity && !canDelete(category)) {
      throw new CategoryDeleteBlockedError(getDeleteBlockReason(category));
    }

    return categoriesRepository.remove(categoryId);
  },

  /* ── Utilidades de Árbol (sin estado) ───────────────────────────── */

  /**
   * Convierte un árbol (CategoryTreeNode[]) en una lista plana (FlatCategory[]).
   * Utilidad sin estado para ser llamada una sola vez al cargar el árbol.
   *
   * @param {import('../domain/category.model.js').CategoryTreeNode[]} nodes
   * @param {number} level
   * @param {string[]} parentPath
   * @returns {FlatCategory[]}
   */
  flattenTree(nodes = [], level = 0, parentPath = []) {
    if (!Array.isArray(nodes)) return [];

    return nodes.reduce((acc, node) => {
      const path = [...parentPath, node.name];

      acc.push(new FlatCategory({
        _id         : node._id,
        name        : node.name,
        slug        : node.slug,
        level,
        parentPath,
        hasChildren : node.hasChildren,
        productCount: node.productCount,
      }));

      if (node.hasChildren) {
        acc.push(...categoriesService.flattenTree(node.children, level + 1, path));
      }

      return acc;
    }, []);
  },

  /**
   * Encuentra un nodo en el árbol por ID (búsqueda recursiva).
   * @param {string} id
   * @param {import('../domain/category.model.js').CategoryTreeNode[]} nodes
   */
  findInTree(id, nodes = []) {
    for (const node of nodes) {
      if (node._id === id) return node;
      if (node.hasChildren) {
        const found = categoriesService.findInTree(id, node.children);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Encuentra un nodo en el árbol por slug (búsqueda recursiva).
   */
  findInTreeBySlug(slug, nodes = []) {
    for (const node of nodes) {
      if (node.slug === slug) return node;
      if (node.hasChildren) {
        const found = categoriesService.findInTreeBySlug(slug, node.children);
        if (found) return found;
      }
    }
    return null;
  },

  /**
   * Calcula la profundidad máxima del árbol.
   */
  getMaxDepth(flatList = []) {
    if (flatList.length === 0) return 0;
    return Math.max(...flatList.map((c) => c.level)) + 1;
  },
};

export default categoriesService;