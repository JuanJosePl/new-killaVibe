/**
 * @module ReviewErrors
 * @description Errores tipados del dominio Review.
 *
 * Jerarquía unificada que cubre errores de dominio, validación e infraestructura.
 * Permite identificar el origen y manejarlos uniformemente en cualquier capa.
 */

export class ReviewDomainError extends Error {
  constructor(message, code = 'REVIEW_ERROR', details = null) {
    super(message);
    this.name    = 'ReviewDomainError';
    this.code    = code;
    this.details = details;
  }
}

/* ─── Validación ─────────────────────────────────────────────────── */

export class ReviewValidationError extends ReviewDomainError {
  constructor(errors = {}) {
    const first = Object.values(errors)[0] ?? 'Error de validación';
    super(first, 'VALIDATION_ERROR', errors);
    this.name   = 'ReviewValidationError';
    this.errors = errors;
  }

  get firstMessage()  { return Object.values(this.errors)[0] ?? this.message; }
  get allMessages()   { return Object.values(this.errors); }
}

/* ─── No encontrado ──────────────────────────────────────────────── */

export class ReviewNotFoundError extends ReviewDomainError {
  constructor(id) {
    super(`Review no encontrada: "${id}"`, 'NOT_FOUND');
    this.name = 'ReviewNotFoundError';
    this.id   = id;
  }
}

/* ─── Permisos ───────────────────────────────────────────────────── */

export class ReviewUnauthorizedError extends ReviewDomainError {
  constructor(action = 'realizar esta acción') {
    super(`No tienes permiso para ${action}.`, 'UNAUTHORIZED');
    this.name = 'ReviewUnauthorizedError';
  }
}

/* ─── Unicidad ───────────────────────────────────────────────────── */

export class ReviewDuplicateError extends ReviewDomainError {
  constructor(productId) {
    super('Ya has publicado una review para este producto.', 'DUPLICATE_REVIEW');
    this.name      = 'ReviewDuplicateError';
    this.productId = productId;
  }
}

/* ─── Rating ─────────────────────────────────────────────────────── */

export class ReviewRatingError extends ReviewDomainError {
  constructor(rating) {
    super(`Rating inválido: ${rating}. Debe ser un entero entre 1 y 5.`, 'INVALID_RATING');
    this.name   = 'ReviewRatingError';
    this.rating = rating;
  }
}

/* ─── Moderación ─────────────────────────────────────────────────── */

export class ReviewModerationError extends ReviewDomainError {
  constructor(message) {
    super(message, 'MODERATION_ERROR');
    this.name = 'ReviewModerationError';
  }
}

/* ─── Infraestructura (errores de red normalizados) ──────────────── */

export class ReviewAPIError extends ReviewDomainError {
  constructor(axiosErr) {
    const status  = axiosErr?.response?.status;
    const message = axiosErr?.response?.data?.message
      ?? axiosErr?.message
      ?? 'Error de red desconocido';

    super(message, `API_${status ?? 'UNKNOWN'}`, axiosErr?.response?.data);
    this.name       = 'ReviewAPIError';
    this.httpStatus = status ?? null;
    this.original   = axiosErr;
  }

  get isNotFound()     { return this.httpStatus === 404; }
  get isConflict()     { return this.httpStatus === 409; }  // duplicate review
  get isUnauthorized() { return this.httpStatus === 401; }
  get isForbidden()    { return this.httpStatus === 403; }
  get isBadRequest()   { return this.httpStatus === 400; }
}

/* ─── Factory normalizador ───────────────────────────────────────── */

/**
 * Convierte cualquier error en un ReviewDomainError tipado.
 * Usar en repositorios y servicios para unificar el manejo.
 */
export const normalizeReviewError = (err) => {
  if (err instanceof ReviewDomainError) return err;

  if (err?.response) {
    const api = new ReviewAPIError(err);
    if (api.isNotFound)  return new ReviewNotFoundError('?');
    if (api.isConflict)  return new ReviewDuplicateError('?');
    if (api.isUnauthorized) return new ReviewUnauthorizedError();
    if (api.isForbidden) return new ReviewUnauthorizedError('modificar esta review');
    return api;
  }

  return new ReviewDomainError(err?.message ?? 'Error desconocido', 'UNKNOWN');
};