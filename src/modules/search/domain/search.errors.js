// modules/search/domain/search.errors.js

export class SearchDomainError extends Error {
  constructor(message, code) {
    super(message);
    this.name     = 'SearchDomainError';
    this.code     = code;
    this.isDomain = true;
  }
}

export class SearchQueryTooShortError extends SearchDomainError {
  constructor() {
    super('La búsqueda debe tener al menos 2 caracteres', 'SEARCH_QUERY_TOO_SHORT');
    this.name = 'SearchQueryTooShortError';
  }
}

export class SearchQueryInvalidError extends SearchDomainError {
  constructor(reason) {
    super(reason ?? 'Consulta de búsqueda inválida', 'SEARCH_QUERY_INVALID');
    this.name = 'SearchQueryInvalidError';
  }
}

export class SearchUnauthorizedError extends SearchDomainError {
  constructor() {
    super('Debes iniciar sesión para acceder a esta información', 'SEARCH_UNAUTHORIZED');
    this.name = 'SearchUnauthorizedError';
  }
}

export class SearchAdminForbiddenError extends SearchDomainError {
  constructor() {
    super('No tienes permisos para acceder a las estadísticas de búsqueda', 'SEARCH_ADMIN_FORBIDDEN');
    this.name = 'SearchAdminForbiddenError';
  }
}

/**
 * Mapear error HTTP a error de dominio tipado
 * @param {Error} apiError
 * @returns {SearchDomainError}
 */
export function mapApiErrorToDomain(apiError) {
  const status  = apiError?.response?.status;
  const message = apiError?.response?.data?.message ?? apiError?.message ?? 'Error desconocido';

  if (status === 401) return new SearchUnauthorizedError();
  if (status === 403) return new SearchAdminForbiddenError();
  if (status === 400) return new SearchQueryInvalidError(message);

  return new SearchDomainError(message, 'SEARCH_API_ERROR');
}