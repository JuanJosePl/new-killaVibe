/**
 * @module wishlist.errors
 * @description Errores tipados del dominio Wishlist.
 *
 * Reemplaza la cadena: err.response?.data?.message || err.message || 'fallback'
 * dispersa en 6+ lugares del código actual.
 *
 * Con errores tipados, el store y los hooks pueden reaccionar
 * semánticamente en lugar de comparar strings.
 *
 * @example
 * try {
 *   await repository.addItem(data);
 * } catch (err) {
 *   if (err instanceof WishlistDuplicateError) {
 *     // Manejar duplicado específicamente (ej: no mostrar toast de error)
 *   } else if (err instanceof WishlistValidationError) {
 *     // Mostrar errores de validación al usuario
 *   } else {
 *     // Error genérico
 *   }
 * }
 */

// ============================================================================
// BASE ERROR
// ============================================================================

/**
 * Error base del dominio Wishlist.
 * Todos los errores de este módulo extienden de este.
 *
 * Provee:
 * - `name` para identificación en logs
 * - `code` para manejo programático
 * - `userMessage` para mostrar al usuario sin formateo adicional
 */
export class WishlistError extends Error {
  /**
   * @param {string} message     - Mensaje técnico (para logs y devs)
   * @param {string} code        - Código de error para manejo programático
   * @param {string} userMessage - Mensaje para mostrar al usuario final
   */
  constructor(message, code, userMessage) {
    super(message);
    this.name = 'WishlistError';
    this.code = code;
    this.userMessage = userMessage || message;
  }
}

// ============================================================================
// ERRORES ESPECÍFICOS
// ============================================================================

/**
 * El producto ya existe en la wishlist.
 *
 * Mapeado desde: HTTP 409 del backend.
 * UI: No mostrar toast de error (es una condición esperada, no un fallo).
 */
export class WishlistDuplicateError extends WishlistError {
  constructor(productId) {
    super(
      `Product ${productId} already exists in wishlist`,
      'WISHLIST_DUPLICATE',
      'El producto ya está en tu lista de deseos'
    );
    this.name = 'WishlistDuplicateError';
    this.productId = productId;
  }
}

/**
 * Recurso no encontrado (wishlist o producto).
 *
 * Mapeado desde: HTTP 404 del backend.
 */
export class WishlistNotFoundError extends WishlistError {
  constructor(resource = 'wishlist') {
    super(
      `Wishlist resource not found: ${resource}`,
      'WISHLIST_NOT_FOUND',
      resource === 'wishlist'
        ? 'No se encontró tu lista de deseos'
        : 'Producto no encontrado en la lista de deseos'
    );
    this.name = 'WishlistNotFoundError';
    this.resource = resource;
  }
}

/**
 * Datos de entrada inválidos (validación fallida).
 *
 * Lanzado por validators antes de llamar al repository/API.
 */
export class WishlistValidationError extends WishlistError {
  /**
   * @param {string[]} errors - Lista de mensajes de error de validación
   */
  constructor(errors = []) {
    const firstError = errors[0] || 'Error de validación';
    super(
      `Wishlist validation failed: ${errors.join(', ')}`,
      'WISHLIST_VALIDATION',
      firstError
    );
    this.name = 'WishlistValidationError';
    this.errors = errors;
  }
}

/**
 * Error durante la sincronización guest → usuario autenticado.
 *
 * Lanzado cuando el proceso de sync falla de forma irrecuperable.
 * Nota: fallos parciales (algunos items no migrados) NO lanzan este error,
 * se reportan en el resultado de sync con `failedCount`.
 */
export class WishlistSyncError extends WishlistError {
  /**
   * @param {string} reason      - Razón técnica del fallo
   * @param {number} migratedCount - Cuántos items sí se migraron antes del fallo
   */
  constructor(reason, migratedCount = 0) {
    super(
      `Wishlist sync failed: ${reason}`,
      'WISHLIST_SYNC_ERROR',
      'Error al sincronizar tu lista de deseos. Tus items están guardados y se intentará de nuevo.'
    );
    this.name = 'WishlistSyncError';
    this.migratedCount = migratedCount;
  }
}

/**
 * Operación no permitida en el modo actual.
 *
 * Ejemplo: intentar `moveToCart` en modo guest,
 * o llamar a `getPriceChanges` sin autenticación.
 */
export class WishlistModeError extends WishlistError {
  /**
   * @param {string} operation - Nombre de la operación intentada
   * @param {string} mode      - Modo actual ('guest' | 'authenticated')
   */
  constructor(operation, mode) {
    super(
      `Operation "${operation}" not available in ${mode} mode`,
      'WISHLIST_MODE_ERROR',
      mode === 'guest'
        ? 'Debes iniciar sesión para realizar esta acción'
        : 'Esta acción no está disponible'
    );
    this.name = 'WishlistModeError';
    this.operation = operation;
    this.mode = mode;
  }
}

/**
 * Error de red o servidor no controlado.
 *
 * Mapeado desde: HTTP 500, timeouts, o errores de red.
 */
export class WishlistNetworkError extends WishlistError {
  /**
   * @param {Error} originalError - Error original de axios/fetch
   */
  constructor(originalError) {
    super(
      `Wishlist network error: ${originalError?.message || 'unknown'}`,
      'WISHLIST_NETWORK_ERROR',
      'Error de conexión. Por favor intenta de nuevo.'
    );
    this.name = 'WishlistNetworkError';
    this.originalError = originalError;
  }
}

// ============================================================================
// FACTORY: HTTP → ERROR DE DOMINIO
// ============================================================================

/**
 * Transforma errores de axios/fetch en errores tipados del dominio.
 *
 * Este es el único lugar donde se interpreta `err.response?.data?.message`.
 * El resto del sistema solo maneja WishlistError y sus subclases.
 *
 * @param {Error} err          - Error crudo de axios o del adapter
 * @param {string} [productId] - ID del producto involucrado (para errores de duplicado)
 * @returns {WishlistError}    - Error de dominio tipado
 */
export const fromHttpError = (err, productId) => {
  const status = err.response?.status;

  switch (status) {
    case 409:
      return new WishlistDuplicateError(productId);

    case 404:
      return new WishlistNotFoundError(
        err.response?.data?.resource || 'product'
      );

    case 400: {
      const messages = err.response?.data?.errors ||
        [err.response?.data?.message || 'Error de validación'];
      return new WishlistValidationError(
        Array.isArray(messages) ? messages : [messages]
      );
    }

    case 401:
    case 403:
      return new WishlistModeError('api_call', 'guest');

    default:
      return new WishlistNetworkError(err);
  }
};

export default {
  WishlistError,
  WishlistDuplicateError,
  WishlistNotFoundError,
  WishlistValidationError,
  WishlistSyncError,
  WishlistModeError,
  WishlistNetworkError,
  fromHttpError,
};