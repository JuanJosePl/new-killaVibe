/**
 * @module ReviewModel
 * @description Value objects y modelos de transferencia del dominio Review.
 *
 * Contiene estructuras tipadas que representan conceptos del dominio
 * sin lógica de persistencia ni de UI.
 */

/* ─── Constantes de Dominio ──────────────────────────────────────── */

export const RATING = { MIN: 1, MAX: 5 };

export const MODERATION_STATUS = Object.freeze({
  APPROVED : 'approved',
  PENDING  : 'pending',
  REJECTED : 'rejected',
});

export const MODERATOR_ROLES = Object.freeze(['admin', 'moderator']);

export const TEXT_LIMITS = Object.freeze({
  TITLE_MAX        : 100,
  COMMENT_MIN      : 10,
  COMMENT_MAX      : 1000,
  REPORT_REASON_MIN: 10,
  REPORT_REASON_MAX: 500,
  IMAGE_ALT_MAX    : 200,
});

export const IMAGE_LIMITS = Object.freeze({
  MAX_IMAGES    : 5,
  MAX_FILE_SIZE : 5 * 1024 * 1024,       // 5 MB
  ALLOWED_TYPES : ['image/jpeg', 'image/png', 'image/webp'],
});

export const SORT_OPTIONS = Object.freeze({
  NEWEST  : 'createdAt',
  RATING  : 'rating',
  HELPFUL : 'helpfulCount',
});

export const SORT_ORDER = Object.freeze({
  ASC : 'asc',
  DESC: 'desc',
});

export const DEFAULT_FILTERS = Object.freeze({
  page      : 1,
  limit     : 10,
  sortBy    : SORT_OPTIONS.NEWEST,
  sortOrder : SORT_ORDER.DESC,
});

export const REPORT_THRESHOLDS = Object.freeze({
  AUTO_MODERATE : 5,
  REVIEW_REQUIRED: 3,
});

/* ─── Review Image ───────────────────────────────────────────────── */

export class ReviewImage {
  constructor({ url = '', alt = 'Review image' } = {}) {
    this.url = url;
    this.alt = alt || 'Review image';
  }

  get isValid() {
    try { new URL(this.url); return true; }
    catch { return false; }
  }

  static fromRaw(raw) {
    return new ReviewImage(raw ?? {});
  }
}

/* ─── Review Stats ───────────────────────────────────────────────── */

export class ReviewStats {
  constructor(raw = {}) {
    this.average            = Number(raw.average            ?? 0);
    this.total              = Number(raw.total              ?? 0);
    this.verifiedPercentage = Number(raw.verifiedPercentage ?? 0);

    // distribution: { 5: n, 4: n, 3: n, 2: n, 1: n }
    this.distribution = {
      5: Number(raw.distribution?.[5] ?? 0),
      4: Number(raw.distribution?.[4] ?? 0),
      3: Number(raw.distribution?.[3] ?? 0),
      2: Number(raw.distribution?.[2] ?? 0),
      1: Number(raw.distribution?.[1] ?? 0),
    };
  }

  /** Average formateado con 1 decimal, e.g. "4.5" */
  get displayAverage() {
    return this.total === 0 ? '0.0' : this.average.toFixed(1);
  }

  /** Porcentaje de cada estrella sobre el total */
  get percentages() {
    if (this.total === 0) return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    return Object.fromEntries(
      [5, 4, 3, 2, 1].map((r) => [
        r,
        Math.round((this.distribution[r] / this.total) * 100),
      ])
    );
  }

  get isEmpty() { return this.total === 0; }

  static fromRaw(raw) {
    return new ReviewStats(raw ?? {});
  }

  static empty() {
    return new ReviewStats();
  }
}

/* ─── Review Pagination ──────────────────────────────────────────── */

export class ReviewPagination {
  constructor({ current = 1, pages = 1, total = 0, limit = 10 } = {}) {
    this.current = current;
    this.pages   = pages;
    this.total   = total;
    this.limit   = limit;
  }

  get hasMore() { return this.current < this.pages; }
  get hasPrev() { return this.current > 1; }
  get isFirst() { return this.current === 1; }
  get isLast()  { return this.current === this.pages; }

  /** Rango visible: "1 - 10 de 45 reviews" */
  get displayRange() {
    const start = (this.current - 1) * this.limit + 1;
    const end   = Math.min(this.current * this.limit, this.total);
    return `${start}–${end} de ${this.total}`;
  }

  static fromRaw(raw) {
    return new ReviewPagination({
      current : raw?.current ?? raw?.page    ?? 1,
      pages   : raw?.pages   ?? raw?.totalPages ?? 1,
      total   : raw?.total   ?? 0,
      limit   : raw?.limit   ?? 10,
    });
  }

  static empty() {
    return new ReviewPagination();
  }
}

/* ─── Review Filters ─────────────────────────────────────────────── */

export class ReviewFilters {
  constructor(raw = {}) {
    this.page      = Number(raw.page      ?? DEFAULT_FILTERS.page);
    this.limit     = Number(raw.limit     ?? DEFAULT_FILTERS.limit);
    this.sortBy    = raw.sortBy    ?? DEFAULT_FILTERS.sortBy;
    this.sortOrder = raw.sortOrder ?? DEFAULT_FILTERS.sortOrder;
    this.rating    = raw.rating    ? Number(raw.rating) : null;
    this.verified  = raw.verified  ?? null; // 'true' | null
  }

  /** Devuelve sólo los parámetros con valor para la query string */
  toQueryParams() {
    const params = {
      page      : this.page,
      limit     : this.limit,
      sortBy    : this.sortBy,
      sortOrder : this.sortOrder,
    };
    if (this.rating   !== null) params.rating   = this.rating;
    if (this.verified !== null) params.verified = this.verified;
    return params;
  }

  /** Si hay filtros no-default activos */
  get hasActiveFilters() {
    return (
      this.rating !== null             ||
      this.verified === 'true'         ||
      this.sortBy    !== DEFAULT_FILTERS.sortBy    ||
      this.sortOrder !== DEFAULT_FILTERS.sortOrder
    );
  }

  withPage(page) {
    return new ReviewFilters({ ...this, page });
  }

  static fromRaw(raw) {
    return new ReviewFilters(raw ?? {});
  }

  static defaults() {
    return new ReviewFilters();
  }
}

/* ─── Colores y UI helpers ───────────────────────────────────────── */

export const RATING_COLOR_CLASS = Object.freeze({
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-lime-500',
  5: 'text-green-500',
});

export const RATING_BAR_COLOR_CLASS = Object.freeze({
  5: 'bg-green-500',
  4: 'bg-green-500',
  3: 'bg-yellow-500',
  2: 'bg-red-500',
  1: 'bg-red-500',
});

export const REPORT_REASONS = Object.freeze({
  SPAM         : 'Spam o contenido irrelevante',
  OFFENSIVE    : 'Lenguaje ofensivo o inapropiado',
  FAKE         : 'Review falsa o fraudulenta',
  INAPPROPRIATE: 'Contenido inapropiado',
  COPYRIGHT    : 'Violación de derechos de autor',
  OTHER        : 'Otra razón',
});

export const SUCCESS_MESSAGES = Object.freeze({
  REVIEW_CREATED  : 'Review publicada exitosamente',
  REVIEW_UPDATED  : 'Review actualizada exitosamente',
  REVIEW_DELETED  : 'Review eliminada exitosamente',
  MARKED_HELPFUL  : 'Marcado como útil',
  REVIEW_REPORTED : 'Review reportada exitosamente',
  REVIEW_APPROVED : 'Review aprobada exitosamente',
  REVIEW_REJECTED : 'Review rechazada exitosamente',
});