// modules/orders/domain/order.errors.js
//
// Errores del dominio Order. Permiten distinguir errores de dominio
// de errores de infraestructura o red.

export class OrderDomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name    = 'OrderDomainError';
    this.code    = code;
    this.isDomain = true;
  }
}

export class OrderNotFoundError extends OrderDomainError {
  constructor(orderId) {
    super(`Orden no encontrada${orderId ? `: ${orderId}` : ''}`, 'ORDER_NOT_FOUND');
    this.name = 'OrderNotFoundError';
  }
}

export class OrderCancelNotAllowedError extends OrderDomainError {
  constructor(reason) {
    super(reason ?? 'No se puede cancelar esta orden', 'ORDER_CANCEL_NOT_ALLOWED');
    this.name = 'OrderCancelNotAllowedError';
  }
}

export class OrderReturnNotAllowedError extends OrderDomainError {
  constructor(reason) {
    super(reason ?? 'No se puede devolver esta orden', 'ORDER_RETURN_NOT_ALLOWED');
    this.name = 'OrderReturnNotAllowedError';
  }
}

export class OrderValidationError extends OrderDomainError {
  constructor(errors) {
    const message = Array.isArray(errors) ? errors.join('; ') : errors;
    super(message, 'ORDER_VALIDATION_ERROR');
    this.name   = 'OrderValidationError';
    this.errors = Array.isArray(errors) ? errors : [errors];
  }
}

export class OrderUnauthorizedError extends OrderDomainError {
  constructor() {
    super('No tienes permiso para acceder a esta orden', 'ORDER_UNAUTHORIZED');
    this.name = 'OrderUnauthorizedError';
  }
}

/**
 * Convertir un error de API a un error de dominio tipado
 * @param {Error} apiError - Error proveniente de la API
 * @returns {OrderDomainError}
 */
export function mapApiErrorToDomain(apiError) {
  const status  = apiError?.response?.status;
  const message = apiError?.response?.data?.message ?? apiError?.message ?? 'Error desconocido';

  if (status === 404) return new OrderNotFoundError();
  if (status === 403 || status === 401) return new OrderUnauthorizedError();
  if (status === 400) return new OrderValidationError([message]);

  return new OrderDomainError(message, 'ORDER_API_ERROR');
}