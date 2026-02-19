/**
 * @module CategoryErrors
 * @description Errores tipados del dominio Category.
 *
 * Permite identificar el origen del error (dominio vs infraestructura vs red)
 * y manejarlos uniformemente en cualquier capa sin importar el framework.
 */

export class CategoryDomainError extends Error {
  constructor(message, code = 'CATEGORY_ERROR', details = null) {
    super(message);
    this.name    = 'CategoryDomainError';
    this.code    = code;
    this.details = details;
  }
}

/* ─── Errores de Validación ──────────────────────────────────────── */

export class CategoryValidationError extends CategoryDomainError {
  /**
   * @param {Record<string, string>} errors - Mapa campo → mensaje
   */
  constructor(errors = {}) {
    const first = Object.values(errors)[0] ?? 'Error de validación';
    super(first, 'VALIDATION_ERROR', errors);
    this.name   = 'CategoryValidationError';
    this.errors = errors;
  }

  /** Primer mensaje de error para mostrar en UI */
  get firstMessage() {
    return Object.values(this.errors)[0] ?? this.message;
  }

  /** Todos los mensajes como array */
  get allMessages() {
    return Object.values(this.errors);
  }
}

/* ─── Errores de No Encontrado ───────────────────────────────────── */

export class CategoryNotFoundError extends CategoryDomainError {
  constructor(identifier) {
    super(`Categoría no encontrada: "${identifier}"`, 'NOT_FOUND');
    this.name       = 'CategoryNotFoundError';
    this.identifier = identifier;
  }
}

/* ─── Errores de Jerarquía ───────────────────────────────────────── */

export class CategoryCycleError extends CategoryDomainError {
  constructor(categoryId, parentId) {
    super(
      `Asignar "${parentId}" como padre de "${categoryId}" crearía un ciclo.`,
      'CYCLE_DETECTED'
    );
    this.name       = 'CategoryCycleError';
    this.categoryId = categoryId;
    this.parentId   = parentId;
  }
}

export class CategoryDepthError extends CategoryDomainError {
  constructor(maxDepth) {
    super(
      `La jerarquía de categorías no puede superar ${maxDepth} niveles.`,
      'MAX_DEPTH_EXCEEDED'
    );
    this.name     = 'CategoryDepthError';
    this.maxDepth = maxDepth;
  }
}

/* ─── Errores de Eliminación ─────────────────────────────────────── */

export class CategoryDeleteBlockedError extends CategoryDomainError {
  constructor(reason) {
    super(reason, 'DELETE_BLOCKED');
    this.name = 'CategoryDeleteBlockedError';
  }
}

/* ─── Errores de Nombre Duplicado ────────────────────────────────── */

export class CategoryNameConflictError extends CategoryDomainError {
  constructor(name) {
    super(`Ya existe una categoría con el nombre "${name}".`, 'NAME_CONFLICT');
    this.name         = 'CategoryNameConflictError';
    this.conflictName = name;
  }
}

/* ─── Errores de Infraestructura (normalizados) ──────────────────── */

export class CategoryAPIError extends CategoryDomainError {
  /**
   * @param {Error|AxiosError} axiosErr - Error original de axios
   */
  constructor(axiosErr) {
    const status  = axiosErr?.response?.status;
    const message = axiosErr?.response?.data?.message
      ?? axiosErr?.message
      ?? 'Error de red desconocido';

    super(message, `API_${status ?? 'UNKNOWN'}`, axiosErr?.response?.data);
    this.name       = 'CategoryAPIError';
    this.httpStatus = status ?? null;
    this.original   = axiosErr;
  }

  get isNotFound()     { return this.httpStatus === 404; }
  get isConflict()     { return this.httpStatus === 409; }
  get isUnauthorized() { return this.httpStatus === 401; }
  get isForbidden()    { return this.httpStatus === 403; }
  get isBadRequest()   { return this.httpStatus === 400; }
}

/* ─── Factory para normalizar cualquier error ────────────────────── */

/**
 * Convierte cualquier error en un CategoryDomainError tipado.
 * Útil en repositorios y servicios para unificar el manejo de errores.
 */
export const normalizeCategoryError = (err) => {
  if (err instanceof CategoryDomainError) return err;

  // Axios error
  if (err?.response) {
    const api = new CategoryAPIError(err);
    if (api.isNotFound)  return new CategoryNotFoundError(err.config?.url ?? '?');
    if (api.isConflict)  return new CategoryNameConflictError('?');
    return api;
  }

  // Error genérico
  return new CategoryDomainError(err?.message ?? 'Error desconocido', 'UNKNOWN');
};