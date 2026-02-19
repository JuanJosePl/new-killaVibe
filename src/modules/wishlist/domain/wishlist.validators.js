/**
 * @module wishlist.validators
 * @description Validaciones puras del dominio Wishlist.
 *
 * Estas funciones son la lógica de validación real.
 * El schema Yup existente (wishlist.schema.js) puede ser un wrapper fino
 * sobre estas funciones para integrarse con formularios React.
 *
 * NO importa nada de React, Yup, Zustand, ni APIs.
 * Es JavaScript puro, testeable en aislamiento total.
 */

// ============================================================================
// VALIDADORES PRIMITIVOS
// ============================================================================

/**
 * Verifica si un string tiene el formato de MongoDB ObjectId.
 * 24 caracteres hexadecimales.
 *
 * @param {*} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Verifica si un valor es un array no vacío.
 *
 * @param {*} value
 * @returns {boolean}
 */
export const isNonEmptyArray = (value) => {
  return Array.isArray(value) && value.length > 0;
};

// ============================================================================
// VALIDADORES DE ENTIDADES
// ============================================================================

/**
 * Valida los datos para agregar un item a la wishlist.
 *
 * Sincronizado con el contrato del backend (wishlist.validation.js → addItemValidation).
 * Si el backend cambia su contrato, este es el único lugar a actualizar en frontend.
 *
 * @param {Object} itemData - Datos del item a agregar
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateAddItem = (itemData) => {
  const errors = [];

  if (!itemData || typeof itemData !== 'object') {
    return { valid: false, errors: ['Los datos del item son requeridos'] };
  }

  // productId: requerido, formato ObjectId
  if (!itemData.productId) {
    errors.push('El ID del producto es requerido');
  } else if (!isValidObjectId(String(itemData.productId))) {
    errors.push('El ID del producto no tiene un formato válido');
  }

  // notifyPriceChange: opcional, debe ser boolean si se provee
  if (
    itemData.notifyPriceChange !== undefined &&
    typeof itemData.notifyPriceChange !== 'boolean'
  ) {
    errors.push('notifyPriceChange debe ser un valor booleano');
  }

  // notifyAvailability: opcional, debe ser boolean si se provee
  if (
    itemData.notifyAvailability !== undefined &&
    typeof itemData.notifyAvailability !== 'boolean'
  ) {
    errors.push('notifyAvailability debe ser un valor booleano');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida los IDs para mover items al carrito.
 *
 * @param {string[]} productIds - Array de IDs de productos
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateMoveToCart = (productIds) => {
  const errors = [];

  if (!isNonEmptyArray(productIds)) {
    return {
      valid: false,
      errors: ['Debes seleccionar al menos un producto'],
    };
  }

  const invalidIds = productIds.filter(id => !isValidObjectId(String(id)));
  if (invalidIds.length > 0) {
    errors.push(`IDs de producto inválidos: ${invalidIds.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Valida un item del guest wishlist (formato localStorage).
 * Más permisivo que validateAddItem porque los datos de localStorage
 * pueden tener formatos legacy.
 *
 * @param {Object} guestItem
 * @returns {{ valid: boolean, errors: string[] }}
 */
export const validateGuestItem = (guestItem) => {
  const errors = [];

  if (!guestItem || typeof guestItem !== 'object') {
    return { valid: false, errors: ['El item guest no es un objeto válido'] };
  }

  if (!guestItem.productId) {
    errors.push('El item guest no tiene productId');
  } else if (!isValidObjectId(String(guestItem.productId))) {
    errors.push(`productId inválido en item guest: ${guestItem.productId}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// REGLAS DE NEGOCIO
// ============================================================================

/**
 * Verifica si un producto puede ser agregado a la wishlist.
 * Encapsula todas las reglas de negocio del lado cliente.
 *
 * El backend tiene su propia validación (autoridad final),
 * pero esta verificación permite dar feedback inmediato al usuario.
 *
 * @param {import('./wishlist.model').Wishlist} wishlist - Estado actual
 * @param {string} productId - ID del producto a agregar
 * @returns {{ canAdd: boolean, reason: string|null }}
 */
export const canAddToWishlist = (wishlist, productId) => {
  if (!isValidObjectId(String(productId))) {
    return { canAdd: false, reason: 'ID de producto inválido' };
  }

  if (!wishlist || !Array.isArray(wishlist.items)) {
    // Si no hay wishlist inicializada, permitimos (el backend decidirá)
    return { canAdd: true, reason: null };
  }

  const alreadyExists = wishlist.items.some(
    item => item.productId === String(productId)
  );

  if (alreadyExists) {
    return { canAdd: false, reason: 'El producto ya está en tu lista de deseos' };
  }

  return { canAdd: true, reason: null };
};

/**
 * Verifica si un item puede ser movido al carrito.
 * Extrae y unifica la lógica de canMoveToCart de wishlistHelpers.js.
 *
 * @param {import('./wishlist.model').WishlistItem} item
 * @returns {{ canMove: boolean, reason: string }}
 */
export const canMoveItemToCart = (item) => {
  if (!item) return { canMove: false, reason: 'Item no encontrado' };

  // Sin datos de producto populado, no podemos verificar disponibilidad
  if (!item.product) {
    return { canMove: false, reason: 'Información del producto no disponible' };
  }

  const product = item.product;

  // Verificar nombre mínimo (producto corrupto)
  if (!product.name && !product.title) {
    return { canMove: false, reason: 'Datos del producto incompletos' };
  }

  // Priorizar isAvailable del item (calculado por el backend)
  const available = item.isAvailable ?? product.isAvailable ?? (product.stock > 0);

  if (!available) return { canMove: false, reason: 'Producto no disponible' };
  if (product.stock === 0) return { canMove: false, reason: 'Sin stock' };

  return { canMove: true, reason: '' };
};

// ============================================================================
// HELPER: CONVERTIR ERRORES DE DOMINIO A MENSAJES UI
// ============================================================================

/**
 * Toma un resultado de validación y retorna el primer error como string,
 * o null si es válido. Útil para mostrar mensajes en formularios.
 *
 * @param {{ valid: boolean, errors: string[] }} validationResult
 * @returns {string|null}
 */
export const getFirstError = (validationResult) => {
  if (validationResult.valid) return null;
  return validationResult.errors[0] || 'Error de validación';
};

export default {
  isValidObjectId,
  isNonEmptyArray,
  validateAddItem,
  validateMoveToCart,
  validateGuestItem,
  canAddToWishlist,
  canMoveItemToCart,
  getFirstError,
};