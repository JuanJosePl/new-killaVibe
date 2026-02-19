/**
 * @module cart.schema
 * @description Wrapper Yup delgado sobre domain/cart.validators.js.
 *
 * Si se migra de Yup a Zod, solo este archivo cambia.
 * La lógica real de validación vive en domain/cart.validators.js.
 * Mantiene compatibilidad con el cart.schema.js anterior.
 */

import * as Yup from 'yup';
import { CART_LIMITS, SHIPPING_METHODS } from './domain/cart.constants';

export const addItemSchema = Yup.object({
  productId:  Yup.string().required('El ID del producto es requerido'),
  quantity:   Yup.number()
                 .integer('La cantidad debe ser un número entero')
                 .min(CART_LIMITS.MIN_QUANTITY)
                 .max(CART_LIMITS.MAX_QUANTITY)
                 .default(1),
  attributes: Yup.object({
    size:     Yup.string().nullable().default(null),
    color:    Yup.string().nullable().default(null),
    material: Yup.string().nullable().default(null),
  }).default({}),
});

export const updateQuantitySchema = Yup.object({
  quantity:   Yup.number()
                 .integer()
                 .min(CART_LIMITS.MIN_QUANTITY)
                 .max(CART_LIMITS.MAX_QUANTITY)
                 .required('La cantidad es requerida'),
  attributes: Yup.object().default({}),
});

export const applyCouponSchema = Yup.object({
  code: Yup.string()
           .required('El código de cupón es requerido')
           .trim()
           .uppercase()
           .max(CART_LIMITS.MAX_COUPON_LENGTH),
});

export const updateShippingMethodSchema = Yup.object({
  method: Yup.string()
             .oneOf(Object.values(SHIPPING_METHODS), 'Método de envío inválido')
             .required('El método de envío es requerido'),
  cost:   Yup.number().min(0).default(0),
});

export const updateShippingAddressSchema = Yup.object({
  firstName: Yup.string().required('El nombre es requerido').min(2).max(50),
  lastName:  Yup.string().required('El apellido es requerido').min(2).max(50),
  email:     Yup.string().email('Email inválido').required('El email es requerido'),
  phone:     Yup.string().required('El teléfono es requerido').min(8),
  street:    Yup.string().required('La dirección es requerida').min(5).max(100),
  city:      Yup.string().required('La ciudad es requerida').min(2).max(50),
  state:     Yup.string().required('El estado es requerido').min(2).max(50),
  zipCode:   Yup.string().required('El código postal es requerido').min(3).max(10),
  country:   Yup.string().required('El país es requerido').min(2).max(50),
  isDefault: Yup.boolean().default(false),
});

export const formatValidationErrors = (error) => {
  if (!error?.inner?.length) return { general: error?.message || 'Error de validación' };
  return error.inner.reduce((acc, e) => ({ ...acc, [e.path]: e.message }), {});
};

export default {
  addItemSchema,
  updateQuantitySchema,
  applyCouponSchema,
  updateShippingMethodSchema,
  updateShippingAddressSchema,
  formatValidationErrors,
};