import * as Yup from 'yup';
import { CART_LIMITS, SHIPPING_METHODS } from '../types/cart.types';

/**
 * @module CartSchemas
 * @description Validaciones Yup sincronizadas con cart.validation.js (Joi)
 * 
 * SINCRONIZACIÓN 100% CON BACKEND
 * Backend usa Joi, frontend usa Yup
 * Reglas idénticas
 */

/**
 * SCHEMA: Agregar Item al Carrito
 * 
 * BACKEND: addItemValidation (cart.validation.js)
 * 
 * @type {Yup.ObjectSchema}
 */
export const addItemSchema = Yup.object({
  productId: Yup.string()
    .required('El ID del producto es requerido'),
  
  quantity: Yup.number()
    .integer('La cantidad debe ser un número entero')
    .min(CART_LIMITS.MIN_QUANTITY, `La cantidad mínima es ${CART_LIMITS.MIN_QUANTITY}`)
    .max(CART_LIMITS.MAX_QUANTITY, `La cantidad máxima es ${CART_LIMITS.MAX_QUANTITY}`)
    .default(1),
  
  attributes: Yup.object({
    size: Yup.string().nullable().default(null),
    color: Yup.string().nullable().default(null),
    material: Yup.string().nullable().default(null),
    custom: Yup.mixed().nullable().default(null)
  }).default({})
});

/**
 * SCHEMA: Actualizar Cantidad de Item
 * 
 * BACKEND: updateQuantityValidation (cart.validation.js)
 * 
 * @type {Yup.ObjectSchema}
 */
export const updateQuantitySchema = Yup.object({
  quantity: Yup.number()
    .integer('La cantidad debe ser un número entero')
    .min(CART_LIMITS.MIN_QUANTITY, `La cantidad mínima es ${CART_LIMITS.MIN_QUANTITY}`)
    .max(CART_LIMITS.MAX_QUANTITY, `La cantidad máxima es ${CART_LIMITS.MAX_QUANTITY}`)
    .required('La cantidad es requerida'),
  
  attributes: Yup.object({
    size: Yup.string().nullable().default(null),
    color: Yup.string().nullable().default(null),
    material: Yup.string().nullable().default(null)
  }).default({})
});

/**
 * SCHEMA: Aplicar Cupón
 * 
 * BACKEND: applyCouponValidation (cart.validation.js)
 * 
 * @type {Yup.ObjectSchema}
 */
export const applyCouponSchema = Yup.object({
  code: Yup.string()
    .required('El código de cupón es requerido')
    .trim()
    .uppercase()
    .max(CART_LIMITS.MAX_COUPON_LENGTH, `El código no puede exceder ${CART_LIMITS.MAX_COUPON_LENGTH} caracteres`)
});

/**
 * SCHEMA: Actualizar Dirección de Envío
 * 
 * BACKEND: updateShippingAddressValidation (cart.validation.js)
 * 
 * @type {Yup.ObjectSchema}
 */
export const updateShippingAddressSchema = Yup.object({
  firstName: Yup.string()
    .required('El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  
  lastName: Yup.string()
    .required('El apellido es requerido')
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  
  email: Yup.string()
    .email('Email inválido')
    .required('El email es requerido'),
  
  phone: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^[0-9+\-\s()]+$/, 'Teléfono inválido')
    .min(8, 'El teléfono debe tener al menos 8 dígitos'),
  
  street: Yup.string()
    .required('La dirección es requerida')
    .min(5, 'La dirección debe tener al menos 5 caracteres')
    .max(100, 'La dirección no puede exceder 100 caracteres'),
  
  city: Yup.string()
    .required('La ciudad es requerida')
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(50, 'La ciudad no puede exceder 50 caracteres'),
  
  state: Yup.string()
    .required('El estado/provincia es requerido')
    .min(2, 'El estado debe tener al menos 2 caracteres')
    .max(50, 'El estado no puede exceder 50 caracteres'),
  
  zipCode: Yup.string()
    .required('El código postal es requerido')
    .matches(/^[0-9A-Za-z\s\-]+$/, 'Código postal inválido')
    .min(3, 'El código postal debe tener al menos 3 caracteres')
    .max(10, 'El código postal no puede exceder 10 caracteres'),
  
  country: Yup.string()
    .required('El país es requerido')
    .min(2, 'El país debe tener al menos 2 caracteres')
    .max(50, 'El país no puede exceder 50 caracteres'),
  
  isDefault: Yup.boolean().default(false)
});

/**
 * SCHEMA: Actualizar Método de Envío
 * 
 * BACKEND: updateShippingMethodValidation (cart.validation.js)
 * 
 * @type {Yup.ObjectSchema}
 */
export const updateShippingMethodSchema = Yup.object({
  method: Yup.string()
    .oneOf(
      Object.values(SHIPPING_METHODS),
      'Método de envío inválido'
    )
    .required('El método de envío es requerido'),
  
  cost: Yup.number()
    .min(0, 'El costo no puede ser negativo')
    .default(0)
});

/**
 * FUNCIONES DE VALIDACIÓN HELPER
 */

/**
 * Valida datos de item antes de agregar
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError} Si validación falla
 */
export const validateAddItem = async (data) => {
  return await addItemSchema.validate(data, { abortEarly: false, stripUnknown: true });
};

/**
 * Valida actualización de cantidad
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError} Si validación falla
 */
export const validateUpdateQuantity = async (data) => {
  return await updateQuantitySchema.validate(data, { abortEarly: false, stripUnknown: true });
};

/**
 * Valida código de cupón
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError} Si validación falla
 */
export const validateCoupon = async (data) => {
  return await applyCouponSchema.validate(data, { abortEarly: false, stripUnknown: true });
};

/**
 * Valida dirección de envío
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError} Si validación falla
 */
export const validateShippingAddress = async (data) => {
  return await updateShippingAddressSchema.validate(data, { abortEarly: false, stripUnknown: true });
};

/**
 * Valida método de envío
 * @param {Object} data - Datos a validar
 * @returns {Promise<Object>} Datos validados
 * @throws {Yup.ValidationError} Si validación falla
 */
export const validateShippingMethod = async (data) => {
  return await updateShippingMethodSchema.validate(data, { abortEarly: false, stripUnknown: true });
};

/**
 * Formatea errores de Yup para UI
 * @param {Yup.ValidationError} error - Error de Yup
 * @returns {Object} { field: message }
 */
export const formatValidationErrors = (error) => {
  if (!error.inner || error.inner.length === 0) {
    return { general: error.message };
  }

  return error.inner.reduce((acc, err) => {
    acc[err.path] = err.message;
    return acc;
  }, {});
};

export default {
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
  updateShippingAddressSchema,
  updateShippingMethodSchema,
  validateAddItem,
  validateUpdateQuantity,
  validateCoupon,
  validateShippingAddress,
  validateShippingMethod,
  formatValidationErrors
};