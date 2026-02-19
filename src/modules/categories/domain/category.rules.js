/**
 * @module CategoryRules
 * @description Reglas de negocio del dominio Category.
 *
 * Contiene invariantes y políticas que deben cumplirse
 * independientemente de la capa que invoque la operación.
 * Sin estado, sin efectos secundarios, 100% puras.
 */

import { CategoryEntity } from './category.entity.js';

/* ─── Reglas de Estructura ───────────────────────────────────────── */

/**
 * Una categoría puede ser eliminada sólo si no tiene subcategorías
 * activas ni productos asociados.
 */
export const canDelete = (category) => {
  if (!(category instanceof CategoryEntity)) return false;
  return !category.hasSubcategories && !category.hasProducts;
};

/**
 * Razón por la que una categoría no puede ser eliminada.
 * Devuelve null si puede eliminarse.
 */
export const getDeleteBlockReason = (category) => {
  if (category.hasSubcategories) {
    return 'No se puede eliminar una categoría con subcategorías activas.';
  }
  if (category.hasProducts) {
    return 'No se puede eliminar una categoría con productos asociados.';
  }
  return null;
};

/* ─── Reglas de Jerarquía ────────────────────────────────────────── */

/**
 * Detecta si asignar `candidateParentId` como padre de `category`
 * generaría un ciclo en el árbol.
 *
 * @param {string} categoryId         - ID de la categoría a mover
 * @param {string} candidateParentId  - ID del nuevo padre candidato
 * @param {CategoryEntity[]} allCategories - Lista completa de entidades
 * @returns {boolean} true si hay ciclo
 */
export const wouldCreateCycle = (categoryId, candidateParentId, allCategories) => {
  if (!candidateParentId || candidateParentId === categoryId) {
    return candidateParentId === categoryId;
  }

  let current = allCategories.find((c) => c._id === candidateParentId);
  const visited = new Set();

  while (current) {
    if (visited.has(current._id)) break; // ya hay ciclo independiente
    if (current._id === categoryId) return true;
    visited.add(current._id);
    current = allCategories.find((c) => c._id === current.parentId);
  }

  return false;
};

/**
 * Valida que la profundidad del árbol no supere el límite (3 niveles).
 *
 * @param {string} parentId         - ID del padre candidato
 * @param {CategoryEntity[]} all    - Lista completa
 * @param {number} maxDepth         - Límite de profundidad (default 3)
 * @returns {boolean} true si la asignación es válida
 */
export const isDepthAllowed = (parentId, all, maxDepth = 3) => {
  if (!parentId) return true; // categoría raíz

  let depth = 1;
  let current = all.find((c) => c._id === parentId);

  while (current?.parentId) {
    depth++;
    if (depth >= maxDepth) return false;
    current = all.find((c) => c._id === current.parentId);
  }

  return true;
};

/* ─── Reglas de Estado ───────────────────────────────────────────── */

/**
 * Una categoría es publicable si está activa, publicada y su estado es 'active'.
 */
export const isPublishable = (category) => {
  return category.isActive && category.isPublished && category.status === 'active';
};

/**
 * Una categoría puede ser destacada sólo si ya es publicable.
 */
export const canBeFeatured = (category) => isPublishable(category);

/* ─── Reglas de Nombre ───────────────────────────────────────────── */

/**
 * Verifica si un nombre ya está en uso en la lista (case-insensitive).
 * Se excluye el ID de la propia entidad para permitir actualizaciones.
 */
export const isNameTaken = (name, allCategories, excludeId = null) => {
  const normalized = name.trim().toLowerCase();
  return allCategories.some(
    (c) => c.name.toLowerCase() === normalized && c._id !== excludeId
  );
};