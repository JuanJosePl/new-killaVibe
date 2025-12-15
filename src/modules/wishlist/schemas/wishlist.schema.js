import * as Yup from 'yup';

/**
 * @module WishlistSchemas
 * @description Validaciones Yup para Wishlist
 * 
 * SINCRONIZADO 100% con wishlist.validation.js (Joi backend)
 */

/**
 * Schema para agregar item a wishlist
 * 
 * Coincide con:
 * - wishlist.validation.js -> addItemValidation
 */
export const addItemSchema = Yup.object({
  productId: Yup.string()
    .required('El ID del producto es requerido')
    .matches(/^[0-9a-fA-F]{24}$/, 'ID de producto inválido'),
  
  notifyPriceChange: Yup.boolean()
    .default(false),
  
  notifyAvailability: Yup.boolean()
    .default(false)
});

/**
 * Schema para mover items a carrito
 */
export const moveToCartSchema = Yup.object({
  productIds: Yup.array()
    .of(
      Yup.string()
        .matches(/^[0-9a-fA-F]{24}$/, 'ID de producto inválido')
    )
    .min(1, 'Debes seleccionar al menos un producto')
    .required('Los IDs de productos son requeridos')
});

/**
 * Validador para agregar item
 * 
 * @param {Object} itemData - Datos del item
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError}
 */
export const validateAddItem = async (itemData) => {
  try {
    return await addItemSchema.validate(itemData, { abortEarly: false });
  } catch (error) {
    throw error;
  }
};

/**
 * Validador para mover items a carrito
 * 
 * @param {Array} productIds - Array de IDs
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError}
 */
export const validateMoveToCart = async (productIds) => {
  try {
    return await moveToCartSchema.validate(
      { productIds }, 
      { abortEarly: false }
    );
  } catch (error) {
    throw error;
  }
};

/**
 * Helper para extraer errores de validación
 * 
 * @param {Yup.ValidationError} error
 * @returns {Array<string>} Mensajes de error
 */
export const getValidationErrors = (error) => {
  if (error.inner && error.inner.length > 0) {
    return error.inner.map(err => err.message);
  }
  return [error.message];
};

export default {
  addItemSchema,
  moveToCartSchema,
  validateAddItem,
  validateMoveToCart,
  getValidationErrors
};