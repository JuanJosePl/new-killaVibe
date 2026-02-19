/**
 * @module wishlist.schema
 * @description Adapter Yup → validadores de dominio.
 *
 * PROPÓSITO:
 * Este archivo es el único punto donde Yup existe en el módulo wishlist.
 * Es un wrapper delgado sobre wishlist.validators.js para integración
 * con formularios React que usen Formik, react-hook-form con Yup, etc.
 *
 * REEMPLAZA:
 * - wishlist.schema.js (anterior) — que contenía la lógica de validación real.
 *   La lógica ahora vive en domain/wishlist.validators.js.
 *
 * Si en el futuro se migra a Zod u otra librería de validación,
 * solo se cambia este archivo. wishlist.validators.js no cambia.
 *
 * CUÁNDO USAR ESTE ARCHIVO vs wishlist.validators.js:
 * - Formularios React con Yup resolver → usar este archivo
 * - Validación en store, hooks, o lógica de negocio → usar wishlist.validators.js
 */

import * as Yup from 'yup';
import {
  isValidObjectId,
  validateAddItem as domainValidateAddItem,
  validateMoveToCart as domainValidateMoveToCart,
} from '../domain/wishlist.validators';

// ============================================================================
// SCHEMAS YUP
// ============================================================================

/**
 * Schema Yup para agregar item a wishlist.
 * Sincronizado con addItemValidation del backend (wishlist.validation.js).
 */
export const addItemSchema = Yup.object({
  productId: Yup.string()
    .required('El ID del producto es requerido')
    .test(
      'is-valid-objectid',
      'El ID del producto no tiene un formato válido',
      value => !value || isValidObjectId(value)
    ),

  notifyPriceChange: Yup.boolean().default(false),
  notifyAvailability: Yup.boolean().default(false),
});

/**
 * Schema Yup para mover items al carrito.
 */
export const moveToCartSchema = Yup.object({
  productIds: Yup.array()
    .of(
      Yup.string().test(
        'is-valid-objectid',
        'ID de producto inválido',
        value => !value || isValidObjectId(value)
      )
    )
    .min(1, 'Debes seleccionar al menos un producto')
    .required('Los IDs de productos son requeridos'),
});

// ============================================================================
// VALIDADORES ASYNC (compatibles con el API anterior de wishlist.schema.js)
// ============================================================================

/**
 * Valida datos de item. Retorna datos validados o lanza Yup.ValidationError.
 * Mantiene compatibilidad con el uso anterior en useWishlistActions.
 *
 * @param {Object} itemData
 * @returns {Promise<Object>} Datos validados y con defaults aplicados
 * @throws {Yup.ValidationError}
 */
export const validateAddItem = async (itemData) => {
  return addItemSchema.validate(itemData, { abortEarly: false });
};

/**
 * Valida array de productIds. Retorna datos validados o lanza Yup.ValidationError.
 *
 * @param {string[]} productIds
 * @returns {Promise<Object>}
 * @throws {Yup.ValidationError}
 */
export const validateMoveToCart = async (productIds) => {
  return moveToCartSchema.validate({ productIds }, { abortEarly: false });
};

/**
 * Extrae mensajes de error de un Yup.ValidationError.
 * Mantiene compatibilidad con el uso anterior.
 *
 * @param {Yup.ValidationError} error
 * @returns {string[]}
 */
export const getValidationErrors = (error) => {
  if (error?.inner?.length > 0) {
    return error.inner.map(err => err.message);
  }
  return [error?.message || 'Error de validación'];
};

export default {
  addItemSchema,
  moveToCartSchema,
  validateAddItem,
  validateMoveToCart,
  getValidationErrors,
};